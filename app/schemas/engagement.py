from datetime import datetime
from pydantic import BaseModel
from uuid import UUID

class EngagementLogResponse(BaseModel):
    id: UUID
    user_id: UUID
    action: str
    points: int
    description: str
    created_at: datetime

    class Config:
        from_attributes = True
