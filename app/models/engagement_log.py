import uuid
from sqlalchemy import Column, String, Integer, TIMESTAMP, func, UUID, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class EngagementLog(Base):
    __tablename__ = "engagement_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action = Column(String(80), nullable=False)
    points = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="engagement_logs")
