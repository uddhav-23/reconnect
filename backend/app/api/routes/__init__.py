"""API route modules."""
from app.api.routes import (
    auth,
    users,
    alumni,
    blogs,
    messages,
    connections,
    achievements,
    notifications,
    colleges,
    websocket,
)

__all__ = [
    "auth",
    "users",
    "alumni",
    "blogs",
    "messages",
    "connections",
    "achievements",
    "notifications",
    "colleges",
    "websocket",
]
