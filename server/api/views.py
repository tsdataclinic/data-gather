from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, create_engine

from server.init_db import SQLITE_DB_PATH
from server.models import Interview, InterviewGetWithScreens

app = FastAPI(title="Interview App API")

# allow access from create-react-app
origins = ["http://localhost:3000"]

app.add_middleware(CORSMiddleware, allow_origins=origins)


def rm_relationships(Cls):
    NewClass = type("NewClass", Cls.__bases__, dict(Cls.__dict__))
    delattr(NewClass, "screens")
    return NewClass


@app.get("/")
def hello_api():
    return {"message": "Hello World"}


@app.post("/api/interviews/", tags=["interviews"])
def create_interview(interview: Interview) -> str:
    print(interview)
    engine = create_engine(f"sqlite:///{SQLITE_DB_PATH}")
    session = Session(autocommit=False, autoflush=False, bind=engine)
    session.add(interview)
    session.commit()
    return "success"


@app.get(
    "/api/interviews/{interview_id}",
    response_model=InterviewGetWithScreens,
    tags=["interviews"],
)
def get_interview(interview_id: str) -> Interview:
    engine = create_engine(f"sqlite:///{SQLITE_DB_PATH}")
    session = Session(autocommit=False, autoflush=False, bind=engine)
    interview = session.get(Interview, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview


@app.get(
    "/api/interviews/",
    response_model=List[Interview],
    tags=["interviews"],
)
def get_interviews() -> list[Interview]:
    engine = create_engine(f"sqlite:///{SQLITE_DB_PATH}")
    session = Session(autocommit=False, autoflush=False, bind=engine)
    interviews: List[Interview] = session.query(Interview).limit(100).all()
    return interviews
