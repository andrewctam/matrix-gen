from datetime import datetime, timedelta
from typing import Optional
from xml.sax import saxutils

from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from .database import users, database

from dotenv import load_dotenv
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter()

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")

class User(BaseModel):
    username: str
    matrix_data: str

class UserData(BaseModel):
    username: str
    password: str
    matrix_data: str


async def authenticate_user(username: str, password: str):
    query = users.select().where(users.c.username == username)
    user = await database.fetch_one(query)

    if not user:
        return False

    return pwd_context.verify(user.password, pwd_context.hash(password))


def create_token(username: str):
    to_encode = {"exp": datetime.utcnow() + timedelta(minutes=30), "sub": username}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt


async def get_current_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="/api/login"))):
    
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    username:str = payload.get("sub")

    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    query = users.select().where(users.c.username == username)
    user = await database.fetch_one(query)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    else:
        return user


async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@router.post("/api/login")
async def login_user(user: UserData):
    if not await authenticate_user(user.username, user.password):
        raise HTTPException (
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_token(user.username)
    return {"access_token": token, "token_type": "bearer"}
    

@router.post("/api/register")
async def register_new_user(user: UserData):
    query = users.select().where(users.c.username == user.username)
    user_exists = await database.fetch_one(query)

    if user_exists:
        raise HTTPException (
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username already exists",
            headers={"WWW-Authenticate": "Bearer"},
        )


    query = users.insert().values(username = user.username, password = user.password, matrix_data = user.matrix_data)
    await database.execute(query)

    token = create_token(user.username)
    return {"access_token": token, "token_type": "bearer"}
