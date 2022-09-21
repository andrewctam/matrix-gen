import os
import databases
import sqlalchemy
from typing import List
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.sql import text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

users = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime),
    sqlalchemy.Column("username", sqlalchemy.VARCHAR), 
    sqlalchemy.Column("password", sqlalchemy.VARCHAR),
    sqlalchemy.Column("matrix_data", sqlalchemy.VARCHAR)
)
class User(BaseModel):
    id: int
    created_at: str
    username: str
    password: str
    matrix_data: str


engine = sqlalchemy.create_engine(DATABASE_URL)
app = FastAPI()

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

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


@app.get("/matrix")
async def root():
    query = users.select(text("matrix_data"))
    return await database.fetch_all(query)

@app.post("/matrix", response_model=User)
async def register_new_user(user: User):
    print(user)
    query = users.insert().values(userName = user.username, password = user.password, matrix_data = user.matrix_data)
    last_record_id = await database.execute(query)
    

    return {**user.dict(), "id": last_record_id}
    
    
    