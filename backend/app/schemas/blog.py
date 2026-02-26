"""Blog Pydantic schemas."""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class BlogBase(BaseModel):
    """Base blog schema."""

    title: str
    content: str
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    tags: Optional[List[str]] = None


class BlogCreate(BlogBase):
    """Schema for creating a blog."""

    pass


class BlogUpdate(BaseModel):
    """Schema for updating a blog."""

    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    tags: Optional[List[str]] = None


class BlogResponse(BlogBase):
    """Schema for blog response."""

    id: UUID
    author_id: UUID
    published_at: datetime
    likes: int
    liked_by: List[str]
    shares: int
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class BlogWithAuthor(BlogResponse):
    """Blog with author information."""

    author_name: str
    author_email: str
