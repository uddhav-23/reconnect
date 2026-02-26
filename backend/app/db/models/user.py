"""User database models."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    """Base user model."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(
        String(50),
        nullable=False,
        index=True,
    )  # superadmin, subadmin, alumni, student, user
    university_id = Column(UUID(as_uuid=True), nullable=True)
    college_id = Column(UUID(as_uuid=True), ForeignKey("colleges.id"), nullable=True)
    profile_picture = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    college = relationship("College", back_populates="users")
    sent_messages = relationship(
        "Message", foreign_keys="Message.sender_id", back_populates="sender"
    )
    received_messages = relationship(
        "Message", foreign_keys="Message.receiver_id", back_populates="receiver"
    )
    sent_connections = relationship(
        "Connection",
        foreign_keys="Connection.requester_id",
        back_populates="requester",
    )
    received_connections = relationship(
        "Connection",
        foreign_keys="Connection.receiver_id",
        back_populates="receiver",
    )
    blogs = relationship("Blog", back_populates="author")
    achievements = relationship("Achievement", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class Alumni(Base):
    """Extended alumni model with additional fields."""

    __tablename__ = "alumni"

    id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    graduation_year = Column(Integer, nullable=False)
    degree = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    current_company = Column(String(255), nullable=True)
    current_position = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    bio = Column(String(2000), nullable=True)
    skills = Column(JSON, nullable=True, default=list)  # List of strings
    social_links = Column(JSON, nullable=True, default=dict)  # Dict of social links
    address = Column(String(500), nullable=True)

    # Relationship
    user = relationship("User", backref="alumni_profile")
