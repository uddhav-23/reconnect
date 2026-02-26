"""User CRUD operations."""
from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from app.db.models.user import User, Alumni
from app.schemas.user import UserCreate, UserUpdate, AlumniCreate, AlumniUpdate
from app.core.security import get_password_hash


async def get_user(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """Get user by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_users(
    db: AsyncSession, skip: int = 0, limit: int = 100, role: Optional[str] = None
) -> List[User]:
    """Get all users with optional role filter."""
    query = select(User)
    if role:
        query = query.where(User.role == role)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


async def create_user(db: AsyncSession, user: UserCreate) -> User:
    """Create a new user."""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        password_hash=hashed_password,
        name=user.name,
        role=user.role,
        college_id=user.college_id,
        university_id=user.university_id,
        phone=user.phone,
        profile_picture=user.profile_picture,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def update_user(
    db: AsyncSession, user_id: UUID, user_update: UserUpdate
) -> Optional[User]:
    """Update user information."""
    db_user = await get_user(db, user_id)
    if db_user is None:
        return None
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def delete_user(db: AsyncSession, user_id: UUID) -> bool:
    """Delete a user."""
    db_user = await get_user(db, user_id)
    if db_user is None:
        return False
    await db.delete(db_user)
    await db.commit()
    return True


async def create_alumni(db: AsyncSession, alumni: AlumniCreate) -> User:
    """Create a new alumni user with extended profile."""
    user_data = UserCreate(
        email=alumni.email,
        password=alumni.password,
        name=alumni.name,
        role="alumni",
        college_id=alumni.college_id,
        university_id=alumni.university_id,
        phone=alumni.phone,
        profile_picture=alumni.profile_picture,
    )
    db_user = await create_user(db, user_data)
    db_alumni = Alumni(
        id=db_user.id,
        graduation_year=alumni.graduation_year,
        degree=alumni.degree,
        department=alumni.department,
        current_company=alumni.current_company,
        current_position=alumni.current_position,
        location=alumni.location,
        bio=alumni.bio,
        skills=alumni.skills or [],
        social_links=alumni.social_links or {},
        address=alumni.address,
    )
    db.add(db_alumni)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def update_alumni(
    db: AsyncSession, user_id: UUID, alumni_update: AlumniUpdate
) -> Optional[User]:
    """Update alumni information."""
    db_user = await get_user(db, user_id)
    if db_user is None or db_user.role != "alumni":
        return None
    # Update user fields
    user_update = UserUpdate(
        name=alumni_update.name,
        phone=alumni_update.phone,
        profile_picture=alumni_update.profile_picture,
    )
    await update_user(db, user_id, user_update)
    # Update alumni fields
    result = await db.execute(select(Alumni).where(Alumni.id == user_id))
    db_alumni = result.scalar_one_or_none()
    if db_alumni is None:
        # Create alumni profile if it doesn't exist
        db_alumni = Alumni(id=user_id)
        db.add(db_alumni)
    update_data = alumni_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(db_alumni, field):
            setattr(db_alumni, field, value)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def search_alumni(
    db: AsyncSession,
    search_term: Optional[str] = None,
    skill: Optional[str] = None,
    location: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[User]:
    """Search alumni with filters."""
    query = select(User).where(User.role == "alumni")
    if search_term:
        query = query.where(
            or_(
                User.name.ilike(f"%{search_term}%"),
                User.email.ilike(f"%{search_term}%"),
            )
        )
    result = await db.execute(query.offset(skip).limit(limit))
    users = list(result.scalars().all())
    # Filter by skill and location if provided (requires joining with Alumni)
    if skill or location:
        filtered_users = []
        for user in users:
            result = await db.execute(select(Alumni).where(Alumni.id == user.id))
            alumni = result.scalar_one_or_none()
            if alumni:
                if skill and (not alumni.skills or skill.lower() not in [
                    s.lower() for s in alumni.skills
                ]):
                    continue
                if location and (
                    not alumni.location
                    or location.lower() not in alumni.location.lower()
                ):
                    continue
                filtered_users.append(user)
        return filtered_users
    return users
