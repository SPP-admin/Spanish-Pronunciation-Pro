from pydantic import BaseModel

class SignUpSchema(BaseModel):
    email:str
    password:str
    displayName:str

class LoginSchema(BaseModel):
    email:str
    password:str
