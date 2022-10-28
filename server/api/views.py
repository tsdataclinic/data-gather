from fastapi import FastAPI

app = FastAPI(title="Interview App API")

@app.get("/")
def hello_api():
    return {"message": "Hello World"}