import string
import ipaTransliteration as epi
from difflib import SequenceMatcher
import whisperIPAtranscription as stress_tr

# Python translator to remove punctuation & whitespace
translator = str.maketrans('', '', string.punctuation + string.whitespace + 'ː' + 'ˑ' + "," + "ʼ" + "ˈ" + "ˌ")
stress_translator = str.maketrans('', '', string.whitespace + 'ː' + 'ˑ' + "," + "ʼ")

def correct_pronunciation(sentence, audio_path, dialect):
	user_ipa = stress_tr.transcribe(audio_path)
	print(user_ipa)
	user_ipa = remove_double_letters(user_ipa)
	user_ipa = preprocess_user_ipa(user_ipa)
	user_ipa = user_ipa.translate(translator)
	return compare_strings(sentence, user_ipa, dialect)

# Transcribe audio, return IPA without whitespace but retain stress markings
def transcribe_audio_with_stress(audio_path: str) -> str:
	ipa_transcription = stress_tr.transcribe_with_stress(audio_path)
	ipa_transcription = ipa_transcription.translate(stress_translator)
	return ipa_transcription	

# Compare user pronunciation to correct pronunciation,
# using difflib to find which symbols in correct pronunciation were pronounced incorrectly
# Convert index of symbols in correct pronunciation to index in sentence mapping with ipa_indices
# Opcodes are 5 tuples of form tag, i1, i2, j1, j2
# where the tag is replace/delete/insert/equal
# and user_ipa[i1:i2] should be replaced/deleted/inserted or equal (as tag says) with correct_ipa[j1:j2]
def compare_strings(sentence, user_ipa, dialect):
	sentence_mapping = epi.sentenceMapping(sentence)
	if dialect == 'latam':
		sentence_mapping.transliterate_latam()
	elif dialect == 'eu':
		sentence_mapping.transliterate_eu()
		correct_ipa = sentence_mapping.get_ipa()
	elif dialect == 'stress':
		sentence_mapping.transliterate_stress()
		correct_ipa = sentence_mapping.get_ipa()
	correct_ipa = sentence_mapping.get_ipa()
	print(correct_ipa)
	print(user_ipa)
	sentence_mapping.set_indices()
	sequence_matcher = SequenceMatcher(None, user_ipa, correct_ipa)
	opcode_list = sequence_matcher.get_opcodes()
	for opcode in opcode_list:
		# opcode[3] is index of first char in correct_ipa that deletion/insertion/replacement starts at
		# indices[opcode[3]] is (ipa letter, index in sentence mapping)
		if opcode[0] == 'delete':
			delete_incorrect(sentence_mapping, user_ipa[opcode[1]:opcode[2]], opcode[3])
		elif opcode[0] == 'insert' or opcode[0] == 'replace':
			insert_incorrect(sentence_mapping, user_ipa[opcode[1]:opcode[2]], correct_ipa, opcode[3], opcode[4])

	# Send output as array of written letter(s) followed by whether those letters were pronounced correctly
	output_str = []

	for ipa in sentence_mapping.ipa_mapping:
		if ipa.pronounced_correctly == False:
			output_str += [ipa.ortho_letter, "false"]
		#if ipa.stressed_correctly == False:
		#	output_str += '<u>' + ipa.ortho_letter + '</u>'
		elif ipa.pronounced_correctly == True:
			output_str += [ipa.ortho_letter, "true"]
		
	return output_str 
		
		
# if extra char between index -1 and index is vowel, mark prev IPA symbol as incorrect if it's a vowel,
# otherwise mark next IPA marking as incorrect, if no vowels, mark prev consonant as incorrect
# if consonant, mark prev consonant as incorrect, if no prev consonant, mark next consonant as incorrect, 
# otherwise mark prev vowel as incorrect 
# If extra char is stress mark, mark syllable as incorrectly stressed
def delete_incorrect(sentence_mapping, current_ipa, pos):
	# Convert IPA symbol index to sentence_mapping index
	index = sentence_mapping.ipa_indices[pos][1] if pos < len(sentence_mapping.ipa_indices) else sentence_mapping.ipa_indices[-1][1]
	prev_index = sentence_mapping.ipa_indices[pos - 1][1]
	next_index = index
	prev_mapping = sentence_mapping.ipa_mapping[prev_index]
	next_mapping = sentence_mapping.ipa_mapping[next_index]

	# edge case for 'h'
	h = {'h', "H"}
	if sentence_mapping.ipa_mapping[index - 1] in h and index > 0:
		sentence_mapping.ipa_mapping[index - 1].pronounced_correctly = False

	if is_vowel_ipa(current_ipa[0]):
		if index == 0:
			next_mapping.pronounced_correctly = False
		elif index == len(sentence_mapping.ipa_mapping) - 1:
			prev_mapping.pronounced_correctly = False
		elif is_vowel_ipa(prev_mapping.ipa_letter):
			prev_mapping.pronounced_correctly = False
		elif is_vowel_ipa(next_mapping.ipa_letter):
			next_mapping.pronounced_correctly = False
		else:
			prev_mapping.pronounced_correctly = False
	elif current_ipa[0].isalpha():
		if index == 0:
			next_mapping.pronounced_correctly = False
		elif index == len(sentence_mapping.ipa_mapping):
			prev_mapping.pronounced_correctly = False
		elif not is_vowel_ipa(prev_mapping.ipa_letter) and prev_mapping.ortho_letter.isalpha():
			prev_mapping.pronounced_correctly = False
		else:
			next_mapping.pronounced_correctly = False
	
	# Check stress marks
	for i in range(len(current_ipa)):
		if current_ipa[i] == "ˈ":
			next_mapping.stressed_correctly = False
		
# Since correct_ipa[start_index] to end_index must be inserted into user pronunciation,
# that means it was all incorrectly pronounced,
# so mark all ipa_mapping from start_index to end_index as incorrect
# replacement uses same logic
def insert_incorrect(sentence_mapping, user_ipa, correct_ipa, start_pos, end_pos):
	prev_index = sentence_mapping.ipa_indices[start_pos][1] - 1
	prev_mapping = sentence_mapping.ipa_mapping[prev_index]

	# edge case for 'h'
	h = {'h', 'H'}
	if prev_mapping.ortho_letter in h and prev_index >= 0:
		prev_mapping.pronounced_correctly = False
	
	for i in range(start_pos, end_pos if end_pos < len(sentence_mapping.ipa_indices) else len(sentence_mapping.ipa_indices)):
		# Convert IPA symbol index to sentence_mapping_index
		index = sentence_mapping.ipa_indices[i][1]
		next_mapping = sentence_mapping.ipa_mapping[index]
		# User did not stress syllable but they should have
		if correct_ipa[i] == "ˈ":
			next_mapping.stressed_correctly = False
		else:
			next_mapping.pronounced_correctly = False

	# Check if user stressed a non-stressed syllable
	for i in range(len(user_ipa)):
		if user_ipa[i] == "ˈ":
			next_mapping.stressed_correctly = False
			

		
# helper function to tell if an IPA character is a vowel sound		
def is_vowel_ipa(ipa_char):
	vowels = {"i", "y", "ɨ", "ʉ", "ɯ", "u", "ɪ", "ʏ", "ʊ", "e", "ø", "ɘ", "ɵ", "ɤ", "o", "e̞", "ø̞", "ə", "ɤ̞", "o̞", "ɛ", "œ", "ɜ", "ɞ", "ʌ", "ɔ", "æ", "ɐ", "a", "ɶ", "ä", "ɑ", "ɒ"}

	return ipa_char in vowels

# Since some sounds are similar enough that they can be considered correct,
# change such sounds in user_ipa to equivalent chars that transliterate() would generate
# so users are not penalized for essentially correct pronunciation
def preprocess_user_ipa(user_ipa):
	str = user_ipa.replace("ɣ", "g")
	str = str.replace("ð̞", "d")
	str = str.replace("β", "b")
	str = str.replace("v", "f")
	str = str.replace("h", "x")
	str = str.replace("ɾɾ", "r")
	str = str.replace("rr", "r")

	# These are different sounds, but Whisper is bad at detecting them
	# If the model is fine-tuned to be able to detect these sounds, you can remove these
	str = str.replace("ʝ", "j")
	str = str.replace("ɲ", "nj")
	str = str.replace("ʎ", "j")
	str = str.replace("ɔ", "o")


	for i in range(len(str)):
		if i < len(str) - 1 and str[i] == "i" and is_vowel_ipa(str[i+1]):
			str = str[:i] + "j" + str[i+1:]
		if i < len(str) - 1 and str[i] == "u" and is_vowel_ipa(str[i+1]):
			str = str[:i] + "w" + str[i+1:]
	return str

def remove_double_letters(user_ipa):
	user_ipa = user_ipa.replace("ɾɾ", "r")
	user_ipa = user_ipa.replace("rr", "r")
	str = ""
	for i in range(len(user_ipa) - 1):
		if user_ipa[i] == user_ipa[i + 1]:
			continue
		str += user_ipa[i]

	str += user_ipa[-1]	
	return str
