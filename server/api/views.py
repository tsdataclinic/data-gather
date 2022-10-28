import os
from typing import List

from fastapi import FastAPI
from server.models import Interview
from sqlmodel import create_engine, Session
from fastapi.middleware.cors import CORSMiddleware

SQLITE_DB_PATH = os.environ.get("DB_PATH", "./db.sqlite")

app = FastAPI(title="Interview App API")

# allow access from create-react-app
origins = [
    "http://localhost:3000",
]

app.add_middleware(CORSMiddleware, allow_origins=origins)


@app.get("/")
def hello_api():
    return {"message": "Hello World"}


@app.post("/api/interviews/")
def create_interview(interview: Interview):
    print(interview)
    engine = create_engine(f"sqlite:///{SQLITE_DB_PATH}")
    session = Session(autocommit=False, autoflush=False, bind=engine)
    session.add(interview)
    session.commit()
    return "success"


@app.get("/api/interviews/", response_model=List[Interview], tags=["interviews"])
def get_interviews():
    engine = create_engine(f"sqlite:///{SQLITE_DB_PATH}")
    session = Session(autocommit=False, autoflush=False, bind=engine)

    interviews = session.query(Interview).limit(100).all()
    return interviews
