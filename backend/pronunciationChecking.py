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
	print(audio_path)
	# Dummy file for now
	ipa_transcription = model.recognize('src/audios/University of Central Florida 24.wav', 'spa')
	ipa_transcription = ipa_transcription.translate(translator)
	return ipa_transcription
	


	