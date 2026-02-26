"""Authentication schemas."""
from typing import Optional
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """Token response schema."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token data schema."""

    user_id: str
    email: str
    role: str


class LoginRequest(BaseModel):
    """Login request schema."""

    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    """Signup request schema."""

    email: EmailStr
    password: str
    name: str
    role: str
    phone: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""

    refresh_token: str
