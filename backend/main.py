import os
import base64
import uvicorn
from fastapi import FastAPI, HTTPException, Form, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

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

if not firebase_admin._apps:
    #check if file exists
    if os.path.exists("spanish-pronunciation-pro-firebase-adminsdk-fbsvc-af37a865d2.json"):
        cred = credentials.Certificate("spanish-pronunciation-pro-firebase-adminsdk-fbsvc-af37a865d2.json")
    else:
        firebase_creds_json = os.environ.get("FIREBASE_CREDENTIALS")
        temp_path = "/tmp/firebase_credentials.json"
        with open(temp_path, "w") as f:
            f.write(firebase_creds_json)
        cred = credentials.Certificate(temp_path)
    firebase_admin.initialize_app(cred)


app = FastAPI(
    description = "API's for the Spanish Pronunciation Pro Project",
    title = "SPP API's",
    docs_url= "/"
)



'''
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8080, reload=True)
'''


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://spanish-pronunciation-pro.vercel.app"
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

class TranscriptionData(BaseModel):
     sentence: str
     base64_data: str
     dialect: str
# openai import
import openai
openai.api_key = os.getenv("OPENAI_API_KEY")

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

# Generate a sentence or word for the user to practice.
@app.post("/generateSentence")
async def generateSentence(chunk: str, lesson: str, difficulty: str):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    try:
        # Special logic for special_vowel_combinations chunk with 'sentences' difficulty
        if chunk == "special_vowel_combinations" and difficulty == "sentences":
            # Step 1: Generate a word
            word_prompt = (
                f"You are a helpful assistant that generates Spanish words for a pronunciation app used by beginners. "
                f"The current lesson chunk is '{chunk}', the specific lesson is '{lesson}', and the difficulty is 'word'. Make sure the word includes the target letter/sound in the lesson correctly. "
                f"For the 'special_vowel_combinations' chunk, whatever the lesson is must be included in the generated word exactly how it appears in the lesson you are given. "
                f"Generate ONLY the Spanish word requested, with NO extra text, explanations, or introductions. Do not say anything like 'Here is a word:' or 'OK'. Just output the Spanish word itself. "
                f"Use the Spanish alphabet, correct accent marks and also make sure the word is grammatically correct. "
                f"Return only a single word. "
                f"Make sure the word is unique, creative, and not repetitive. Avoid using any words you have generated recently. "
            )
            word_user_content = (
                f"Generate a unique and creative Spanish word for the lesson '{lesson}' in the chunk '{chunk}'. "
                f"ONLY return the Spanish word, and nothing else. Avoid repeating previously used words. "
            )
            word_response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": word_prompt},
                          {"role": "user", "content": word_user_content}],
                temperature=1.2
            )
            generated_word = word_response.choices[0].message.content.strip()

            # Step 2: Generate a sentence that includes the generated word
            sentence_prompt = (
                f"You are a helpful assistant that generates Spanish sentences for a pronunciation app used by beginners. "
                f"The current lesson chunk is '{chunk}', the specific lesson is '{lesson}', and the difficulty is 'sentences'. Make sure the sentence includes the word '{generated_word}' exactly as it appears. "
                f"Generate ONLY the Spanish sentence requested, with NO extra text, explanations, or introductions. Do not say anything like 'Here is a sentence:' or 'OK'. Just output the Spanish sentence itself. "
                f"Use the Spanish alphabet, correct accent marks and also make sure the sentence is grammatically correct. "
                f"Make sure the sentence is unique, creative, and not repetitive. Avoid using any sentences you have generated recently. "
                f"Keep the sentence simple, clear, and easy to understand. It must be no longer than 10 words."
            )
            sentence_user_content = (
                f"Generate a unique and creative Spanish sentence for the lesson '{lesson}' in the chunk '{chunk}' that includes the word '{generated_word}'. "
                f"ONLY return the Spanish sentence, and nothing else. Avoid repeating previously used phrases. "
                f"Keep the sentence simple and clear. It must be no longer than 10 words."
            )
            sentence_response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": sentence_prompt},
                          {"role": "user", "content": sentence_user_content}],
                temperature=1.2
            )
            current_sentence = sentence_response.choices[0].message.content.strip()
        else:
            prompt = (
                f"You are a helpful assistant that generates Spanish sentences or words for a pronunciation app used by beginners. "
                f"The current lesson chunk is '{chunk}', the specific lesson is '{lesson}', and the difficulty is '{difficulty}'. Make sure the sentence or word includes the target letter/sound in the lesson correctly. "
                f"For the 'special_vowel_combinations' chunk, whatever the lesson is must be included in the generated sentence/word exactly how it appears in the lesson you are given. If the difficulty is sentences, first generate a word and then create a sentence that includes that given word. "
                f"Generate ONLY the Spanish sentence or word requested, with NO extra text, explanations, or introductions. Do not say anything like 'Here is a sentence:' or 'OK'. Just output the Spanish sentence or word itself. "
                f"Use the Spanish alphabet, correct accent marks and also make sure the sentences are grammatically correct. "
                f"If the difficulty is or includes 'word', return only a single word. "
                f"Make sure the sentence or word is unique, creative, and not repetitive. Avoid using any sentences you have generated recently. "
                f"Unless the difficulty is explicitly 'complex sentences', keep the sentences simple, clear, and easy to understand. They must be no longer than 10 words. Only use more complex grammar or longer sentences if the difficulty is 'complex sentences'."
            )
            user_content = (
                f"Generate a unique and creative Spanish {difficulty} for the lesson '{lesson}' in the chunk '{chunk}'. "
                f"ONLY return the Spanish sentence or word, and nothing else. Avoid repeating previously used phrases. "
                f"Keep the sentence simple and clear unless the difficulty is 'complex sentences'. If the difficulty is 'complex sentences', use more advanced grammar and longer sentences."
            )
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": prompt},
                          {"role": "user", "content": user_content}],
                temperature=1.2
            )
            current_sentence = response.choices[0].message.content
    except:
        backup_sentences = [
            "El gato duerme.", "La niña corre.", 
            "El perro ladra.", "Hace mucho calor.",
            "Llueve afuera.", "El vaso está lleno.",
            "La casa es grande.", "El pan está caliente.",
            "Hay una flor.", "La cama es cómoda."
        ]
        current_sentence = random.choice(backup_sentences)
    finally:
        return current_sentence

# Check the user's pronunciation of a sentence or word.
@app.post("/checkPronunciation")
async def checkPronunciation(data: TranscriptionData):
      try:
        audio_bytes = base64.b64decode(data.base64_data)
        sentence = data.sentence

		# Generating random name for the audio files
        random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=20))
        random_string = random_string + ".wav"
        with open(random_string, "wb") as f:
              f.write(audio_bytes)
        
        print(os.path.isfile(random_string))
        audio, sampling_rate = librosa.load(random_string, sr=16000, mono=True, duration=30.0, dtype=np.int32)
        random2 = "tmp_" + random_string
        sf.write(random2, audio, 16000)
        if data.dialect == "accent_marks":
             output = pronunciationChecking.correct_pronunciation_with_accents(sentence, random2)
        else:
             output = pronunciationChecking.correct_pronunciation_azure(sentence, random2, data.dialect)

        # Get rid of audio recordings
        if os.path.exists(random_string):
            os.remove(random_string)
            print(random_string + " deleted successfully.")
        else: print(f"File not found.")
        if os.path.exists(random2):
            os.remove(random2)
            print(random2 + " deleted successfully.")
        else: print(f"File not found.")
      except Exception as e:
            print('Error: ', str(e))
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Error in pronunciation checking: {str(e)}"
            )

      return output