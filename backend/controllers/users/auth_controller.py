from services.auth_service import login_service, signup_service
from schemas.auth_schema import LoginRequest, LoginResponse, SignupRequest, SignupResponse
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

def signup_controller(payload: SignupRequest) -> standard_response:
    result = signup_service(payload.email, payload.password)
    return standard_response(
        code=201,
        message="Signup successful",
        data=result
    )