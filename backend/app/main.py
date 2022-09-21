
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.sql import text
from pydantic import BaseModel

from .database import database, users
from .user_routes import router as user_router

app = FastAPI()
app.include_router(user_router)

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class User(BaseModel):
    username: str
    password: str
    matrix_data: str

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


@app.get("/matrix")
async def read_users():
    query = users.select()
    return await database.fetch_all(query)

@app.post("/matrix", response_model=User)
async def register_new_user(user: User):
    print(user)
    query = users.insert().values(username = user.username, password = user.password, matrix_data = user.matrix_data)
    last_record_id = await database.execute(query)

    return {**user.dict(), "id": last_record_id}
    
    
