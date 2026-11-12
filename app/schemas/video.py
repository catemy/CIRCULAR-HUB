from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class VideoBase(BaseModel):
    title: str
    caption: Optional[str] = None
    tags: list[str] = []
    video_url: str

class VideoCreate(VideoBase):
    pass

class Video(VideoBase):
    id: UUID
    user_id: UUID
    likes_count: int
    comments_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class LikeCreate(BaseModel):
    video_id: UUID

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    video_id: UUID

class Comment(CommentBase):
    id: UUID
    user_id: UUID
    video_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True