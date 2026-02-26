"""Notification Pydantic schemas."""
from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    """Schema for notification response."""

    id: UUID
    user_id: UUID
    type: str
    message: str
    is_read: bool
    created_at: datetime
    message_id: Optional[UUID] = None
    sender_id: Optional[UUID] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class NotificationUpdate(BaseModel):
    """Schema for updating notification."""

    is_read: bool
