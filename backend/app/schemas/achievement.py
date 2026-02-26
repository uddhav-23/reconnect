"""Achievement Pydantic schemas."""
from typing import Optional
from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel


class AchievementBase(BaseModel):
    """Base achievement schema."""

    title: str
    description: str
    date: date
    category: str
    image: Optional[str] = None


class AchievementCreate(AchievementBase):
    """Schema for creating an achievement."""

    pass


class AchievementUpdate(BaseModel):
    """Schema for updating an achievement."""

    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    category: Optional[str] = None
    image: Optional[str] = None


class AchievementResponse(AchievementBase):
    """Schema for achievement response."""

    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True
