from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    email: str
    token: str
    token_type: str = "bearer"

class SignupRequest(BaseModel):
    email: str
    password: str

class SignupResponse(BaseModel):
    email: str
    message: str
