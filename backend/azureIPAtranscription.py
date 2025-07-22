import os 
import azure.cognitiveservices.speech as speechsdk
import re

# Get accuracy of each IPA symbol of correct pronunciation from Azure's Pronunciation Assessment tool
def azure_transcribe(filepath, sentence, dialect):
	speech_config = speechsdk.SpeechConfig(subscription=os.getenv("AZURE_API_KEY"), endpoint=os.getenv("AZURE_ENDPOINT"))
	audio_config = speechsdk.audio.AudioConfig(filename=filepath)
	lang = ""
	if dialect == "spain":
		lang = "es-ES"
	else:
		lang = "es-MX"
	input_sentence = sentence
	if dialect == "argentina":
		# Preprocess input string to add in features of Argentinian Spanish
		# Aspiration of s before consonants, and sheismo
		input_sentence = input_sentence.lower()
		input_sentence = input_sentence.replace("ll", "sh")
		input_sentence = input_sentence.replace("ñ", "ni")
		input_sentence = re.sub(r'y([aeiouyáéíóú])', r'sh\1', input_sentence)
		input_sentence = re.sub(r's([bcdfgjklmnpqrtvwxz])', r'h\1', input_sentence)
		input_sentence = re.sub(r's(\W+[bcdfgjklmnpqrstvwxz])', r'h\1', input_sentence)

	elif dialect == "puerto_rico":
		# Preprocess input string to add in features of Puerto Rican Spanish
		# Aspiration of final s and final d, aspiration of s before consonants, aspiration of intervocalic d
		# r at end of syllables before consonants -> l
		input_sentence = input_sentence.lower()
		input_sentence = re.sub(r'[sd]([\W$])', r'h\1', input_sentence, flags=re.MULTILINE)
		input_sentence = re.sub(r's([bcdfgjklmnpqrstvwxz])', r'h\1', input_sentence)
		input_sentence = re.sub(r'([aeiouyáéíóú])d([aeiouyáéíóú])', r'\1h\2', input_sentence)
		input_sentence = re.sub(r'([aeiouyáéíóú])r([bcdfgjklmnpqtvwxz])', r'\1l\2', input_sentence)

	speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, language=lang, audio_config=audio_config)
	pronunciation_config = speechsdk.PronunciationAssessmentConfig(
		json_string="{\"referenceText\":\"" + input_sentence + "\",\"gradingSystem\":\"HundredMark\",\"granularity\":\"Phoneme\",\"phonemeAlphabet\":\"IPA\",\"nBestPhonemeCount\":5}"
		)

	pronunciation_config.apply_to(speech_recognizer)
	speech_recognition_result = speech_recognizer.recognize_once()

	pronunciation_assessment_result = speechsdk.PronunciationAssessmentResult(speech_recognition_result)

	pronounced_correctly = []
	for word in pronunciation_assessment_result.words:
		for phoneme in word.phonemes:
			pronounced_correctly.append(True if phoneme.accuracy_score >= 80 else False)

	return pronounced_correctly