import os
import json
import base64
import uvicorn
from fastapi import FastAPI, HTTPException, Form, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


import firebase_admin
from firebase_admin import credentials, auth, firestore
from google.cloud.firestore_v1.base_query import FieldFilter

from pydantic import BaseModel

from models import LoginSchema, SignUpSchema, ChunkSchema, BaseSchema



#import pyrebase
#import config
from datetime import datetime, timezone
from google.cloud.firestore_v1.base_query import FieldFilter
from openai import OpenAI

import pronunciationChecking
import ipaTransliteration as epi
import whisperIPAtranscription as stt
import random
import librosa
import soundfile as sf
import numpy as np
import string

from dotenv import load_dotenv
load_dotenv()

import requests
import traceback
import httpx

if not firebase_admin._apps:
    #check if file exists
    if os.path.exists("spanish-pronunciation-pro-firebase-adminsdk-fbsvc-c91263f812.json"):
        cred = credentials.Certificate("spanish-pronunciation-pro-firebase-adminsdk-fbsvc-c91263f812.json")
    else:
        firebase_creds_json = os.environ.get("FIREBASE_CREDENTIALS")
        temp_path = "/tmp/firebase_credentials.json"
        with open(temp_path, "w") as f:
            f.write(firebase_creds_json)
        cred = credentials.Certificate(temp_path)
    firebase_admin.initialize_app(cred)


app = FastAPI(
    root_path="/pronunciemos",
    description = "API's for the Spanish Pronunciation Pro Project",
    title = "SPP API's",
    
)

app.mount("/audio", StaticFiles(directory="audio"), name="audio")

with open("accent_metadata.json", "r", encoding="utf-8") as f:
    accent_data = json.load(f)

@app.get("/")
async def root():
    return {"message": "Pronunciemos backend is online", "status": "success"}


'''
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8080, reload=True)
'''


origins = [
    "http://localhost:3002",
    "https://chdr.cs.ucf.edu", 
    "http://chdr.cs.ucf.edu:3002",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://spanish-pronunciation-pro.vercel.app",
	"https://spanish-pronunciation-pro-nine.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = firestore.client()
#firebase = pyrebase.initialize_app(config.firebaseConfig)

class AudioData(BaseModel):
    base64_data: str

from typing import Optional

class TranscriptionData(BaseModel):
     sentence: str
     base64_data: str
     dialect: str
     mime_type: Optional[str] = None

"""class TranscriptionData(BaseModel):
     sentence: str
     base64_data: str
     dialect: str
"""

# openai import
import openai
openai.api_key = os.getenv("OPENAI_API_KEY")

#gemini import
import google.generativeai as genai
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")


#For testing
#custom_http_client = httpx.Client(
   # timeout=httpx.Timeout(
        #timeout=120.0,  # Total timeout
       # connect=15.0,   # Time to establish the 'handshake'
       # read=90.0,      # Time to wait for the AI's actual data
        #write=15.0      # Time to send your prompt to OpenAI
    #),
    # Disables connection pooling which can "hang" behind proxies
   # limits=httpx.Limits(max_connections=5, max_keepalive_connections=0)
#)
#unsafe_http_client = httpx.Client(verify=False)

@app.post("/sendVoiceNote")
async def send_voice_note(data: AudioData):
    try:
        # Decode base64 string
        audio_bytes = base64.b64decode(data.base64_data)

        # Write to disk
        audio_file_name = "audio.webm"
        with open(audio_file_name, "wb") as f:
            f.write(audio_bytes)

        # Transcribe using OpenAI Whisper
        with open(audio_file_name, "rb") as audio_file:
            transcript = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text",
                language="es" 
            )
            print(f"DEBUG: Whisper heard: {transcript.text}")

        return transcript  # returns raw text
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error processing audio: {str(e)}"
        )

# user statistics are display on the profile page.
@app.get("/getUserStatistics")
async def getUserStatistics(uid):
    try:

        doc_ref = db.collection('user_stats')

        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()
        
        return JSONResponse(content={"user_stats": query_ref[0].to_dict()},
                             status_code=201)

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail= f"Error finding user statistics. {str(e)}"
        )
    
# Initialize the user statistics after the user creates an account.
@app.post("/setUserStatistics")
async def setUserStatistics(request: BaseSchema):
    try:
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        
        doc_ref = db.collection('user_stats')

        data = {
            'id': request.id,
            'accuracy_rate': int(0),
            'combo_count': int(0),
            'practice_sessions': int(0),
            'study_streak': int(0),
            'last_login': date,
            'achievements': {},
            'activities': [],
            'completed_combos': [None] * 7,
            'completed_topics': {},
        }

        query_ref = doc_ref.where(filter= FieldFilter("id", "==", request.id)).get()
        if(query_ref):
                    raise HTTPException(
                    status_code=400,
                    detail= f"User statistics already exist."
                ) 
        else:
            doc = doc_ref.document()
            doc.set(data)
            return JSONResponse(content={"message": "User statistics were successfully intialized."}, 
                                    status_code = 201)
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail= f"Error intializing user statistics {str(e)}."
        )

# After calculating the users new accuracy, update the accuracy value.
@app.patch("/updateAccuracy")
async def updateAccuracy(uid, new_accuracy: int):
    try:
        doc_ref = db.collection('user_stats')
        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()
        doc_id = query_ref[0].id
        doc_ref = db.collection('user_stats').document(doc_id).update({"accuracy_rate": new_accuracy})
        return JSONResponse(content={"message": f"Accuracy was successfully updated to a value of {(new_accuracy)}%" }, 
                                    status_code = 201)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail= f"Error updating user accuracy. {str(e)}"
        )
    
# When the user completes a practice session, update the value.
@app.patch("/updatePracticeSessions")
async def updatePracticeSessions(uid, new_session_value):
    try:
        doc_ref = db.collection('user_stats')
        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()
        doc_id = query_ref[0].id
        doc_ref = db.collection('user_stats').document(doc_id).update({"practice_sessions": new_session_value})
        return JSONResponse(content={"message": f"User has successfully completed a practice session." }, 
                                    status_code = 201)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail= f"Error completing practice session. {str(e)}"
        )

# When the user finishes all the chunks present in a lesson, update the amount of lessons they've completed.
@app.patch("/updateComboCount")
async def updateComboCount(uid, new_combo_count):
    try:
        doc_ref = db.collection('user_stats')
        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()
        doc_id = query_ref[0].id
        doc_ref = db.collection('user_stats').document(doc_id).update({"combo_count": new_combo_count})
        return JSONResponse(content={"message": f"User has successfully completed a lesson, the amount of lessons they've completed has been incremented." }, 
                                    status_code = 201)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail= f"Error completing lesson. {str(e)}"
        )
    
# When a user logs in consecutively update their study streak.
@app.patch("/updateStudyStreak")
async def updateStudyStreak(uid, new_streak):
    try:
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        doc_ref = db.collection('user_stats')
        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()
        doc_id = query_ref[0].id
        doc_ref = db.collection('user_stats').document(doc_id).update({"study_streak": new_streak,
                                                                       "last_login": date})
        return JSONResponse(content={"message": f"User has logged in consecutively, study streak was incremented." }, 
                                    status_code = 201)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail= f"Error updating streak. {str(e)}"
        )

# Set an achievment to true.
@app.patch("/updateAchievements")
async def updateAchievements(uid, achievement: str):
     try:
          date = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

          doc_ref = db.collection('user_stats')

          query_ref = doc_ref.where(filter=FieldFilter("id", "==", uid)).get()
          
          doc = query_ref[0]
          doc_id = doc.id
          achievements = doc.to_dict().get('achievements', [])

          achievements[achievement] = {
               "completed": True,
               "completion_date": date
          }
          
          doc_ref = db.collection('user_stats').document(doc_id).update({"achievements": achievements})

          return JSONResponse(content={"message": f"User has successfully earned achievement {achievement}"},
                            status_code=201)      
        
     except Exception as e:
                         raise HTTPException(
            status_code=400,
            detail= f"Error updating achievements. {str(e)}"
        )

        
# Push newest activity to the activities array, if the list is full then pop the old activities.
@app.patch("/updateActivityHistory")
async def updateActivityHistory(uid, activity):
    try:
        doc_ref = db.collection('user_stats')
        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()
        doc_id = query_ref[0].id
        doc_ref = db.collection('user_stats').document(doc_id).get()
        activities = doc_ref.to_dict().get('activities', [])

        while(len(activities) >= 3 and len(activities) > 0):
            activities.pop(0)

        activities.append(activity)

        doc_ref = db.collection('user_stats').document(doc_id).update({"activities": activities})

        return JSONResponse(content={"message": f"User's recent activity has been added to their history.'" }, 
                                    status_code = 201)

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail= f"Error updating activity history. {str(e)}"
        )

# Set a chunk to completed, (Stored as a map as firestore does not allow the storage of 2-d arrays / lists)
@app.patch("/updateCompletedCombos")
# chunk, lesson, difficulty
async def updateCompletedCombos(uid, lesson: str, topic: int, level: str):
    try:
        doc_ref = db.collection('user_stats')

        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()

        doc = query_ref[0]
        doc_id = doc.id
        data = doc.to_dict()
        combos = data.get('completed_combos', [])

        if combos[topic] is None:
              combos[topic] = {}

        combos[topic][lesson+"-"+level] = True

        doc_ref = db.collection('user_stats').document(doc_id).update({"completed_combos": combos})

        return JSONResponse(content={"message": "Chunk was successfully updated."},
                            status_code=201)
    except Exception as e:
                raise HTTPException(
            status_code=400,
            detail= f"Error updating chunk progress. {str(e)}"
        )

# Updates the lesson progress array in the lessons collection.
@app.patch("/updateTopicProgress")
async def updateTopicProgress(uid, topic: int):
     try:

          doc_ref = db.collection('user_stats')
          query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()

          doc = query_ref[0]
          doc_id = doc.id
          topics = doc.to_dict().get('completed_topics', {})

          print(topics)

          topics[str(topic)] = True

          doc_ref = db.collection('user_stats').document(doc_id).update({"completed_topics": topics})

          return JSONResponse(content={"message": "Lesson progress was successfully updated."}, 
                                    status_code = 201)
        
     except Exception as e:
         raise HTTPException(
              status_code=400,
              detail= f"Error updating lesson progress. {str(e)}"
         )


@app.post("/generateSentence")
async def generateSentence(chunk: str, lesson: str, difficulty: str):
    try:
        if chunk == "special_vowel_combinations" and difficulty == "sentences":
            # Generate a word
            word_prompt = (
                f"SYSTEM: You are a helpful assistant that generates a large variety of clean Spanish words for a pronunciation app for beginners. "
                f"The current lesson chunk is '{chunk}', specific lesson is '{lesson}', and difficulty is 'word'. "
                f"Make sure the word includes '{lesson}' exactly as it appears. "
                f"USER: Generate one unique and creative Spanish word for the lesson '{lesson}' in the chunk '{chunk}'."
            )
            
            word_response = model.generate_content(
                word_prompt,
                generation_config=genai.types.GenerationConfig(
                temperature=0.5,  
                top_p=1,
                top_k=1,          
                
    )
            )
            generated_word = word_response.text.strip()

            if "\n" in generated_word:
                generated_word = generated_word.split("\n")[0].strip()

            # Generate a sentence including that word
            sentence_prompt = (
                f"SYSTEM: You are a helpful assistant generating Spanish sentences (max 10 words). "
                f"The sentence must include the word '{generated_word}' exactly. "
                f"Generate ONLY the Spanish sentence, no extra text. Use correct accents. "
                f"USER: Generate a unique Spanish sentence for lesson '{lesson}' including the word '{generated_word}'."
            )
            
            sentence_response = model.generate_content(
                sentence_prompt,
                generation_config=genai.types.GenerationConfig(temperature=1.0)
            )
            current_sentence = sentence_response.text.strip()

        else:
            # General generation logic
            general_prompt = (
                f"SYSTEM: You are a helpful assistant generating Spanish {difficulty} for a pronunciation app. "
                f"Lesson chunk: '{chunk}', Specific lesson: '{lesson}'. "
                f"If the difficulty is sentences, keep it under 10 words unless it's 'complex sentences'. "
                f"Generate ONLY the Spanish text, no explanations or introductions. "
                f"CRITICAL RULES: "
                f"1. Output ONLY the word itself. "
                f"2. Do NOT provide a list. "
                f"3. Do NOT provide definitions or translations. "
                f"4. Do NOT use bullet points or numbering. "
                f"5. No conversational filler (no 'Here is your word'). "
                f"Example Request: Lesson 'll', Difficulty 'word' "
                f"Example Response: Lluvia"
                f"USER: Generate a unique and creative Spanish {difficulty} for the lesson '{lesson}' in the chunk '{chunk}'."
            )
            
            response = model.generate_content(
                general_prompt,
                generation_config=genai.types.GenerationConfig(
                temperature=0.5,  
                top_p=1,
                top_k=1,          
                
                )
            )
            current_sentence = response.text.strip()

    except Exception as e:
        print(f"!!! GEMINI ERROR: {e}")
        backup_sentences = [
            "El gato duerme.", "La niña corre.", "El perro ladra.", 
            "Hace mucho calor.", "Llueve afuera.", "El vaso está lleno."
        ]
        current_sentence = random.choice(backup_sentences)
        
    return current_sentence

# Add this to your CHDR backend/main.py
@app.post("/get-coaching")
async def get_coaching(data: dict):
    failed_letters = data.get("failed_letters", [])
    sentence = data.get("sentence", "")
    dialect = data.get("dialect", "latam")

    if not failed_letters:
        return {"coach_tip": "¡Perfecto! Tu fluidez y pronunciación son excelentes."}

    # PROMPT TUNING: Focus on word-level patterns instead of letter-by-letter
    prompt = (
        f"SYSTEM: You are an expert Spanish Phonetics Coach. A student is practicing: '{sentence}' ({dialect} accent). "
        f"The student struggled with these specific sounds: {failed_letters}. "
        f"USER: Provide a single, cohesive tip (max 2 sentences) that explains why those mistakes happen in the context of the whole word. "
        f"Instead of listing letters, talk about the 'flow' or 'tongue placement' needed for the word. "
        f"Example: Instead of 'Pronounce R and O better', say 'Make sure to flick your tongue for the rolling R so it carries smoothly into the next vowel'."
        f"CRITICAL: Keep the feedback in English."
    )

    try:
        response = model.generate_content(prompt)
        return {"coach_tip": response.text.strip()}
    except Exception as e:
        return {"coach_tip": "Buen intento. Trata de relajar la lengua y conectar los sonidos más suavemente."}

@app.post("/generateRegionalSentence")
async def generateRegionalSentence(topic: str, region: str = "", difficulty: str = "easy"):
    try:
        matches = [
            item for item in accent_data
        ]
        if not matches:
            raise HTTPException(status_code=404, detail="No matching audio clips found")

        clip = random.choice(matches)

        return {
            "sentence": clip["sentence"],
            "region": clip["accent"],
            "audio_url": f"/pronunciemos/audio/{clip['file']}",
            "clip_id": clip["id"]
        }

    except Exception as e:
        print(f"Audio clip selection error: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading audio: {str(e)}")
    



@app.get("/testAI")
async def testAI():
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    try:
        # A tiny 2-word prompt
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Say hi"}],
            max_tokens=5,
            timeout=200.0
        )
        return {"status": "success", "response": response.choices[0].message.content}
    except Exception as e:
        return {"status": "error", "detail": str(e)}



@app.post("/checkPronunciation")
async def checkPronunciation(data: TranscriptionData):
    input_file = None
    output_file = None

    try:
        sentence = data.sentence
        audio_bytes = base64.b64decode(data.base64_data)
        mime_type = (data.mime_type or "").split(";")[0].strip().lower()

        ext_map = {
            "audio/webm": ".webm",
            "audio/wav": ".wav",
            "audio/x-wav": ".wav",
            "audio/mp4": ".mp4",
            "audio/mpeg": ".mp3",
            "audio/ogg": ".ogg",
        }

        input_ext = ext_map.get(mime_type, ".webm")
        input_file = ''.join(random.choices(string.ascii_letters + string.digits, k=20)) + input_ext
        output_file = "tmp_" + ''.join(random.choices(string.ascii_letters + string.digits, k=20)) + ".wav"

        with open(input_file, "wb") as f:
            f.write(audio_bytes)

        print("Saved input file:", input_file)
        print("Mime type:", mime_type if mime_type else "missing")
        print("Input size:", os.path.getsize(input_file))

        audio, sampling_rate = librosa.load(input_file, sr=16000, mono=True, duration=30.0)
        sf.write(output_file, audio, 16000)

        print("Converted output file:", output_file)
        print("Converted output size:", os.path.getsize(output_file))

        if data.dialect == "accent_marks":
            output = pronunciationChecking.correct_pronunciation_with_accents(sentence, output_file)
        else:
            output = pronunciationChecking.correct_pronunciation_azure(sentence, output_file, data.dialect)

        return output

    except Exception as e:
        print("Error:", str(e))
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error in pronunciation checking: {str(e)}"
        )

    finally:
        for path in [input_file, output_file]:
            if path and os.path.exists(path):
                os.remove(path)
                print(f"{path} deleted successfully.")
