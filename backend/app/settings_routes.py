from fastapi import APIRouter, Depends
from pydantic import BaseModel
from .user_routes import authenticate_user, UserInfo
from .database import users, database

router = APIRouter()

class Settings(BaseModel):
    settings: str

@router.get("/api/settings")
async def get_settings(current_user: UserInfo = Depends(authenticate_user)):
    return {"settings": current_user.settings}

@router.put("/api/settings")
async def update_settings(settings: Settings, current_user: UserInfo = Depends(authenticate_user)):
    query = users.update().where(users.c.username == current_user.username).values(settings = settings.settings)
    await database.execute(query)

    return {"status": "success"}