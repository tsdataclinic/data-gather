from fastapi import FastAPI

from server.api.schemas import PydanticInterview

app = FastAPI(title="Interview App API")


@app.get("/api/health")
def health_check():
    return {"message": "API is up!"}


@app.post("/api/interviews/", response_model=PydanticInterview)
def create_interview(interview: PydanticInterview):
    return "whatever"
