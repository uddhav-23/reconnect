"""Alumni directory routes (public)."""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.crud import user as crud_user
from app.schemas.user import AlumniResponse

router = APIRouter(prefix="/alumni", tags=["alumni"])


@router.get("", response_model=List[AlumniResponse])
async def search_alumni(
    search: Optional[str] = Query(None, description="Search by name or email"),
    skill: Optional[str] = Query(None, description="Filter by skill"),
    location: Optional[str] = Query(None, description="Filter by location"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> List[AlumniResponse]:
    """Search alumni directory (public endpoint)."""
    alumni = await crud_user.search_alumni(
        db, search_term=search, skill=skill, location=location, skip=skip, limit=limit
    )
    # Convert to AlumniResponse (need to join with Alumni table)
    results = []
    for user in alumni:
        from app.db.models.user import Alumni
        from sqlalchemy import select
        result = await db.execute(select(Alumni).where(Alumni.id == user.id))
        alumni_profile = result.scalar_one_or_none()
        if alumni_profile:
            alumni_data = AlumniResponse.model_validate(user)
            alumni_data.graduation_year = alumni_profile.graduation_year
            alumni_data.degree = alumni_profile.degree
            alumni_data.department = alumni_profile.department
            alumni_data.current_company = alumni_profile.current_company
            alumni_data.current_position = alumni_profile.current_position
            alumni_data.location = alumni_profile.location
            alumni_data.bio = alumni_profile.bio
            alumni_data.skills = alumni_profile.skills
            alumni_data.social_links = alumni_profile.social_links
            alumni_data.address = alumni_profile.address
            results.append(alumni_data)
    return results
