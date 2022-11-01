import logging
import os
import re

from sqlalchemy_utils import create_database, database_exists
from sqlmodel import SQLModel, create_engine

SQLITE_DB_PATH = os.environ.get("DB_PATH", "./db.sqlite")
LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def snake_to_camel(snake_str: str) -> str:
    """Convert a snake_case string to camelCase"""
    # upper case each part of the string.
    # str.title() handles snake case. e.g. ab_cd => Ab_Cd
    camel = snake_str.title()
    # remove underscores
    camel = re.sub("([0-9A-Za-z])_(?=[0-9A-Z])", lambda m: m.group(1), camel)
    # make the first character lowercase
    camel = re.sub("(^_*[A-Z])", lambda m: m.group(1).lower(), camel)
    return camel


class APIModel(SQLModel):
    """Any models that are returned in our REST API should extend this class"""

    class Config(SQLModel.Config):
        """This config is used for any models that are returned by our API to
        automatically convert snake_case fields to camelCase"""

        allow_population_by_field_name = True
        alias_generator = snake_to_camel


def initialize_dev_db(file_path: str = SQLITE_DB_PATH):
    """Set up the SQLite database"""
    url = f"sqlite:///{file_path}"
    if not database_exists(url):
        LOG.info(f"No database found at {file_path}, creating...")
        create_database(url)
    else:
        LOG.info(f"Existing database found at {file_path}")
    engine = create_engine(url)
    SQLModel.metadata.create_all(engine)
