import uvicorn
from fastapi import FastAPI, HTTPException
from firebase_admin import credentials, auth
import firebase_admin
from fastapi.responses import JSONResponse
from models import LoginSchema, SignUpSchema
import pyrebase
import sys
import config

sys.path.append("mydir")

if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)


firebase = pyrebase.initialize_app(config.firebaseConfig)



if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

app = FastAPI(
    description = "Login/Signup",
    title = "Login/Signup",
    docs_url= "/"
)

@app.post("/signup")
async def signup(request: SignUpSchema):
    email = request.email
    password = request.password

    try:
        # Look into password hashing.
        # salt = bcrypt.gensalt()   

        user = auth.create_user(
            email = email,
            password = password,
        )


        return JSONResponse(content={"message": "User was successfully added"}, 
                                status_code = 201)

    except auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code = 400,
            detail= f"Account exists with this email"
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
        return JSONResponse(content={"id":id
                                     }, status_code = 201
                            )
    except:
        raise HTTPException(
            status_code = 400,
            detail= f"Incorrect login information"
        )


