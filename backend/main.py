import uvicorn
from fastapi import FastAPI, HTTPException
from firebase_admin import credentials, auth
from firebase_admin import firestore
import firebase_admin
from fastapi.responses import JSONResponse
from models import LoginSchema, SignUpSchema
#import pyrebase
#import config
from datetime import datetime
from google.cloud.firestore_v1.base_query import FieldFilter

if not firebase_admin._apps:
    #cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app()

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8080, reload=True)

app = FastAPI(
    description = "API's for the Spanish Pronunciation Pro Project",
    title = "SPP API's",
    docs_url= "/"
)

db = firestore.client()
#firebase = pyrebase.initialize_app(config.firebaseConfig)

@app.post("/signup")
async def signup(request: SignUpSchema):
    email = request.email
    password = request.password
    displayName = request.displayName

    date = datetime.now()
    ret_date = date.strftime("%B") + "," + str(date.year)

    try:
        # Look into password hashing.
        # salt = bcrypt.gensalt()   

        user = auth.create_user(
            email = email,
            password = password,
        )

        doc_ref = db.collection('users').document()
        data = {
            'name': displayName,
            'id': user.uid,
            'creation_date': ret_date
        }
        doc_ref.set(data)

        return JSONResponse(content={"message": "User was successfully added."}, 
                                status_code = 201)

    except auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code = 400,
            detail= f"Account exists with this email."
        )
    

@app.post("/login")
async def login(request: LoginSchema):
    email = request.email
    password = request.password

    try:
        user = auth().sign_in_with_email_and_password(
            email = email,
            password = password
        )
        id = user['idToken']
        # user.localId gives id for database purposes
        return JSONResponse(content={"id":id
                                     }, status_code = 201
                            )
    except:
        raise HTTPException(
            status_code = 400,
            detail= f"Incorrect login information."
        )

# user statistics are display on the profile page.
@app.get("/getUserStatistics")
async def getUserStatistics(uid):
    try:
        
        doc_ref = db.collection('stats')

        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()
        
        return JSONResponse(content={"user_stats": query_ref[0].to_dict()},
                             status_code=201)

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail= f"Error finding user statistics."
        )
    
# Initialize the user statistics after the user creates an account.
@app.post("/setUserStatistics")
async def setUserStaistics(uid):
    try:
        doc_ref = db.collection('stats')

        data = {
            'accuracy_rate': int(0),
            'id': uid,
            'completed_lessons': int(0),
            'practice_sessions': int(0),
            'study_streak': int(0),
            'uses': int(0)
        }

        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()
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
async def updateAccuracy(uid, new_accuracy):
    try:
        doc_ref = db.collection('stats')
        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()
        doc_id = query_ref[0].id
        doc_ref = db.collection('stats').document(doc_id).update({"accuracy_rate": new_accuracy})
        return JSONResponse(content={"message": f"Accuracy was successfully updated to a value of {int(new_accuracy)}" }, 
                                    status_code = 201)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail= f"Error updating user accuracy."
        )
    
# When the user completes a practice session, update the value.
@app.patch("/updatePracticeSessions")
async def updatePracticeSessions(uid):
    try:
        doc_ref = db.collection('stats')
        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()
        doc_id = query_ref[0].id
        doc_ref = db.collection('stats').document(doc_id).update({"practice_sessions": firestore.Increment(1)})
        return JSONResponse(content={"message": f"User has successfully completed a practice session." }, 
                                    status_code = 201)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail= f"Error completing practice session."
        )

# When the user finishes all the chunks present in a lesson, update the amount of lessons they've completed.
@app.patch("/updateCompletedLessons")
async def updateCompletedLessons(uid):
    try:
        doc_ref = db.collection('stats')
        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()
        doc_id = query_ref[0].id
        doc_ref = db.collection('stats').document(doc_id).update({"completed_lessons": firestore.Increment(1)})
        return JSONResponse(content={"message": f"User has successfully completed a lesson, the amount of lessons they've completed has been incremented." }, 
                                    status_code = 201)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail= f"Error completing lesson."
        )
    
# When a user logs in consecutively update their study streak.
@app.patch("/updateStudyStreak")
async def updateCompletedLessons(uid):
    try:
        doc_ref = db.collection('stats')
        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()
        doc_id = query_ref[0].id
        doc_ref = db.collection('stats').document(doc_id).update({"study_streak": firestore.Increment(1)})
        return JSONResponse(content={"message": f"User has logged in consecutively, study streak was incremented." }, 
                                    status_code = 201)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail= f"Error updating streak"
        )
   
# When a user uses the pronounciation checker, update the value.
@app.patch("/updateUses")
async def updateCompletedLessons(uid):
    try:
        doc_ref = db.collection('stats')
        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()
        doc_id = query_ref[0].id
        doc_ref = db.collection('stats').document(doc_id).update({"uses": firestore.Increment(1)})
        return JSONResponse(content={"message": f"User has used the pronounciation checker, pronounciation uses has been incremented." }, 
                                    status_code = 201)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail= f"Error updating pronounciation uses."
        )
   
# Get the lessons that the user has previously completed.
@app.get("/getLessons")
async def getLessons(uid):
    try:
        doc_ref = db.collection('lessons')

        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()

        return JSONResponse(content={"lesson_data": query_ref[0].to_dict()},
                            status_code=201)
    except:
                raise HTTPException(
            status_code=400,
            detail= f"Error loading lesson data."
        )
    
@app.get("/setLessons")
async def setLessons(uid):
    pass

@app.get("/getAchievements")
async def getAchievements(uid):
    try:
        doc_ref = db.collection('lessons')

        query_ref = doc_ref.where(filter= FieldFilter("id", "==", uid)).get()

        return JSONResponse(content={"lesson_data": query_ref[0].to_dict()},
                            status_code=201)
    except:
                         raise HTTPException(
            status_code=400,
            detail= f"Error fetching user achievements."
        )

@app.get("/getActivityHistory")
async def getActivityHistory():
    pass

@app.get("/getProgress")
async def getProgress():
    pass

@app.get("/getUserAccuracy")
async def getUserAccuracy():
    pass

@app.post("/")
async def function():
    date = datetime.now()
    ret_date = date.strftime("%B") + "," + str(date.year)
    '''
    try:
        doc_ref = db.collection('users').document()
        data = {
            'name': 'Steve',
            'status': 'is working'
        }
        doc_ref.set(data)

    except:
                raise HTTPException(
            status_code = 400,
            detail= f"Error accessing db"
        )'
    '''
    return ret_date



