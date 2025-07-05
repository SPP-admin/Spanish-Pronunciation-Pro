import torch
from transformers import ParlerTTSForConditionalGeneration, AutoTokenizer
import soundfile as sf

device = "cuda:0" if torch.cuda.is_available() else "cpu"

model = ParlerTTSForConditionalGeneration.from_pretrained("parler-tts/parler-tts-mini-multilingual").to(device)
tokenizer = AutoTokenizer.from_pretrained("parler-tts/parler-tts-mini-multilingual")
description_tokenizer = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)

def generate_speech(sentence: str, dialect: str):
	processed_sentence = ""
	match dialect:
		# European Spanish 			
		case "eu":
			processed_sentence = sentence.replace("ci", "thi")
			processed_sentence = processed_sentence.replace("ce", "the")
			processed_sentence = processed_sentence.replace("z", "th")
		# Argentinian/Uruguayan Spanish
		case "rio":
			processed_sentence = sentence.replace("ll", "sh")

		case "col":
			processed_sentence = sentence.replace(" d", " th")
		case _:
			processed_sentence = sentence
	
	prompt = processed_sentence
	description = "A Spanish speaker who speaks at a low speed, moderate pitch, and clearly. The recording is of very high quality, with the speaker's voice sounding clear and very close up."

	input_ids = description_tokenizer(description, return_tensors="pt").input_ids.to(device)
	prompt_input_ids = tokenizer(prompt, return_tensors="pt").input_ids.to(device)

	generation = model.generate(input_ids=input_ids, prompt_input_ids=prompt_input_ids)
	audio_arr = generation.cpu().numpy().squeeze()
	sf.write("parler_tts_out.wav", audio_arr, model.config.sampling_rate)