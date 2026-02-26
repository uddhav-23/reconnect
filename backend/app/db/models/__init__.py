"""Database models."""
from app.db.models.user import User, Alumni
from app.db.models.blog import Blog
from app.db.models.message import Message
from app.db.models.connection import Connection
from app.db.models.achievement import Achievement
from app.db.models.notification import Notification
from app.db.models.college import College

__all__ = [
    "User",
    "Alumni",
    "Blog",
    "Message",
    "Connection",
    "Achievement",
    "Notification",
    "College",
]
