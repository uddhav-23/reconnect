"""Achievement CRUD operations."""
from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.achievement import Achievement
from app.schemas.achievement import AchievementCreate, AchievementUpdate


async def get_achievement(
    db: AsyncSession, achievement_id: UUID
) -> Optional[Achievement]:
    """Get achievement by ID."""
    result = await db.execute(
        select(Achievement).where(Achievement.id == achievement_id)
    )
    return result.scalar_one_or_none()


async def get_achievements(
    db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100
) -> List[Achievement]:
    """Get all achievements for a user."""
    query = (
        select(Achievement)
        .where(Achievement.user_id == user_id)
        .order_by(Achievement.date.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return list(result.scalars().all())


async def create_achievement(
    db: AsyncSession, achievement: AchievementCreate, user_id: UUID
) -> Achievement:
    """Create a new achievement."""
    db_achievement = Achievement(
        user_id=user_id,
        title=achievement.title,
        description=achievement.description,
        date=achievement.date,
        category=achievement.category,
        image=achievement.image,
    )
    db.add(db_achievement)
    await db.commit()
    await db.refresh(db_achievement)
    return db_achievement


async def update_achievement(
    db: AsyncSession, achievement_id: UUID, achievement_update: AchievementUpdate
) -> Optional[Achievement]:
    """Update achievement information."""
    db_achievement = await get_achievement(db, achievement_id)
    if db_achievement is None:
        return None
    update_data = achievement_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_achievement, field, value)
    await db.commit()
    await db.refresh(db_achievement)
    return db_achievement


async def delete_achievement(db: AsyncSession, achievement_id: UUID) -> bool:
    """Delete an achievement."""
    db_achievement = await get_achievement(db, achievement_id)
    if db_achievement is None:
        return False
    await db.delete(db_achievement)
    await db.commit()
    return True
