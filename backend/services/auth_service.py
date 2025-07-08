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
        print(f"[DEBUG] Signup payload: email={email}, password={'*' * len(password)}")
        response = supabase.auth.sign_up({"email": email, "password": password})
        print(f"[DEBUG] Supabase signup response: {response}")
        if response.user is None:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST,
                detail="User creation failed."
            )
        # Insert into public.users
        user_id = response.user.id
        user_row = {
            "id": user_id,
            "email": email,
            "username": email,  # or derive from email
            "full_name": email,  # or blank
            "password": "",    # never store plaintext password
        }
        supabase.table("users").insert(user_row).execute()
        # Insert into user_profile
        profile_row = {
            "user_id": user_id,
            "description": ""
        }
        supabase.table("user_profile").insert(profile_row).execute()
        return {"email": email, "message": "User created successfully."}
    except Exception as e:
        print(f"[DEBUG] Signup error: {e}")
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=f"Signup failed: {str(e)}"
        )
