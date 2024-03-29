import logging

from sqlalchemy_utils import create_database, database_exists
from sqlmodel import SQLModel

# import all models so that the classes get registered with SQLModel
from . import models
from .engine import SQLITE_DB_PATH, create_fk_constraint_engine

LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def initialize_dev_db(file_path: str = SQLITE_DB_PATH):
    """Set up the SQLite database"""
    url = f"sqlite:///{file_path}"
    if not database_exists(url):
        LOG.info(f"No database found at {file_path}, creating...")
        create_database(url)
    else:
        LOG.info(f"Existing database found at {file_path}")
    engine = create_fk_constraint_engine(file_path)
    SQLModel.metadata.create_all(engine)
