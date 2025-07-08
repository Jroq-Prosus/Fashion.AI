from db.supabase_client import supabase
from utils.jwt_util import create_access_token
from fastapi import HTTPException
from starlette.status import HTTP_401_UNAUTHORIZED

# Mock user for demo
mock_users = {
    "admin": "admin123",
    "user": "user123"
}

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(email: str, password: str) -> str:
    # Fetch user by email from Supabase
    response = (
        supabase
        .table("users")
        .select("id, email, password")
        .eq("email", email)
        .single()
        .execute()
    )

    user = response.data

    if not user:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    hashed_password = user["password"]
    if not verify_password(password, hashed_password):
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Return user id as subject
    return user["id"]


def login_service(email: str, password: str) -> str:
    user_id = authenticate_user(email, password)
    token_data = {"sub": user_id}
    token = create_access_token(token_data)
    return token
