import uuid
from sqlalchemy import Column, String, Integer, TIMESTAMP, func, UUID, ForeignKey, Index
from app.database import Base


class ImpactMetric(Base):
    __tablename__ = "impact_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_type = Column(String(40), nullable=False)
    subject_id = Column(UUID(as_uuid=True), nullable=True)
    metric_name = Column(String(120), nullable=False)
    metric_value = Column(Integer, nullable=False, default=0)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id"), nullable=True)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        Index("ix_impact_metrics_subject", "subject_type", "subject_id"),
        Index("ix_impact_metrics_institution_created", "institution_id", "created_at"),
        Index("ix_impact_metrics_campaign_created", "campaign_id", "created_at"),
    )
