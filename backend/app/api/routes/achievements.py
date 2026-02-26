"""Achievement routes."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user
from app.db.base import get_db
from app.db.models.user import User
from app.crud import achievement as crud_achievement
from app.schemas.achievement import (
    AchievementCreate,
    AchievementUpdate,
    AchievementResponse,
)

router = APIRouter(prefix="/achievements", tags=["achievements"])


@router.post("", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
async def create_achievement(
    achievement: AchievementCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AchievementResponse:
    """Create a new achievement."""
    new_achievement = await crud_achievement.create_achievement(
        db, achievement, current_user.id
    )
    return AchievementResponse.model_validate(new_achievement)


@router.get("", response_model=List[AchievementResponse])
async def get_achievements(
    user_id: UUID = Query(..., description="User ID to get achievements for"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[AchievementResponse]:
    """Get achievements for a user."""
    achievements = await crud_achievement.get_achievements(
        db, user_id, skip=skip, limit=limit
    )
    return [AchievementResponse.model_validate(ach) for ach in achievements]


@router.get("/{achievement_id}", response_model=AchievementResponse)
async def get_achievement(
    achievement_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AchievementResponse:
    """Get achievement by ID."""
    achievement = await crud_achievement.get_achievement(db, achievement_id)
    if achievement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found"
        )
    return AchievementResponse.model_validate(achievement)


@router.put("/{achievement_id}", response_model=AchievementResponse)
async def update_achievement(
    achievement_id: UUID,
    achievement_update: AchievementUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AchievementResponse:
    """Update an achievement."""
    achievement = await crud_achievement.get_achievement(db, achievement_id)
    if achievement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found"
        )
    # Users can only update their own achievements unless admin
    if achievement.user_id != current_user.id and current_user.role not in [
        "superadmin",
        "subadmin",
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this achievement",
        )
    updated_achievement = await crud_achievement.update_achievement(
        db, achievement_id, achievement_update
    )
    if updated_achievement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found"
        )
    return AchievementResponse.model_validate(updated_achievement)


@router.delete("/{achievement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_achievement(
    achievement_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete an achievement."""
    achievement = await crud_achievement.get_achievement(db, achievement_id)
    if achievement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found"
        )
    # Users can only delete their own achievements unless admin
    if achievement.user_id != current_user.id and current_user.role not in [
        "superadmin",
        "subadmin",
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this achievement",
        )
    success = await crud_achievement.delete_achievement(db, achievement_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found"
        )
