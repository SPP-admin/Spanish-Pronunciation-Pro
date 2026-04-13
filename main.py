from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import pronunciationChecking
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Fine for a bridge, or specify your CHDR domain
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_audio(sentence: str = Body(...), dialect: str = Body(...), audio_path: str = "temp_audio.wav"):
    # This calls your existing logic which is blocked on CHDR
    results = pronunciationChecking.correct_pronunciation_azure(sentence, audio_path, dialect)
    return results