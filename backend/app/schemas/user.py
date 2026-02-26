"""User Pydantic schemas."""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base user schema."""

    email: EmailStr
    name: str
    role: str
    phone: Optional[str] = None
    profile_picture: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a user."""

    password: str
    college_id: Optional[UUID] = None
    university_id: Optional[UUID] = None


class UserUpdate(BaseModel):
    """Schema for updating a user."""

    name: Optional[str] = None
    phone: Optional[str] = None
    profile_picture: Optional[str] = None
    college_id: Optional[UUID] = None


class UserResponse(UserBase):
    """Schema for user response."""

    id: UUID
    college_id: Optional[UUID] = None
    university_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class AlumniCreate(UserCreate):
    """Schema for creating an alumni."""

    graduation_year: int
    degree: str
    department: str
    current_company: Optional[str] = None
    current_position: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    social_links: Optional[dict] = None
    address: Optional[str] = None


class AlumniUpdate(BaseModel):
    """Schema for updating alumni."""

    name: Optional[str] = None
    phone: Optional[str] = None
    profile_picture: Optional[str] = None
    graduation_year: Optional[int] = None
    degree: Optional[str] = None
    department: Optional[str] = None
    current_company: Optional[str] = None
    current_position: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    social_links: Optional[dict] = None
    address: Optional[str] = None


class AlumniResponse(UserResponse):
    """Schema for alumni response."""

    graduation_year: Optional[int] = None
    degree: Optional[str] = None
    department: Optional[str] = None
    current_company: Optional[str] = None
    current_position: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    social_links: Optional[dict] = None
    address: Optional[str] = None

    class Config:
        """Pydantic config."""

        from_attributes = True
