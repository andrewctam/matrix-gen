import os
import databases
import sqlalchemy
from dotenv import load_dotenv

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
    sqlalchemy.Column("hashed_password", sqlalchemy.VARCHAR),
    sqlalchemy.Column("matrix_data", sqlalchemy.VARCHAR),
    sqlalchemy.Column("refresh_token", sqlalchemy.VARCHAR)
)



engine = sqlalchemy.create_engine(DATABASE_URL)