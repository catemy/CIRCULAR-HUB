from datetime import datetime
from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class InstitutionBase(BaseModel):
    name: str
    type: str
    address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    description: Optional[str] = None
    sustainability_goals: Optional[str] = None

class InstitutionCreate(InstitutionBase):
    pass

class InstitutionResponse(InstitutionBase):
    id: UUID
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True