# Class that contains letter(s) from Spanish text and their 
# corresponding IPA letter(s), and a boolean for pronunciation checking
# (true is pronounced correctly, false is incorrectly pronounced)
import string
import silabeador

class ipaMapping:
	def __init__(self, ortho_letter, ipa_letter):
		self.ortho_letter = ortho_letter
		self.ipa_letter = ipa_letter
		self.pronounced_correctly = True
		self.stressed_correctly = True

# Class that contains sentence, a list of letter(s) with their corresponding IPA symbols
# index j in ipa_indices holds the IPA letter at j & the index of the ipaMapping that corresponds to it
# eg ipa_indices[0] = ("g", 2) means that ipa[0] is "g" & corresponds to sentenceMapping.ipa_mapping[2] 
# (and the corresponding actually written text)
class sentenceMapping:
	def __init__(self, sentence):
		self.sentence = sentence
		self.ipa_mapping = []
		self.ipa_indices = []

	# Returns IPA letters as a plain string
	def get_ipa(self):
		ipa_string = ""
		for mapping in self.ipa_mapping:
			ipa_string += mapping.ipa_letter
		return ipa_string

	# ipa_indices is a way to get the corresponding written text for each IPA letter
	# ipa_indices[i] is the ith IPA symbol, which corresponds to ipa_mapping[ipa_indices[i][1]]
	def set_indices(self):
		indices = []
		index = 0
		for i in range(len(self.ipa_mapping)):
			mapping = self.ipa_mapping[index]
			if mapping.ipa_letter != "":
				for i in range(len(mapping.ipa_letter)):
					indices.append([mapping.ipa_letter, index])
				index += 1
			else:
				index += 1	
		self.ipa_indices = indices

	def get_indices(self):
		if not self.ipa_indices:
			self.set_indices()
		return self.ipa_indices
	
	# Returns index of first vowel in 
	def first_vowel(self):
		vowels = {"i", "y", "ɨ", "ʉ", "ɯ", "u", "ɪ", "ʏ", "ʊ", "e", "ø", "ɘ", "ɵ", "ɤ", "o", "e̞", "ø̞", "ə", "ɤ̞", "o̞", "ɛ", "œ", "ɜ", "ɞ", "ʌ", "ɔ", "æ", "ɐ", "a", "ɶ", "ä", "ɑ", "ɒ", "j", "w"}
		w = {'w', 'W'}
		for i in range(len(self.ipa_mapping)):
			if self.ipa_mapping[i].ipa_letter[0] in vowels and self.ipa_mapping[i].ortho_letter[0] not in w:
				return i
	
	# Get IPA transliteration of sentence in standard Latin American pronunciation,
	# Find which syllable of each word is stressed with silabeador,
	# Add stress to IPA mapping
	# IPA mapping will be list of syllables, since stress is syllable-based (eg ["ma", "go"] vs ["m", "a", "g", "o"])
	def transliterate_stress(self):
		# Get words in sentence
		words = self.sentence.split()
		word_starts = [0]
		sm = sentenceMapping(self.sentence)
		# Transliterate syllable by syllable,
		# Frankenstein the syllable mappings together,
		#  add stress to IPA mapping of stressed syllable
		for word in words:
			sb = silabeador.Syllabification(word)
			syllables = sb.syllables

			for i in range(len(syllables)):
				syllable_mapping = sentenceMapping(syllables[i])
				syllable_mapping.transliterate_latam()

				if (i == sb.stress + len(syllables) and len(syllables) > 1):
					sm.ipa_mapping[syllable_mapping.first_vowel()].ipa_letter = "'" + sm.ipa_mapping[-1].ipa_letter

				# Condense syllable into 1 chunk
				str = ""
				ipa_str = ""
				for mapping in syllable_mapping.ipa_mapping:
					str += mapping.ortho_letter
					ipa_str += mapping.ipa_mapping

				chunk = ipaMapping(str, ipa_str)
				sm.ipa_mapping.extend(chunk)
			
			# Add whitespace to mapping
			sm.ipa_mapping.append(ipaMapping(ortho_letter=" ", ipa_letter=""))


		# Get rid of trailing whitespace
		if sm.ipa_mapping[-1].ortho_letter == " ":
			sm.ipa_mapping.pop(-1)

	
	def transliterate_latam(self):
		# Down the road, commas are used as delimiters so replace them with something that looks like a comma
		self.sentence = self.sentence.replace(",", "‚")

		# Preprocess sentence to all lowercase, remove acute accents
		sentence = self.sentence.lower()
		accent_remover = sentence.maketrans('áéíóú', 'aeiou')
		sentence = sentence.translate(accent_remover)
		mapping = []
		vowels = {'a', 'e', 'i', 'o', 'u'}
		voiced_consonants = {'b', 'v', 'd', 'ga', 'go', 'gu', 'm', 'n', 'l', 'ñ', 'r', 'hu', 'hi', 'll', 'pt'}
		# Loop through string, match patterns to their sounds
		i = 0
		while i < len(sentence):
			if (sentence[i:i+3] == "gue"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="g"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+2], ipa_letter="e"))
				i += 3
			elif (sentence[i:i+2] == "gui"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="g"))
				if i < len(sentence) - 2 and sentence[i+2] in vowels:
					mapping.append(ipaMapping(ortho_letter=self.sentence[i+2], ipa_letter="j"))
				else:
					mapping.append(ipaMapping(ortho_letter=self.sentence[i+2], ipa_letter="i"))
				i += 2
			elif (sentence[i:i+2] == "ce"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="s"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter="e"))
				i += 2
			elif (sentence[i:i+2] == "ci"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="s"))
				if i < len(sentence) - 2 and sentence[i+2] in vowels:
					mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter="j"))
				else:
					mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter="i"))
				i += 2
			elif (sentence[i:i+2] == "ch"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="tʃ"))
				i += 2
			elif (sentence[i:i+2] == "ge"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="x"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter="e"))
				i += 2
			elif (sentence[i:i+2] == "gi"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="x"))
				if i < len(sentence) - 2 and sentence[i+2] in vowels:
					mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter="j"))
				else:
					mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter=sentence[i+1]))
				i += 2
			elif (sentence[i:i+2] == "gu" or sentence[i:i+2] == "gü"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="g"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter="w"))
				i += 2
			elif (sentence[i:i+2] == "hi" or sentence[i:i+2] == "ll"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="ʝ"))
				i += 2
			elif (sentence[i:i+2] == "qu"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="k"))
				self.ipa_indices.append([mapping[-1], len(mapping) - 1, len(mapping)])
				i += 2
			elif (sentence[i:i+2] == "rr"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="r"))
				i += 2
			elif(sentence[i:i+2] == "sh"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="ʃ"))
				i += 2
			elif (sentence[i:i+2] == "tl"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="t"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter = "ɬ"))
				i += 2
			elif (sentence[i:i+2] == "tx"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="t"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter = "ʃ"))
				i += 2
			elif (sentence[i:i+2] == "ia" or sentence[i:i+2] == "ie" or 
		 			sentence[i:i+2] == "io" or sentence[i:i+2] == "iu"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="j"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter = sentence[i+1]))
				i += 2
			elif (sentence[i:i+2] == "ua" or sentence[i:i+2] == "ue" or 
		 			sentence[i:i+2] == "ui" or sentence[i:i+2] == "uo"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="w"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter = sentence[i+1]))
				i += 2
			else:
				match sentence[i]:
					case "b" | "v":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="b"))
					case "c" | "k" | "q":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="k"))
					case "d":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="d"))
					case "f":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="f"))
					case "g":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="g"))
					case "h":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter=""))
					case "j":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="x"))
					case "l":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="l"))
					case "m":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="m"))
					case "n":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="n"))
					# Whisper is bad at detecting [ɲ] so use [nj] instead
					case "ñ":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="nj"))
					case "p":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="p"))
					case "r":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="ɾ"))
					case "s" | "z":
						if i < len(sentence) - 1 and (sentence[i+1] == "b" or sentence[i+1] == "d" 
													   or sentence[i+1] == "g"  or sentence[i+1] == "l"  or sentence[i+1] == "m"  
													   or sentence[i+1] == "n"):
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="z"))
						else:
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="s"))
					case "t":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="t"))
					case "w":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="w"))
					case "x":
						if i < len(sentence) - 1 and not sentence[i+1] in vowels:
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="s"))
						else:
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="ks"))
					case "a":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="a"))
					case "e":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="e"))
					case "i" | "y":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="i"))
					case "o":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="o"))
					case "u":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="u"))
					# Save punctuation & whitespace to be output to user, but not saved in IPA
					case _:
						mapping.append(ipaMapping(ortho_letter = self.sentence[i], ipa_letter=""))
				i += 1
		self.ipa_mapping = mapping
		return(self.ipa_mapping)

	def transliterate_eu(self):
		# Differences from translit_latam: soft c, z -> (th) sound
		# hu -> (w) sound, ll -> stronger y sound
		vowels = {'a', 'e', 'i', 'o', 'u'}
		# Preprocess sentence to all lowercase, remove acute accents
		sentence = self.sentence.lower()
		accent_remover = sentence.maketrans('áéíóú', 'aeiou')
		sentence = sentence.translate(accent_remover)
		mapping = []
		# Loop through string, match patterns to their sounds
		i = 0
		while i < len(sentence):
			if (sentence[i:i+3] == "gue" or sentence[i:i+3] == "gui"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="g"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+2], ipa_letter=sentence[i+2]))
				i += 3
			elif (sentence[i:i+2] == "ce" or sentence[i:i+2] == "ci"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="θ"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter=sentence[i+1]))
				i += 2
			elif (sentence[i:i+2] == "ch"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="tʃ"))
				i += 2
			elif (sentence[i:i+2] == "ge" or sentence[i:i+2] == "gi"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="x"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter=sentence[i+1]))
				i += 2
			elif (sentence[i:i+2] == "gu" or sentence[i:i+2] == "gü"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="g"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter="w"))
				i += 2
			elif (sentence[i:i+2] == "hi"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="ʝ"))
				i += 2
			elif (sentence[i:i+2] == "ll"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="ʎ"))
				i += 2
			elif (sentence[i:i+2] == "hu"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="w"))
				i += 2
			elif (sentence[i:i+2] == "qu"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="k"))
				i += 2
			elif (sentence[i:i+2] == "rr"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="r"))
				i += 2
			elif(sentence[i:i+2] == "sh"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="ʃ"))
				i += 2
			elif (sentence[i:i+2] == "tl"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="t"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter = "ɬ"))
				i += 2
			elif (sentence[i:i+2] == "tx"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="t"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter = "ʃ"))
				i += 2
			elif (sentence[i:i+2] == "ia" or sentence[i:i+2] == "ie" or 
		 			sentence[i:i+2] == "io" or sentence[i:i+2] == "iu"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="j"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter = sentence[i+1]))
				i += 2
			elif (sentence[i:i+2] == "ua" or sentence[i:i+2] == "ue" or 
		 			sentence[i:i+2] == "ui" or sentence[i:i+2] == "uo"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="w"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter = sentence[i+1]))
				i += 2
			else:
				match sentence[i]:
					case "b" | "v":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="b"))
					case "c" | "k" | "q":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="k"))
					case "d":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="d"))
					case "f":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="f"))
					case "g":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="g"))
					case "h":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter=""))
					case "j":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="x"))
					case "l":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="l"))
					case "m":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="m"))
					case "n":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="n"))
					case "ñ":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="ɲ"))
					case "p":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="p"))
					case "r":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="ɾ"))
					case "s":
						if i < len(sentence) and (sentence[i+1] == "b" or sentence[i+1] == "d" 
													   or sentence[i+1] == "g"  or sentence[i+1] == "l"  or sentence[i+1] == "m"  
													   or sentence[i+1] == "n"):
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="z"))
						else:
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="s"))
					case "t":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="t"))
					case "w":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="w"))
					case "x":
						if i < len(sentence) and not sentence[i+1] in vowels:
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="s"))
						else:
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="ks"))
					case "z":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="θ"))
					case "a":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="a"))
					case "e":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="e"))
					case "i" | "y":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="i"))
					case "o":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="o"))
					case "u":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="u"))
					case _:
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter=""))
				i += 1
		self.ipa_mapping = mapping
		return(self.ipa_mapping)