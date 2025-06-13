from allosaurus.app import read_recognizer
import string
import epitran

# Load audio transcription model
model = read_recognizer()

# Epitran for IPA transcription of string
epi = epitran.Epitran('spa-Latn')

def get_correct_pronunciation(sentence: str) -> str:
	return epi.transliterate(sentence).translate(translator)

# Python translator to remove punctuation & whitespace
translator = str.maketrans('', '', string.punctuation + string.whitespace + 'ː' + 'ˑ')
stress_translator = str.maketrans('', '', string.whitespace + 'ː' + 'ˑ' + "," + "ʼ")
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