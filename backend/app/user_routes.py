from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from .database import users, database
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter()

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")

class User(BaseModel):
    username: str
    matrix_data: str
class UserPassword(BaseModel):
    username: str
    password: str
class UserData(BaseModel):
    username: str
    password: str
    matrix_data: str
class ChangeUserPassword(BaseModel):
    username: str
    current_password: str
    new_password: str

async def authenticate_user(username: str, password: str):
    query = users.select().where(users.c.username == username)
    user = await database.fetch_one(query)

    if not user:
        return False
    
    return pwd_context.verify(password, user.hashed_password)


def create_token(username: str):
    to_encode = {"exp": datetime.utcnow() + timedelta(days=1), "sub": username}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt


async def get_current_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="/api/login"))):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )        

    username : str = payload.get("sub")

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

@router.get("/api/user")
async def username_taken(username: str):
    query = users.select().where(users.c.username == username)
    user_exists = await database.fetch_one(query)

    return user_exists is not None

@router.post("/api/token")
async def refresh_token(current_user: User = Depends(get_current_active_user)):
    token = create_token(current_user.username)
    return {"access_token": token, "token_type": "bearer"}

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
    if await username_taken(user.username):
        raise HTTPException (
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username already exists",
            headers={"WWW-Authenticate": "Bearer"},
        )

    query = users.insert().values(username = user.username, hashed_password = pwd_context.hash(user.password), matrix_data = user.matrix_data)
    await database.execute(query)

    token = create_token(user.username)
    return {"access_token": token, "token_type": "bearer"}


@router.delete("/api/delete")
async def delete_user(user: UserPassword, current_user: User = Depends(get_current_active_user)):
    if (await authenticate_user(user.username, user.password)):
        query = users.delete().where(users.c.username == current_user.username)
        await database.execute(query)
        return {"status": "deleted"}

    else:
        raise HTTPException (
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password Incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.put("/api/password")
async def change_password(user: ChangeUserPassword, current_user: User = Depends(get_current_active_user)):
    if (await authenticate_user(user.username, user.current_password)):
        query = users.update().where(users.c.username == user.username).values(hashed_password = pwd_context.hash(user.new_password))
        await database.execute(query)

        return {"status": "Password Changed"}
    else:
       raise HTTPException (
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password Incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
