from utils.jwt_util import create_access_token
from fastapi import HTTPException
from starlette.status import HTTP_401_UNAUTHORIZED

# Mock user for demo
mock_users = {
    "admin": "admin123",
    "user": "user123"
}

def authenticate_user(email: str, password: str) -> str:
    if email in mock_users and mock_users[email] == password:
        # Return user id or username as subject
        return email
    raise HTTPException(
        status_code=HTTP_401_UNAUTHORIZED,
        detail="Invalid username or password"
    )

def login_service(username: str, password: str) -> str:
    user_id = authenticate_user(username, password)
    token_data = {"sub": user_id}
    token = create_access_token(token_data)
    return token
