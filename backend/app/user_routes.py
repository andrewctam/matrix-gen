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


class UserInfo(BaseModel): #info given after token is verified
    username: str
    matrix_data: str
    settings: str
class LoginUser(BaseModel):
    username: str
    password: str
class RegisterUser(BaseModel):
    username: str
    password: str
    matrix_data: str
    settings: str
class ChangeUserPassword(BaseModel):
    username: str
    current_password: str
    new_password: str


#for invalid access token
invalidate_credentials_exception = HTTPException (
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) 

#for incorrect password
invalid_password_exception = HTTPException (
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid password",
            headers={"WWW-Authenticate": "Bearer"},
        ) 


async def check_credentials(username: str, password: str):
    query = users.select().where(users.c.username == username)
    user = await database.fetch_one(query)

    if not user:
        return False
    
    return pwd_context.verify(password, user.hashed_password)


def create_access_token(username: str):
    to_encode = {"exp": datetime.utcnow() + timedelta(minutes = 30), "sub": username}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt

async def create_refresh_token(username: str):
    to_encode = {"exp": datetime.utcnow() + timedelta(days = 30), "sub": username}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

    query = users.update().where(users.c.username == username).values(refresh_token = encoded_jwt)
    await database.execute(query)

    return encoded_jwt

async def authenticate_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="/api/login"))):
    #check if token is valid
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except:
        raise invalidate_credentials_exception

    username: str = payload.get("sub")
    if not username:
        raise invalidate_credentials_exception

    query = users.select().where(users.c.username == username)
    user = await database.fetch_one(query)

    if not user:
        raise invalidate_credentials_exception
    else:
        return user

@router.post("/api/token")
async def refresh_tokens(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except:
        raise invalidate_credentials_exception

    # Check if refresh token is valid
    username: str = payload.get("sub")
    if username is None:
        raise invalidate_credentials_exception


    # Check if refresh token is same as the one in the database
    query = users.select().where(users.c.username == username)
    user = await database.fetch_one(query)

    if not user or user.refresh_token != token:
        raise invalidate_credentials_exception


    #refresh access token and create a new refresh token
    access_token = create_access_token(username)
    refresh_token = await create_refresh_token(username)

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.get("/api/user")
async def username_taken(username: str):
    query = users.select().where(users.c.username == username)
    user_exists = await database.fetch_one(query)

    return user_exists is not None


@router.post("/api/login")
async def login_user(user: LoginUser):
    #check username and password
    if not await check_credentials(user.username, user.password):
        raise invalid_password_exception

    #create tokens
    access_token = create_access_token(user.username)
    refresh_token = await create_refresh_token(user.username)

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/api/register")
async def register_new_user(user: RegisterUser):
    #check if username is already taken
    if await username_taken(user.username):
        raise HTTPException(status_code=400, detail="Username already taken")

    #add user data to databse
    query = users.insert().values(username = user.username, 
                                    hashed_password = pwd_context.hash(user.password), 
                                    matrix_data = user.matrix_data, 
                                    settings = user.settings)

    await database.execute(query)

    #create tokens
    access_token = create_access_token(user.username)
    refresh_token = await create_refresh_token(user.username)

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.delete("/api/delete")
async def delete_user(user: LoginUser, current_user: UserInfo = Depends(authenticate_user)):
    #check if username and password are correct
    if (await check_credentials(user.username, user.password)):
        query = users.delete().where(users.c.username == current_user.username)
        await database.execute(query)

        return {"status": "deleted"}

    else:
        raise invalid_password_exception


@router.put("/api/password")
async def change_password(user: ChangeUserPassword, current_user: UserInfo = Depends(authenticate_user)):
    #check if username and password are correct
    if (await check_credentials(user.username, user.current_password)):
        query = users.update().where(users.c.username == user.username).values(hashed_password = pwd_context.hash(user.new_password))
        await database.execute(query)

        return {"status": "Password Changed"}
    else:
       raise invalid_password_exception
