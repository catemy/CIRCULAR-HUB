from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class ArticleBase(BaseModel):
    title: str
    content: str
    category: str

class Article(ArticleBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True