from fastapi import APIRouter
from schemas.auth_schema import LoginRequest, LoginResponse, SignupRequest, SignupResponse
from controllers.users.auth_controller import login_controller, signup_controller
from utils.response import standard_response

router = APIRouter()

@router.post("/login", response_model=standard_response)
def login(payload: LoginRequest):
    return login_controller(payload)

@router.post("/signup", response_model=standard_response)
def signup(payload: SignupRequest):
    return signup_controller(payload)
