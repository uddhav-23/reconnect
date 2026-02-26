"""Blog routes."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user, get_optional_user
from app.db.base import get_db
from app.db.models.user import User
from app.crud import blog as crud_blog
from app.schemas.blog import BlogCreate, BlogUpdate, BlogResponse, BlogWithAuthor

router = APIRouter(prefix="/blogs", tags=["blogs"])


@router.post("", response_model=BlogResponse, status_code=status.HTTP_201_CREATED)
async def create_blog(
    blog: BlogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BlogResponse:
    """Create a new blog."""
    new_blog = await crud_blog.create_blog(db, blog, current_user.id)
    return BlogResponse.model_validate(new_blog)


@router.get("", response_model=List[BlogWithAuthor])
async def get_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    author_id: Optional[UUID] = Query(None),
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
) -> List[BlogWithAuthor]:
    """Get all blogs (public)."""
    blogs = await crud_blog.get_blogs(db, skip=skip, limit=limit, author_id=author_id)
    result = []
    for blog in blogs:
        blog_data = BlogWithAuthor.model_validate(blog)
        blog_data.author_name = blog.author.name
        blog_data.author_email = blog.author.email
        result.append(blog_data)
    return result


@router.get("/{blog_id}", response_model=BlogWithAuthor)
async def get_blog(
    blog_id: UUID,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
) -> BlogWithAuthor:
    """Get blog by ID (public)."""
    blog = await crud_blog.get_blog(db, blog_id)
    if blog is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found"
        )
    blog_data = BlogWithAuthor.model_validate(blog)
    blog_data.author_name = blog.author.name
    blog_data.author_email = blog.author.email
    return blog_data


@router.put("/{blog_id}", response_model=BlogResponse)
async def update_blog(
    blog_id: UUID,
    blog_update: BlogUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BlogResponse:
    """Update a blog."""
    blog = await crud_blog.get_blog(db, blog_id)
    if blog is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found"
        )
    # Users can only update their own blogs unless admin
    if blog.author_id != current_user.id and current_user.role not in [
        "superadmin",
        "subadmin",
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this blog",
        )
    updated_blog = await crud_blog.update_blog(db, blog_id, blog_update)
    if updated_blog is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found"
        )
    return BlogResponse.model_validate(updated_blog)


@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog(
    blog_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a blog."""
    blog = await crud_blog.get_blog(db, blog_id)
    if blog is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found"
        )
    # Users can only delete their own blogs unless admin
    if blog.author_id != current_user.id and current_user.role not in [
        "superadmin",
        "subadmin",
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this blog",
        )
    success = await crud_blog.delete_blog(db, blog_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found"
        )


@router.post("/{blog_id}/like", response_model=BlogResponse)
async def like_blog(
    blog_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BlogResponse:
    """Like or unlike a blog."""
    updated_blog = await crud_blog.like_blog(db, blog_id, current_user.id)
    if updated_blog is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found"
        )
    return BlogResponse.model_validate(updated_blog)
