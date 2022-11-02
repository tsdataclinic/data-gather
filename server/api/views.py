from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, create_engine

from server.init_db import SQLITE_DB_PATH
from server.models import Interview, prepare_relationships

app = FastAPI(title="Interview App API")

# allow access from create-react-app
origins = ["http://localhost:3000"]

app.add_middleware(CORSMiddleware, allow_origins=origins)


@app.get("/")
def hello_api():
    return {"message": "Hello World"}


@app.post("/api/interviews/", tags=["interviews"])
def create_interview(interview: Interview) -> str:
    engine = create_engine(f"sqlite:///{SQLITE_DB_PATH}")
    session = Session(autocommit=False, autoflush=False, bind=engine)
    session.add(interview)
    session.commit()
    return "success"


@app.get(
    "/api/interviews/{interview_id}",
    response_model=prepare_relationships(Interview, ["screens"]),
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
    response_model=list[Interview],
    tags=["interviews"],
)
def get_interviews() -> list[Interview]:
    engine = create_engine(f"sqlite:///{SQLITE_DB_PATH}")
    session = Session(autocommit=False, autoflush=False, bind=engine)
    interviews: list[Interview] = session.query(Interview).limit(100).all()
    return interviews
