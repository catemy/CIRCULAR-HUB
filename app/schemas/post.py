from datetime import datetime
from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional

class PostCreate(BaseModel):
    title: str
    description: str
    media_url: Optional[str] = None
    tags: Optional[List[str]] = None
    waste_categories_used: Optional[List[str]] = None
    environmental_value: Optional[str] = None
    materials_used: Optional[List[str]] = None
    project_steps: Optional[List[str]] = None
    before_media_url: Optional[str] = None
    after_media_url: Optional[str] = None
    educational_references: Optional[List[str]] = None
    collaboration_tags: Optional[List[str]] = None

class PostResponse(PostCreate):
    id: UUID
    author_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
