from fastapi import APIRouter, Depends, HTTPException
from .user_routes import authenticate_user, UserInfo
from pydantic import BaseModel
from .database import users, database

router = APIRouter()

class MatrixData(BaseModel):
    matrix_data: str

@router.get("/api/matrix")
async def get_matrix_data(current_user: UserInfo = Depends(authenticate_user)):
    print(current_user.matrix_data, flush=True)
    return {"matrix_data": current_user.matrix_data}

@router.put("/api/matrix")
async def update_matrix_data(matrix_data: MatrixData, current_user: UserInfo = Depends(authenticate_user)):
    if (len(matrix_data.matrix_data) > 512000):
        print(current_user.username + ": " + str(len(current_user.matrix_data)), flush = True)
        raise HTTPException(status_code = 413, detail = "Matrix data too large")

    query = users.update().where(users.c.username == current_user.username).values(matrix_data = matrix_data.matrix_data)
    await database.execute(query)
    return {"status": "success"}
    