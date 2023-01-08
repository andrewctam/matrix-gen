from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import database
from .user_routes import router as user_router
from .matrix_routes import router as matrix_router
from .settings_routes import router as settings_router
from .math_routes import router as math_router

app = FastAPI()
app.include_router(user_router)
app.include_router(matrix_router)
app.include_router(settings_router)
app.include_router(math_router)


origins = [
    "http://localhost",
    "https://matrixgen.fly.dev",
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
