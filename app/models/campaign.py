import uuid
from sqlalchemy import Column, String, Text, JSON, TIMESTAMP, func, UUID, ForeignKey, Integer, Index
from sqlalchemy.orm import relationship
from app.database import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    campaign_type = Column(String(80), nullable=False)
    target_audience = Column(JSON, nullable=True)
    waste_categories = Column(JSON, nullable=True)
    goals = Column(JSON, nullable=True)
    milestones = Column(JSON, nullable=True)
    location = Column(String(255), nullable=True)
    start_date = Column(TIMESTAMP, nullable=True)
    end_date = Column(TIMESTAMP, nullable=True)
    status = Column(String(40), default="draft", nullable=False)
    participants_count = Column(Integer, default=0)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    creator = relationship("User")

    __table_args__ = (
        Index("ix_campaigns_status", "status"),
        Index("ix_campaigns_campaign_type", "campaign_type"),
        Index("ix_campaigns_created_at", created_at.desc()),
    )
