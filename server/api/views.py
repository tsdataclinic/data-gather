from fastapi import FastAPI
from airtable_api import * 

app = FastAPI(title="Interview App API")

@app.get("/")
def hello_api():
    return {"message": "Hello World"}


@app.get("/airtable-records")
def get_all_airtable_records():
    pass

@app.get("/airtable-record")
def get_airtable_record():
    pass

@app.post("/airtable-record")
def create_airtable_record():
    pass

@app.put("/airtable-record")
def update_airtable_record():
    pass

