from typing import Sequence

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, SQLModel


class BaseService:
    def __init__(self, db: Session):
        self.db = db

    def commit(
        self,
        add_models: Sequence[SQLModel] = [],
        delete_models: Sequence[SQLModel] = [],
        refresh_models: bool = False,
    ) -> None:
        """Commits a db session.

        Args:
            add_models (list[SQLModel], optional): Models to add or update
            delete_models  (list[SQLModel], optional): Models to delete
            refresh_models (bool, optional): Whether or not to refresh the added
                models after committing. Defaults to False.
        """
        for model in add_models:
            self.db.add(model)

        for model in delete_models:
            self.db.delete(model)

        try:
            self.db.commit()
        except IntegrityError as e:
            raise HTTPException(status_code=400, detail=str(e.orig))

        if refresh_models:
            for model in add_models:
                self.db.refresh(model)
