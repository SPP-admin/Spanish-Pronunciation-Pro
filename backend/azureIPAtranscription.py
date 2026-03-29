import os 
import azure.cognitiveservices.speech as speechsdk
import re
import json
import requests

# Get accuracy of each IPA symbol of correct pronunciation from Azure's Pronunciation Assessment tool
def azure_transcribe(filepath, sentence, dialect):
    
    raw_endpoint = os.getenv("AZURE_ENDPOINT", "")
    region = raw_endpoint.replace("https://", "").split(".")[0]
    api_key = os.getenv("AZURE_API_KEY")


    url = (
        f"https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1"
        f"?language={'es-ES' if dialect == 'spain' else 'es-MX'}"
        f"&format=detailed" 
    )

    # Dialect Preprocessing 
    input_sentence = sentence
    if dialect == "argentina":
        input_sentence = input_sentence.lower().replace("ll", "sh").replace("ñ", "ni")
        input_sentence = re.sub(r'y([aeiouyáéíóú])', r'sh\1', input_sentence)
        input_sentence = re.sub(r's([bcdfgjklmnpqrtvwxz])', r'\1', input_sentence)
        input_sentence = re.sub(r's(\W+[bcdfgjklmnpqrstvwxz])', r'h\1', input_sentence)
    elif dialect == "puerto_rico":
        input_sentence = input_sentence.lower()
        input_sentence = re.sub(r'[sd]([\W$])', r'h\1', input_sentence, flags=re.MULTILINE)
        input_sentence = re.sub(r's([bcdfgjklmnpqrstvwxz])', r'\1', input_sentence)
        input_sentence = re.sub(r'([aeiouyáéíóú])d([aeiouyáéíóú])', r'\1h\2', input_sentence)
        input_sentence = re.sub(r'([aeiouyáéíóú])r([bcdfgjklmnpqtvwxz])', r'\1l\2', input_sentence)

    # Read audio & Set Headers
    with open(filepath, 'rb') as f:
        audio_data = f.read()

    headers = {
        'Ocp-Apim-Subscription-Key': api_key,
        'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
        'Accept': 'application/json',
        # This header mimics the Pronunciation Assessment config from the SDK
        'Pronunciation-Assessment': json.dumps({
            "ReferenceText": input_sentence,
            "GradingSystem": "HundredMark",
            "Granularity": "Phoneme",
            "PhonemeAlphabet": "IPA"
        })
    }

    pronounced_correctly = []

    try:
        # standard POST request 
        response = requests.post(url, headers=headers, data=audio_data, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            # Navigate the REST response: NBest -> Words -> Phonemes
            nbest = data.get("NBest", [{}])
            words = nbest[0].get("Words", [])

            for word in words:
                phonemes = word.get("Phonemes", [])
                for phoneme in phonemes:
                    accuracy = phoneme.get("PronunciationAssessment", {}).get("AccuracyScore", 0)
                    pronounced_correctly.append(True if accuracy >= 80 else False)
            
            print(f"Azure REST success. Phonemes evaluated: {len(pronounced_correctly)}")
        else:
            print(f"!!! Azure REST Error {response.status_code}: {response.text}")

    except Exception as e:
        print(f"!!! REST Request Failed: {e}")

    return pronounced_correctly
        
