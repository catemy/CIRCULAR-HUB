import uuid
from sqlalchemy import Boolean, Column, JSON, String, Text, Integer, TIMESTAMP, func, UUID
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    bio = Column(Text)
    profile_image_url = Column(String(500))
    role = Column(String(20), default="Individual")  # Individual, Admin, Institution
    country = Column(String(100), default="Global")
    onboarding_complete = Column(Boolean, default=False)
    interests = Column(JSON, default=list)
    goals = Column(JSON, default=list)
    badges = Column(JSON, default=list)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    points = Column(Integer, default=0)
    badge_level = Column(Integer, default=1)
    followers_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)

    institutions = relationship("Institution", back_populates="creator")
    posts = relationship("Post", back_populates="author")
    engagement_logs = relationship("EngagementLog", back_populates="user")
