from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class MarketplaceListingBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    listing_type: str
    category: str
    description: str
    price: Optional[str] = None
    currency: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    materials_used: Optional[List[str]] = None
    waste_types: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    sustainability_story: Optional[str] = None
    reuse_process: Optional[str] = None
    impact_score: int = 0
    carbon_insight: Optional[str] = None
    availability: Optional[str] = None


class MarketplaceListingCreate(MarketplaceListingBase):
    pass


class MarketplaceListingResponse(MarketplaceListingBase):
    id: UUID
    seller_id: UUID
    rating: float
    reviews_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class MarketplaceListingListResponse(BaseModel):
    items: List[MarketplaceListingResponse]
    total: int
    skip: int
    limit: int
