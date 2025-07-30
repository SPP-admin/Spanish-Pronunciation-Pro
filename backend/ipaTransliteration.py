# Class that contains letter(s) from Spanish text and their 
# corresponding IPA letter(s), and a boolean for pronunciation checking
# (true is pronounced correctly, false is incorrectly pronounced)
import string
import silabeador
ENYO_SOUND = "52"

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
# index i in syllable_mapping corresponds to the ith IPA mapping, and the start and end indices of the IPA mappings of its syllable
# eg syllable_mapping[0] = ("ks", 0, 2) means that the syllable that "ks" is in starts with the 0th IPA mapping, etc
class sentenceMapping:
	def __init__(self, sentence):
		self.sentence = sentence
		self.ipa_mapping = []
		self.ipa_indices = []
		self.syllable_mapping = []

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
	
	def get_syllable_mapping(self):
		return self.syllable_mapping
	
	# Returns index of first vowel in a given string
	def first_vowel(self):
		vowels = {"i", "y", "ɨ", "ʉ", "ɯ", "u", "ɪ", "ʏ", "ʊ", "e", "ø", "ɘ", "ɵ", "ɤ", "o", "e̞", "ø̞", "ə", "ɤ̞", "o̞", "ɛ", "œ", "ɜ", "ɞ", "ʌ", "ɔ", "æ", "ɐ", "a", "ɶ", "ä", "ɑ", "ɒ", "j", "w"}
		w = {'w', 'W'}
		for i in range(len(self.ipa_mapping)):
			if self.ipa_mapping[i].ipa_letter[0] in vowels and self.ipa_mapping[i].ortho_letter[0] not in w:
				return i
	
	# Get IPA transliteration of sentence in standard Latin American pronunciation,
	# Find which syllable of each word is stressed with silabeador,
	# Add stress to IPA mapping
	def transliterate_stress(self):
		# Get words in sentence
		words = self.sentence.split()
		sm = sentenceMapping(self.sentence)
		# Transliterate syllable by syllable,
		# Frankenstein the syllable mappings together,
		# add stress to IPA mapping of stressed syllable
		for word in words:
			sb = silabeador.Syllabification(word)
			syllables = sb.syllables
			stressed_syllable_index = sb.stress + len(syllables) if sb.stress < 0 else sb.stress

			for i in range(len(syllables)):
				syllable = sentenceMapping(syllables[i])
				syllable.transliterate_latam(is_stressed=True)
				# Set syllable_mapping 
				for j in syllable.ipa_mapping:
					if j.ipa_letter == ENYO_SOUND:
						j.ipa_letter = "nj"
					sm.syllable_mapping.append((j.ipa_letter, len(sm.ipa_mapping), len(syllable.ipa_mapping)))

				if (i == stressed_syllable_index and len(syllables) > 1):
					first_vowel_mapping = syllable.ipa_mapping[syllable.first_vowel()]
					first_vowel_mapping.ipa_letter = "ˈ" + first_vowel_mapping.ipa_letter

				sm.ipa_mapping.extend(syllable.ipa_mapping)

			# Add whitespace to mapping
			sm.ipa_mapping.append(ipaMapping(ortho_letter=" ", ipa_letter=""))
			sm.syllable_mapping.append(("", len(sm.ipa_mapping), 1))
		# Get rid of trailing whitespace
		if sm.ipa_mapping[-1].ortho_letter == " ":
			sm.ipa_mapping.pop(-1)

		self.ipa_mapping = sm.ipa_mapping
		self.syllable_mapping = sm.syllable_mapping
		return self.ipa_mapping
	
	def transliterate_latam(self, is_stressed=False):
		# Down the road, commas are used as delimiters so replace them with something that looks like a comma
		self.sentence = self.sentence.replace(",", "‚")

		# Preprocess sentence to all lowercase, remove acute accents
		sentence = self.sentence.lower()
		accent_remover = sentence.maketrans('áéíóú', 'aeiou')
		sentence = sentence.translate(accent_remover)
		mapping = []
		vowels = {'a', 'e', 'i', 'o', 'u'}
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
				# technically it makes [tʃ] sound but Azure transcribes it as one symbol so keep the lists the same length
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="ʃ"))
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
			elif (sentence[i:i+2] == "gü"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="g"))
				mapping.append(ipaMapping(ortho_letter=self.sentence[i+1], ipa_letter="w"))
				i += 2
			# This is technically not correct, but Whisper is bad at detecting [ʝ] so use [j] instead
			elif (sentence[i:i+2] == "hi" or sentence[i:i+2] == "ll"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i:i+2], ipa_letter="j"))
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
					case "ñ":
						if not is_stressed:
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="ɲ"))
						else:
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter=ENYO_SOUND))

					case "p":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="p"))
					case "r":
						if i == 0 or (not sentence[i-1].isalpha()) or sentence[i-1] in {'l', 'n', 's', 'z'}:
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="r"))
						else:
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
						if (i > 1 and i < len(sentence) - 2 and sentence[i-2:i+3] == "mexic"):
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="x"))
						elif (i < len(sentence) - 1 and not sentence[i+1] in vowels) or (i > 0 and not sentence[i-1].isalpha()) or i == 0:
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="s"))
						else:
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="ks"))
					case "a":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="a"))
					case "e":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="e"))
					case "i" | "y":
						if (sentence[i] == 'i' or (not_vowel(sentence, i-1) and not_vowel(sentence, i+1))):
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="i"))
						else:
							mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="j"))
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
		mapping = self.transliterate_latam()
		self.set_indices()
		# Differences from standard LatAm pronunciation: 
		# soft c and z pronounced as "th" sound

		for mapping in self.ipa_mapping:
			if mapping.ipa_letter == "s":
				if mapping.ortho_letter in {'z', 'Z', 'c', 'C'}:
					mapping.ipa_letter = "θ"
				
		return self.ipa_mapping
	
	# Argentinian Spanish
	def transliterate_rio(self):
		vowels = {"i", "y", "ɨ", "ʉ", "ɯ", "u", "ɪ", "ʏ", "ʊ", "e", "ø", "ɘ", "ɵ", "ɤ", "o", "e̞", "ø̞", "ə", "ɤ̞", "o̞", "ɛ", "œ", "ɜ", "ɞ", "ʌ", "ɔ", "æ", "ɐ", "a", "ɶ", "ä", "ɑ", "ɒ", "j", "w"}
		mapping = self.transliterate_latam()
		self.set_indices()
		ipa_string = self.get_ipa()
		# Differences from standard LatAm pronunciation: 
		# ll and y pronounced as "sh" sound
		# s is aspirated before consonant sounds

		for i in range(len(self.ipa_mapping)):
			mapping = self.ipa_mapping[i]
			if mapping.ipa_letter == "j":
				if mapping.ortho_letter.lower() in {'ll'}:
					mapping.ipa_letter = "ʃ"
				elif mapping.ortho_letter.lower() == 'y' and (i < len(self.ipa_mapping) - 1 and self.ipa_mapping[i+1].ortho_letter.isalpha()):
					mapping.ipa_letter = "ʃ"
			

		for i in range(1, len(ipa_string)):
			if ipa_string[i] == "s":
				if i < len(ipa_string) - 1:
					next_sound = self.ipa_mapping[self.ipa_indices[i + 1][1]].ipa_letter
					if next_sound in vowels:
						continue
					elif (self.ipa_mapping[self.ipa_indices[i][1] - 1].ortho_letter.isalpha()):
						self.ipa_mapping[self.ipa_indices[i][1]].ipa_letter = ""
				elif (i > 0 and self.ipa_mapping[self.ipa_indices[i][1] - 1].ortho_letter.isalpha()):
						self.ipa_mapping[self.ipa_indices[i][1]].ipa_letter = ""		
		self.set_indices()
		return self.ipa_mapping

# Puerto Rican Spanish
	def transliterate_pr(self):
		ipa_vowels = {"i", "y", "ɨ", "ʉ", "ɯ", "u", "ɪ", "ʏ", "ʊ", "e", "ø", "ɘ", "ɵ", "ɤ", "o", "e̞", "ø̞", "ə", "ɤ̞", "o̞", "ɛ", "œ", "ɜ", "ɞ", "ʌ", "ɔ", "æ", "ɐ", "a", "ɶ", "ä", "ɑ", "ɒ", "j", "w"}
		ortho_vowels = {'a', 'e', 'i', 'o', 'u', 'y', 'á', 'é', 'í', 'ó', 'ú'}
		self.transliterate_latam()
		self.set_indices()
		ipa_string = self.get_ipa()
		# Differences from standard LatAm pronunciation: 
		# r at end of syllables, before consonants pronounced as "l"
		# s is aspirated before consonant sounds
		# intervocalic and final d are deleted

		for i in range(1, len(self.ipa_mapping) - 1):
			mapping = self.ipa_mapping[i]
			prev_letter = self.ipa_mapping[i-1].ortho_letter[-1].lower()
			next_letter = self.ipa_mapping[i+1].ortho_letter.lower()
			if mapping.ortho_letter.lower() == "r":
				if prev_letter in ortho_vowels and consonant(next_letter) and next_letter.isalpha():
					mapping.ipa_letter = "l"
			elif mapping.ortho_letter.lower() == "d":
				if prev_letter in ortho_vowels and (next_letter in ortho_vowels or not next_letter.isalpha()):
					mapping.ipa_letter = ""
				
		# Edge case for last char
		if self.ipa_mapping[-1].ortho_letter.lower() == "d":
			self.ipa_mapping[-1].ipa_letter = ""

		for i in range(1, len(ipa_string)):
			if ipa_string[i] == "s":
				if i < len(ipa_string) - 1:
					next_sound = self.ipa_mapping[self.ipa_indices[i + 1][1]].ipa_letter
					if next_sound in ipa_vowels:
						continue
					elif (self.ipa_mapping[self.ipa_indices[i][1] - 1].ortho_letter.isalpha()):
						self.ipa_mapping[ self.ipa_indices[i][1] ].ipa_letter = ""
				elif (self.ipa_mapping[self.ipa_indices[i][1] - 1].ortho_letter.isalpha()):
						self.ipa_mapping[ self.ipa_indices[i][1] ].ipa_letter = ""
		self.set_indices()
		return self.ipa_mapping
	
def not_vowel(str, index):
	if index < 0 or index >= len(str):
		return True
	return str[index] not in {'a', 'e', 'i', 'o', 'u', 'y'}

def consonant(char):
	return char not in {'a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'}