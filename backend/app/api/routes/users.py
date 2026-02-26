"""User routes."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user, get_current_admin
from app.db.base import get_db
from app.db.models.user import User
from app.crud import user as crud_user
from app.schemas.user import UserResponse, UserUpdate, AlumniCreate, AlumniUpdate, AlumniResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    role: Optional[str] = None,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> List[UserResponse]:
    """Get all users (admin only)."""
    users = await crud_user.get_users(db, skip=skip, limit=limit, role=role)
    return [UserResponse.model_validate(user) for user in users]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Get user by ID."""
    user = await crud_user.get_user(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return UserResponse.model_validate(user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Update user information."""
    # Users can only update their own profile unless admin
    if current_user.id != user_id and current_user.role not in [
        "superadmin",
        "subadmin",
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user",
        )
    updated_user = await crud_user.update_user(db, user_id, user_update)
    if updated_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return UserResponse.model_validate(updated_user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a user (admin only)."""
    success = await crud_user.delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )


@router.post("/alumni", response_model=AlumniResponse, status_code=status.HTTP_201_CREATED)
async def create_alumni(
    alumni: AlumniCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> AlumniResponse:
    """Create a new alumni (admin only)."""
    new_alumni = await crud_user.create_alumni(db, alumni)
    return AlumniResponse.model_validate(new_alumni)


@router.put("/alumni/{user_id}", response_model=AlumniResponse)
async def update_alumni(
    user_id: UUID,
    alumni_update: AlumniUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AlumniResponse:
    """Update alumni information."""
    # Users can only update their own profile unless admin
    if current_user.id != user_id and current_user.role not in [
        "superadmin",
        "subadmin",
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this alumni",
        )
    updated_alumni = await crud_user.update_alumni(db, user_id, alumni_update)
    if updated_alumni is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Alumni not found"
        )
    return AlumniResponse.model_validate(updated_alumni)
