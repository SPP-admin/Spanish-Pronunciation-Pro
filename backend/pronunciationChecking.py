from allosaurus.app import read_recognizer
import string
import ipaTransliteration as epi
from difflib import SequenceMatcher

# Load audio transcription model
model = read_recognizer()

# Python translator to remove punctuation & whitespace
translator = str.maketrans('', '', string.punctuation + string.whitespace + 'ː' + 'ˑ')
stress_translator = str.maketrans('', '', string.whitespace + 'ː' + 'ˑ' + "," + "ʼ")

def get_correct_pronunciation(sentence: str) -> str:
	sentence_mapping = epi.sentenceMapping(sentence)
	sentence_mapping.transliterate_latam()
	print(sentence_mapping.ipa_mapping)
	return 

# Take audio, return IPA transcription without whitespace or punctuation
def transcribe_audio(audio_path: str) -> str:
	print(audio_path)
	# Dummy file for now
	ipa_transcription = model.recognize(audio_path, 'spa')
	ipa_transcription = ipa_transcription.translate(translator)
	return ipa_transcription


def transcribe_audio_with_stress(audio_path: str) -> str:
	print(audio_path)
	# Dummy file for now
	ipa_transcription = model.recognize(audio_path, 'spa')
	ipa_transcription = ipa_transcription.translate(stress_translator)
	return ipa_transcription	

# Compare user pronunciation to correct pronunciation,
# using difflib to find which symbols in correct pronunciation were pronounced incorrectly
# Convert index of symbols in correct pronunciation to index in sentence mapping with ipa_indices
# Opcodes are 5 tuples of form tag, i1, i2, j1, j2
# where the tag is replace/delete/insert/equal
# and user_ipa[i1:i2] should be replaced/deleted/inserted or equal (as tag says) with correct_ipa[j1:j2]
def compare_strings(sentence_mapping, user_ipa):
	correct_ipa = sentence_mapping.get_ipa()
	indices = sentence_mapping.get_indices()

	sequence_matcher = SequenceMatcher(None, user_ipa, correct_ipa)
	opcode_list = sequence_matcher.get_opcodes()
	for opcode in opcode_list:
		# opcode[3] is index of first char in correct_ipa that deletion/insertion/replacement starts at
		# indices[opcode[3]] is (ipa letter, index in sentence mapping)
		start_index = indices[opcode[3]] [1]
		end_index = indices[opcode[4]][1] if opcode[0] != 'delete' else start_index
		if opcode[0] == 'delete':
			delete_incorrect(sentence_mapping, user_ipa[opcode[1]], start_index)
		elif opcode[0] == 'insert' or opcode[0] == 'replace':
			insert_incorrect(sentence_mapping, start_index, end_index)
		
		
# if extra char between index -1 and index is vowel, mark prev vowel (if any) as incorrect,
# otherwise mark next vowel as incorrect, if no vowels, mark prev consonant as incorrect
# if consonant, mark prev consonant as incorrect, if no prev consonant, mark next consonant as incorrect, 
# otherwise mark prev vowel as incorrect 
def delete_incorrect(sentence_mapping, current_ipa, index):
	prev_mapping = sentence_mapping.ipa_mapping[index - 1]
	next_mapping = sentence_mapping.ipa_mapping[index] if index < len(sentence_mapping.ipa_mapping) else None
	if is_vowel_ipa(current_ipa):
		if index == 0:
			next_mapping.pronounced_correctly = False
		elif index == len(sentence_mapping.ipa_mapping):
			prev_mapping.pronounced_correctly = False
		elif is_vowel_ipa(prev_mapping.ipa_letter):
			prev_mapping.pronounced_correctly = False
		elif is_vowel_ipa(next_mapping.ipa_letter):
			next_mapping.pronounced_correctly = False
		else:
			prev_mapping.pronounced_correctly = False

# Since correct_ipa[start_index] to end_index must be inserted into user pronunciation,
# that means it was all incorrectly pronounced,
# so mark all ipa_mapping from start_index to end_index as incorrect
# replacement uses same logic
def insert_incorrect(sentence_mapping, start_index, end_index):
	for i in range(start_index, end_index):
		next_mapping = sentence_mapping.ipa_mapping[i]
		next_mapping.pronounced_correctly = False
		
# helper function		
def is_vowel_ipa(ipa_char):
	vowels = {"i", "y", "ɨ", "ʉ", "ɯ", "u", "ɪ", "ʏ", "ʊ", "e", "ø", "ɘ", "ɵ", "ɤ", "o", "e̞", "ø̞", "ə", "ɤ̞", "o̞", "ɛ", "œ", "ɜ", "ɞ", "ʌ", "ɔ", "æ", "ɐ", "a", "ɶ", "ä", "ɑ", "ɒ"}

	return ipa_char in vowels

# Since some sounds are similar enough that they can be considered correct,
# change chars in user_ipa to equivalent chars that transliterate()  would generate
# so users are not penalized for essentially correct pronunciation
def preprocess_user_ipa(user_ipa):
	user_ipa.replace("ɣ", "g")