from allosaurus.app import read_recognizer
import string
import epitran

# Load audio transcription model
model = read_recognizer()

# Epitran for IPA transcription of string
epi = epitran.Epitran('spa-Latn')

# Python translator to remove punctuation & whitespace
translator = str.maketrans('', '', string.punctuation + string.whitespace + 'ː')

# Take audio, return IPA transcription without whitespace or punctuation
def transcribe_audio(audio_path: str) -> str:
	ipa_transcription = model.recognize(audio_path, 'spa')
	ipa_transcription = ipa_transcription.translate(translator)
	return ipa_transcription
	


	