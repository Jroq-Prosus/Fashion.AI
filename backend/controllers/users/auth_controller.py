from services.auth_service import login_service
from schemas.auth_schema import LoginRequest, LoginResponse
from utils.response import standard_response

def login_controller(payload: LoginRequest) -> standard_response:
    token = login_service(payload.email, payload.password)
    return standard_response(
        code=200,
        message="Login successful",
        data={
            "email": payload.email,
            "token": token,
            "token_type": "bearer"
        }
    )