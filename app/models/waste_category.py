import uuid
from sqlalchemy import Column, String, Text, JSON, TIMESTAMP, func, UUID, Index
from app.database import Base

class WasteCategory(Base):
    __tablename__ = "waste_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), unique=True, nullable=False)
    classification = Column(String(120), nullable=True)
    hazard_level = Column(String(20), nullable=False)
    decomposition_timeline = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    proper_disposal_method = Column(Text, nullable=False)
    disposal_methods = Column(JSON, nullable=True)
    environmental_impact = Column(Text, nullable=True)
    recycling_potential = Column(Text, nullable=False)
    recycling_methods = Column(JSON, nullable=True)
    creative_reuse_ideas = Column(JSON, nullable=True)
    reuse_opportunities = Column(JSON, nullable=True)
    safety_precautions = Column(JSON, nullable=True)
    industry_relevance = Column(JSON, nullable=True)
    related_educational_resources = Column(JSON, nullable=True)
    infographic_media = Column(JSON, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        Index("ix_waste_categories_hazard_level", "hazard_level"),
        Index("ix_waste_categories_classification", "classification"),
    )
