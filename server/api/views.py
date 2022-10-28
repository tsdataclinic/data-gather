from fastapi import FastAPI

app = FastAPI(title="Interview App API")


@app.get("/")
def hello():
    return {"message": "Hello World"}


@app.get("/api/hello")
def hello_api():
    return {"message": "Hello World"}

