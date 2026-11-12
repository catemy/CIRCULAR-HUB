from typing import List, Optional
from pydantic import BaseModel, Field


class WasteScanReport(BaseModel):
    waste_category: str
    detected_items: List[str] = Field(default_factory=list)
    hazard_level: str
    confidence: float = Field(ge=0, le=1)
    environmental_impact: str
    disposal_recommendations: List[str]
    recycling_methods: List[str]
    reuse_opportunities: List[str]
    sustainability_suggestions: List[str]
    safety_precautions: List[str]
    decomposition_timeline: str
    sorting_guidance: str
    global_context: str
    recommended_campaign_types: List[str] = Field(default_factory=list)
    limitations: Optional[str] = None


class WasteScanResponse(BaseModel):
    provider: str
    model: str
    report: WasteScanReport


class AssistantChatRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)


class AssistantChatResponse(BaseModel):
    answer: str
    provider: str
    model: str
