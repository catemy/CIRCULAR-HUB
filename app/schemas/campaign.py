from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class CampaignBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    summary: str
    campaign_type: str
    target_audience: Optional[List[str]] = None
    waste_categories: Optional[List[str]] = None
    goals: Optional[List[str]] = None
    milestones: Optional[List[str]] = None
    location: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: str = "draft"


class CampaignCreate(CampaignBase):
    pass


class CampaignResponse(CampaignBase):
    id: UUID
    participants_count: int
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CampaignListResponse(BaseModel):
    items: List[CampaignResponse]
    total: int
    skip: int
    limit: int
