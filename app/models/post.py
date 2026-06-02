import uuid
from sqlalchemy import Column, String, Text, JSON, TIMESTAMP, func, UUID, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    media_url = Column(String(500), nullable=True)
    tags = Column(JSON, nullable=True)
    waste_categories_used = Column(JSON, nullable=True)
    environmental_value = Column(Text, nullable=True)
    materials_used = Column(JSON, nullable=True)
    project_steps = Column(JSON, nullable=True)
    before_media_url = Column(String(500), nullable=True)
    after_media_url = Column(String(500), nullable=True)
    educational_references = Column(JSON, nullable=True)
    collaboration_tags = Column(JSON, nullable=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    author = relationship("User", back_populates="posts")
    __table_args__ = (Index("ix_posts_created_at", created_at.desc()),)
