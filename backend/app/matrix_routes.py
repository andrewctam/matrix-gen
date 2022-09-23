from fastapi import APIRouter, Depends, HTTPException
from .user_routes import get_current_active_user, User
from .database import users, database

router = APIRouter()

@router.get("/api/matrix")
async def get_matrix_data(current_user: User = Depends(get_current_active_user)):
    query = users.select().where(users.c.username == current_user.username)
    user = await database.fetch_one(query)
    return {"matrix_data": user.matrix_data}

@router.put("/api/matrix")
async def update_matrix_data(user: User, current_user: User = Depends(get_current_active_user)):
    if (len(user.matrix_data) > 512000):
        print(user.username + ": " + str(len(user.matrix_data)), flush = True)
        raise HTTPException(status_code = 413, detail = "Matrix data too large")

    query = users.update().where(users.c.username == current_user.username).values(matrix_data = user.matrix_data)
    await database.execute(query)
    return {"status": "success"}
    
