import os
from sqlmodel import create_engine

from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import event

SQLITE_DB_PATH = os.environ.get("DB_PATH", "./db.sqlite")


# By default sqlite doesn't enforce foreign key constraints
# ths code ensures that it is enforced for all connections
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def create_fk_constraint_engine(file_path: str = SQLITE_DB_PATH):
    return create_engine(f"sqlite:///{file_path}")


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=create_fk_constraint_engine())
