from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID
from typing import List, Optional

class WasteCategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    classification: Optional[str] = None
    hazard_level: str
    decomposition_timeline: Optional[str] = None
    description: str
    proper_disposal_method: str
    disposal_methods: Optional[List[str]] = None
    environmental_impact: Optional[str] = None
    recycling_potential: str
    recycling_methods: Optional[List[str]] = None
    creative_reuse_ideas: Optional[List[str]] = None
    reuse_opportunities: Optional[List[str]] = None
    safety_precautions: Optional[List[str]] = None
    industry_relevance: Optional[List[str]] = None
    related_educational_resources: Optional[List[str]] = None
    infographic_media: Optional[List[str]] = None

class WasteCategoryCreate(WasteCategoryBase):
    pass

class WasteCategoryUpdate(WasteCategoryBase):
    pass

class WasteCategoryResponse(WasteCategoryBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class WasteIdentifyRequest(BaseModel):
    description: str

class WasteCategoryListResponse(BaseModel):
    items: List[WasteCategoryResponse]
    total: int
    skip: int
    limit: int
