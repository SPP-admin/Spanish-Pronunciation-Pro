from pydantic import BaseModel

class SignUpSchema(BaseModel):
    email:str
    password:str
    displayName:str

class LoginSchema(BaseModel):
    email:str
    password:str

class ChunkSchema(BaseModel):
    lesson:str
    chunk:str
    completed:bool
    completionDate:str

class BaseSchema(BaseModel):
    id: str