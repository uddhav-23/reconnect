"""Connection database model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base


class Connection(Base):
    """Connection request model."""

    __tablename__ = "connections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requester_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(
        String(20), nullable=False, default="pending"
    )  # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    requester = relationship("User", foreign_keys=[requester_id], back_populates="sent_connections")
    receiver = relationship(
        "User", foreign_keys=[receiver_id], back_populates="received_connections"
    )
