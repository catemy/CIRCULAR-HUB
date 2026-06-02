from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VideoBase(BaseModel):
    title: str
    caption: Optional[str] = None
    tags: list[str] = []
    video_url: str

class VideoCreate(VideoBase):
    pass

class Video(VideoBase):
    id: str
    user_id: str
    likes_count: int
    comments_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class LikeCreate(BaseModel):
    video_id: str

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    video_id: str

class Comment(CommentBase):
    id: str
    user_id: str
    video_id: str
    created_at: datetime

    class Config:
        from_attributes = True