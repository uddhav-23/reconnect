"""Connection Pydantic schemas."""
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class ConnectionCreate(BaseModel):
    """Schema for creating a connection request."""

    receiver_id: UUID


class ConnectionResponse(BaseModel):
    """Schema for connection response."""

    id: UUID
    requester_id: UUID
    receiver_id: UUID
    status: str
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class ConnectionUpdate(BaseModel):
    """Schema for updating connection status."""

    status: str  # accepted or rejected
