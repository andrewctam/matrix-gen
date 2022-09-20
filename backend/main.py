from fastapi import FastAPI
from pydantic import BaseModel

from dotenv import load_dotenv

load_dotenv()

database = os.getenv("DATABASE_URI")


class User(BaseModel):
    username: str
    password: str


app = FastAPI()


@app.get("/matrix")
async def root():
    return {"message": "Hello flyWorld"}
