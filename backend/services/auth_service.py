from db.supabase_client import supabase
from fastapi import HTTPException
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_400_BAD_REQUEST

def login_service(email: str, password: str) -> str:
    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        # If login fails, response.user will be None
        if response.user is None or response.session is None:
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )
        return response.session.access_token
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {str(e)}"
        )

def signup_service(email: str, password: str) -> dict:
    try:
        response = supabase.auth.sign_up({"email": email, "password": password})
        if response.user is None:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST,
                detail="User creation failed."
            )
        return {"email": email, "message": "User created successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=f"Signup failed: {str(e)}"
        )
