"""API router configuration."""
from fastapi import APIRouter
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
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(alumni.router)
api_router.include_router(blogs.router)
api_router.include_router(messages.router)
api_router.include_router(connections.router)
api_router.include_router(achievements.router)
api_router.include_router(notifications.router)
api_router.include_router(colleges.router)
