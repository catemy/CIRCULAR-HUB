import uuid
from sqlalchemy import Column, String, Text, JSON, TIMESTAMP, func, UUID, ForeignKey, Integer, Float, Index
from app.database import Base


class MarketplaceListing(Base):
    __tablename__ = "marketplace_listings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    listing_type = Column(String(80), nullable=False)
    category = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(String(80), nullable=True)
    currency = Column(String(12), nullable=True)
    location = Column(String(120), nullable=True)
    image_url = Column(String(500), nullable=True)
    materials_used = Column(JSON, nullable=True)
    waste_types = Column(JSON, nullable=True)
    certifications = Column(JSON, nullable=True)
    sustainability_story = Column(Text, nullable=True)
    reuse_process = Column(Text, nullable=True)
    impact_score = Column(Integer, default=0)
    carbon_insight = Column(Text, nullable=True)
    availability = Column(String(120), nullable=True)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    rating = Column(Float, default=0)
    reviews_count = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        Index("ix_marketplace_listings_category", "category"),
        Index("ix_marketplace_listings_type", "listing_type"),
        Index("ix_marketplace_listings_created_at", created_at.desc()),
    )
