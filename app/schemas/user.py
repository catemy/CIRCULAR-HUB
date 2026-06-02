from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    role: Optional[str] = "Individual"
    country: Optional[str] = "Global"
    interests: List[str] = Field(default_factory=list)
    goals: List[str] = Field(default_factory=list)
    onboarding_complete: bool = False

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    username: Optional[str] = None
    email: Optional[EmailStr] = None

class User(UserBase):
    id: UUID
    role: str
    points: int
    badge_level: int
    followers_count: int
    following_count: int
    badges: List[str] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True
