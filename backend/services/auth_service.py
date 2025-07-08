from db.supabase_client import supabase
from fastapi import HTTPException
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_400_BAD_REQUEST
from datetime import datetime

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
        # Insert into public.users
        user_id = response.user.id
        now = datetime.utcnow().isoformat()
        user_row = {
            "id": user_id,
            "email": email,
            "username": email,  # or derive from email
            "full_name": email,  # or blank
            "password": "",    # never store plaintext password
            "created_at": now,
            "updated_at": now
        }
        supabase.table("users").insert(user_row).execute()
        return {"email": email, "message": "User created successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=f"Signup failed: {str(e)}"
        )
