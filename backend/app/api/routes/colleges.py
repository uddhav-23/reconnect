"""College routes (admin only)."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_admin
from app.db.base import get_db
from app.db.models.user import User
from app.crud import college as crud_college
from app.schemas.college import CollegeCreate, CollegeUpdate, CollegeResponse

router = APIRouter(prefix="/colleges", tags=["colleges"])


@router.post("", response_model=CollegeResponse, status_code=status.HTTP_201_CREATED)
async def create_college(
    college: CollegeCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> CollegeResponse:
    """Create a new college (admin only)."""
    new_college = await crud_college.create_college(db, college)
    return CollegeResponse.model_validate(new_college)


@router.get("", response_model=List[CollegeResponse])
async def get_colleges(
    university_id: Optional[UUID] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> List[CollegeResponse]:
    """Get all colleges (admin only)."""
    colleges = await crud_college.get_colleges(
        db, skip=skip, limit=limit, university_id=university_id
    )
    return [CollegeResponse.model_validate(college) for college in colleges]


@router.get("/{college_id}", response_model=CollegeResponse)
async def get_college(
    college_id: UUID,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> CollegeResponse:
    """Get college by ID (admin only)."""
    college = await crud_college.get_college(db, college_id)
    if college is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="College not found"
        )
    return CollegeResponse.model_validate(college)


@router.put("/{college_id}", response_model=CollegeResponse)
async def update_college(
    college_id: UUID,
    college_update: CollegeUpdate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> CollegeResponse:
    """Update college information (admin only)."""
    updated_college = await crud_college.update_college(db, college_id, college_update)
    if updated_college is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="College not found"
        )
    return CollegeResponse.model_validate(updated_college)


@router.delete("/{college_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_college(
    college_id: UUID,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a college (superadmin only)."""
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmin can delete colleges",
        )
    success = await crud_college.delete_college(db, college_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="College not found"
        )
