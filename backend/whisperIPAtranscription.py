from transformers import WhisperProcessor, WhisperForConditionalGeneration
import scipy.io.wavfile
import scipy.signal
import numpy as np

WHISPER_SAMPLING_RATE = 16000
processor = WhisperProcessor.from_pretrained("neurlang/ipa-whisper-base")
model = WhisperForConditionalGeneration.from_pretrained("neurlang/ipa-whisper-base")
model.config.forced_decoder_ids = None
model.config.suppress_tokens = []
model.generation_config.forced_decoder_ids = None
model.generation_config.language = "es"
model.generation_config._from_model_config = True

# Convert 16-bit PCM wav to 32-bit floating point wav
def pcm2float(sig, dtype='float32'):
	"""Convert PCM signal to floating point with a range from -1 to 1.
	Use dtype='float32' for single precision.
	Parameters
	----------
	sig : array_like
		Input array, must have integral type.
	dtype : data type, optional
		Desired (floating point) data type.
	Returns
	-------
	numpy.ndarray
		Normalized floating point data.
	See Also
	--------
	float2pcm, dtype
	"""
	sig = np.asarray(sig)
	if sig.dtype.kind not in 'iu':
		raise TypeError("'sig' must be an array of integers")
	dtype = np.dtype(dtype)
	if dtype.kind != 'f':
		raise TypeError("'dtype' must be a floating point type")

	i = np.iinfo(sig.dtype)
	abs_max = 2 ** (i.bits - 1)
	offset = i.min + abs_max
	return (sig.astype(dtype) - offset) / abs_max

# Read file, transcribe with whisperIPA because allosaurus doesn't include linguistic stress information
def transcribe_with_stress(filepath):
	transcription = ""

	# Read, process file
	rate, arr = scipy.io.wavfile.read(filepath)
	if arr.dtype != np.float32:
		arr = pcm2float(arr)

	# Change sampling rate to match Whisper's required sampling rate
	if (rate != WHISPER_SAMPLING_RATE):
		arr = scipy.signal.resample(arr, int(len(arr) * WHISPER_SAMPLING_RATE / rate))

	input_features = processor(arr, sampling_rate=WHISPER_SAMPLING_RATE, return_tensors="pt").input_features 

	# generate token ids
	predicted_ids = model.generate(input_features)
	# decode token ids to text
	transcription = processor.batch_decode(predicted_ids, skip_special_tokens=False)
	return transcription[0]