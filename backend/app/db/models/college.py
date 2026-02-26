"""College database model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base


class College(Base):
    """College model."""

    __tablename__ = "colleges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    university_id = Column(UUID(as_uuid=True), nullable=True)
    logo = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    departments = Column(JSON, nullable=True, default=list)  # List of strings
    established_year = Column(Integer, nullable=True)
    website = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    admin_name = Column(String(255), nullable=True)
    admin_email = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    users = relationship("User", back_populates="college")
