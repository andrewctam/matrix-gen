
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.sql import text
from pydantic import BaseModel

from .database import database, users
from .user_routes import router as user_router
from .matrix_routes import router as matrix_router
app = FastAPI()
app.include_router(user_router)
app.include_router(matrix_router)

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
    "https://matrixgen.web.app"
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

    
    
