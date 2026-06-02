import uuid
from sqlalchemy import Column, String, Text, Integer, TIMESTAMP, func, UUID, ForeignKey, JSON
from app.database import Base

class Video(Base):
    __tablename__ = "videos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    caption = Column(Text)
    tags = Column(JSON)  # list[str]
    video_url = Column(String(500), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)