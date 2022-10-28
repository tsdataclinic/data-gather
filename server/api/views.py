from fastapi import FastAPI
from schemas import PydanticInterview

app = FastAPI(title="Interview App API")


@app.get("/")
def hello():
    return {"message": "Hello World"}


@app.get("/api/hello")
def hello_api():
    return {"message": "Hello World"}


@app.post("/api/interviews/", response_model=PydanticInterview)
def create_interview(interview: PydanticInterview):
    return "whatever"
