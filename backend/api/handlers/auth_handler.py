from fastapi import APIRouter
from schemas.auth_schema import LoginRequest, LoginResponse
from controllers.users.auth_controller import login_controller
from utils.response import standard_response

router = APIRouter()

@router.post("/login", response_model=standard_response)
def login(payload: LoginRequest):
    return login_controller(payload)
