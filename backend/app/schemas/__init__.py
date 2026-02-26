"""Pydantic schemas."""
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    AlumniCreate,
    AlumniUpdate,
    AlumniResponse,
)
from app.schemas.auth import Token, TokenData, LoginRequest, SignupRequest, RefreshTokenRequest
from app.schemas.blog import BlogBase, BlogCreate, BlogUpdate, BlogResponse, BlogWithAuthor
from app.schemas.message import MessageBase, MessageCreate, MessageResponse, ConversationResponse
from app.schemas.connection import ConnectionCreate, ConnectionResponse, ConnectionUpdate
from app.schemas.achievement import (
    AchievementBase,
    AchievementCreate,
    AchievementUpdate,
    AchievementResponse,
)
from app.schemas.notification import NotificationResponse, NotificationUpdate
from app.schemas.college import CollegeBase, CollegeCreate, CollegeUpdate, CollegeResponse

__all__ = [
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "AlumniCreate",
    "AlumniUpdate",
    "AlumniResponse",
    "Token",
    "TokenData",
    "LoginRequest",
    "SignupRequest",
    "RefreshTokenRequest",
    "BlogBase",
    "BlogCreate",
    "BlogUpdate",
    "BlogResponse",
    "BlogWithAuthor",
    "MessageBase",
    "MessageCreate",
    "MessageResponse",
    "ConversationResponse",
    "ConnectionCreate",
    "ConnectionResponse",
    "ConnectionUpdate",
    "AchievementBase",
    "AchievementCreate",
    "AchievementUpdate",
    "AchievementResponse",
    "NotificationResponse",
    "NotificationUpdate",
    "CollegeBase",
    "CollegeCreate",
    "CollegeUpdate",
    "CollegeResponse",
]
