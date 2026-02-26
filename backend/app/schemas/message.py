"""Message Pydantic schemas."""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class MessageBase(BaseModel):
    """Base message schema."""

    content: str


class MessageCreate(MessageBase):
    """Schema for creating a message."""

    receiver_id: UUID


class MessageResponse(MessageBase):
    """Schema for message response."""

    id: UUID
    sender_id: UUID
    receiver_id: UUID
    created_at: datetime
    read: bool
    read_at: Optional[datetime] = None
    deleted_by: Optional[List[str]] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class ConversationResponse(BaseModel):
    """Schema for conversation response."""

    user_id: UUID
    user_name: str
    user_email: str
    last_message: MessageResponse
    unread_count: int
