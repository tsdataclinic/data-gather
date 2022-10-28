import os
from fastapi import FastAPI
from schemas import PydanticInterview
from server.models import Interview
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLITE_DB_PATH = os.environ.get("DB_PATH", "./db.sqlite")

app = FastAPI(title="Interview App API")


@app.get("/")
def hello_api():
    return {"message": "Hello World"}


@app.post("/api/interviews/", response_model=PydanticInterview)
def create_interview(interview: PydanticInterview):
    return "whatever"

    # https://fastapi.tiangolo.com/tutorial/sql-databases/
    # create_the_engine()
    # engine.commit()


@app.get("/api/interviews/")
def get_interviews():
    engine = create_engine(f"sqlite:///{SQLITE_DB_PATH}")
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    interviews = SessionLocal().query(Interview).limit(100).all()
    return interviews
