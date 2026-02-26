"""College Pydantic schemas."""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr


class CollegeBase(BaseModel):
    """Base college schema."""

    name: str
    description: Optional[str] = None
    logo: Optional[str] = None
    departments: Optional[List[str]] = None
    established_year: Optional[int] = None
    website: Optional[str] = None
    contact_email: EmailStr
    phone: Optional[str] = None


class CollegeCreate(CollegeBase):
    """Schema for creating a college."""

    university_id: Optional[UUID] = None
    admin_name: Optional[str] = None
    admin_email: Optional[str] = None


class CollegeUpdate(BaseModel):
    """Schema for updating a college."""

    name: Optional[str] = None
    description: Optional[str] = None
    logo: Optional[str] = None
    departments: Optional[List[str]] = None
    established_year: Optional[int] = None
    website: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    phone: Optional[str] = None


class CollegeResponse(CollegeBase):
    """Schema for college response."""

    id: UUID
    university_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True
