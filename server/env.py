import os
from typing import Union

from dotenv import find_dotenv, load_dotenv

ENV_FILES = [
    ".env",
    ".env.local",
    ".env.development.local",
    ".env.test.local",
    ".env.prod",
    ".env.production.local",
]


def load_env():
    env_path = ""
    for env_test_path in ENV_FILES:
        path = find_dotenv(env_test_path)
        if path:
            env_path = path
            break
    load_dotenv(env_path)


load_env()


def get_env(env_key: str) -> Union[str, None]:
    return os.environ.get(env_key)
