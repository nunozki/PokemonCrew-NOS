from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import os
from . import models, database


# Security settings
SECRET_KEY = os.getenv("SECRET_KEY", "a_very_secret_key_that_should_be_in_env_vars_for_dev")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login", auto_error=False)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(request: Request, db: Session = Depends(database.get_db), token_from_header: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_str = None
    try:
        # Prioritize cookie-based token for web app security
        cookie_token = request.cookies.get("access_token")
        
        if cookie_token:
            # The cookie value is "Bearer <token>", we need to extract the token part.
            token_parts = cookie_token.split(" ")
            if len(token_parts) == 2 and token_parts[0] == "Bearer":
                token_str = token_parts[1]
        # Fallback to Authorization header for Swagger UI / other clients
        elif token_from_header:
            # The header dependency already extracts the token
            token_str = token_from_header
        else:
            raise credentials_exception
        
        payload = jwt.decode(token_str, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        user = db.query(models.User).filter(models.User.username == username).first()
        if user is None:
            raise credentials_exception
        return user
    except (JWTError, IndexError, AttributeError):
        # DEV MODE: If token is invalid or not present, return the first user as a default.
        # This allows working on features without needing to be logged in.
        # In production, this block should just `raise credentials_exception`.
        user = db.query(models.User).first()
        if user is None:
            raise HTTPException(status_code=404, detail="Default user not found for dev mode. Please register a user.")
        return user

def require_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action.",
        )
    return current_user

def require_admin_or_no_admins_exist(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """
    Dependency that requires the current user to be an admin,
    OR for there to be no admins in the system yet.
    This allows the first user to be promoted.
    """
    admin_count = db.query(models.User).filter(models.User.role == "admin").count()
    if admin_count > 0 and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action.",
        )
    return current_user