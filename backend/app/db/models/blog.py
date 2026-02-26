"""Blog database model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base


class Blog(Base):
    """Blog post model."""

    __tablename__ = "blogs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(String(1000), nullable=True)
    cover_image = Column(String(500), nullable=True)
    tags = Column(JSON, nullable=True, default=list)  # List of strings
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    published_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    likes = Column(Integer, default=0, nullable=False)
    liked_by = Column(JSON, nullable=True, default=list)  # List of user IDs
    shares = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    author = relationship("User", back_populates="blogs")
