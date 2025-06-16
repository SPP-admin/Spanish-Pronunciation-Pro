# Class that contains letter(s) from Spanish text and their 
# corresponding IPA letter(s), and a boolean for pronunciation checking
# (true is pronounced correctly, false is incorrectly pronounced)
import string

class ipaMapping:
	def __init__(self, ortho_letter, ipa_letter):
		self.ortho_letter = ortho_letter
		self.ipa_letter = ipa_letter
		self.pronounced_correctly = True
		
# Class that contains sentence, a list of letter(s) with their corresponding IPA symbols
# index j in ipa_indices holds the IPA letter at j & the index of the ipaMapping that corresponds to it
# eg ipa_indices[0] = ("g", 2) means that "g" at ipa[0] corresponds to ipa_mapping[2] 
# (and the corresponding actually written text)
class sentenceMapping:
	def __init__(self, sentence):
		self.sentence = sentence
		self.ipa_mapping = ()
		self.ipa_indices = []

	# Returns IPA letters as a plain string
	def get_ipa(self):
		ipa_string = ""
		for mapping in self.ipa_mapping:
			ipa_string += mapping.ipa_letter
		return ipa_string

	def set_indices(self):
		indices = []
		index = 0
		for i in range(len(self.ipa_mapping)):
			mapping = self.ipa_mapping[index]
			if mapping.ipa_letter != "":
				if len(mapping.ipa_letter) == 1:
					indices.append([mapping.ipa_letter, index])
				elif len(mapping.ipa_letter) == 2:
					indices.append([mapping.ipa_letter, index])
					indices.append([mapping.ipa_letter, index])
				index += 1
			else:
				index += 1	
		self.ipa_indices = indices

	def get_indices(self):
		if not self.ipa_indices:
			self.set_indices()
		return self.ipa_indices
	
	def transliterate_latam(self):
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
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="s"))
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
					case "ñ":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="ɲ"))
					case "p":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="p"))
					case "r":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="ɾ"))
					case "s" | "z":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="s"))
					case "t":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="t"))
					case "w":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="w"))
					case "x":
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
		self.ipa_mapping = tuple(mapping)
		return(self.ipa_mapping)

	def transliterate_eu(self):
		# Differences from translit_latam: soft c, z -> (th) sound
		# hu -> (w) sound, ll -> stronger y sound

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
			elif (sentence[i:i+2] == "ze" or sentence[i:i+1] == "zi"):
				mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="θ"))
				mapping.append(ortho_letter=self.sentence[i+1], ipa_letter = sentence[i+1])
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
					case "s" | "z":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="s"))
					case "t":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="t"))
					case "w":
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter="w"))
					case "x":
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
					case _:
						mapping.append(ipaMapping(ortho_letter=self.sentence[i], ipa_letter=self.sentence[i]))
				i += 1
		self.ipa_mapping = tuple(mapping)
		return(self.ipa_mapping)