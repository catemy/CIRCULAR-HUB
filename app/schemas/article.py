from pydantic import BaseModel
from datetime import datetime

class ArticleBase(BaseModel):
    title: str
    content: str
    category: str

class Article(ArticleBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True