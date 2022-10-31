from pyairtable import Api, Base, Table
# https://pyairtable.readthedocs.io/en/latest/api.html

class AirtableAPI: 
    def __init__(self):
        self.api = Api('apikey')