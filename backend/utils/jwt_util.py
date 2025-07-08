from fastapi import Header
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import base64
import json

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_id(authorization: str = Header(None)) -> str | None:
    print('get_user_id', authorization)
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split("Bearer ")[1]
    try:
        # Try to decode with jose first (verifies signature)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print('[DEBUG] Decoded JWT payload (jose):', payload)
        user_id = payload.get("sub")
        if user_id:
            return user_id
    except JWTError as e:
        print('[DEBUG] jose decode failed:', e)
        # Fallback: decode without verification (for debugging only)
        try:
            payload_part = token.split(".")[1]
            # Add padding if needed
            padding = '=' * (-len(payload_part) % 4)
            payload_bytes = base64.urlsafe_b64decode(payload_part + padding)
            payload_json = json.loads(payload_bytes)
            print('[DEBUG] Decoded JWT payload (no verify):', payload_json)
            return payload_json.get("sub")
        except Exception as e2:
            print('[DEBUG] Fallback decode failed:', e2)
    return None
