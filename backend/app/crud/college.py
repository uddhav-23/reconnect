"""College CRUD operations."""
from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.college import College
from app.schemas.college import CollegeCreate, CollegeUpdate


async def get_college(db: AsyncSession, college_id: UUID) -> Optional[College]:
    """Get college by ID."""
    result = await db.execute(select(College).where(College.id == college_id))
    return result.scalar_one_or_none()


async def get_colleges(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    university_id: Optional[UUID] = None,
) -> List[College]:
    """Get all colleges with optional university filter."""
    query = select(College)
    if university_id:
        query = query.where(College.university_id == university_id)
    query = query.order_by(College.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


async def create_college(db: AsyncSession, college: CollegeCreate) -> College:
    """Create a new college."""
    db_college = College(
        name=college.name,
        university_id=college.university_id,
        description=college.description,
        logo=college.logo,
        departments=college.departments or [],
        established_year=college.established_year,
        website=college.website,
        contact_email=college.contact_email,
        phone=college.phone,
        admin_name=college.admin_name,
        admin_email=college.admin_email,
    )
    db.add(db_college)
    await db.commit()
    await db.refresh(db_college)
    return db_college


async def update_college(
    db: AsyncSession, college_id: UUID, college_update: CollegeUpdate
) -> Optional[College]:
    """Update college information."""
    db_college = await get_college(db, college_id)
    if db_college is None:
        return None
    update_data = college_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_college, field, value)
    await db.commit()
    await db.refresh(db_college)
    return db_college


async def delete_college(db: AsyncSession, college_id: UUID) -> bool:
    """Delete a college."""
    db_college = await get_college(db, college_id)
    if db_college is None:
        return False
    await db.delete(db_college)
    await db.commit()
    return True
