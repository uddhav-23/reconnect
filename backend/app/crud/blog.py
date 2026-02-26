"""Blog CRUD operations."""
from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.blog import Blog
from app.schemas.blog import BlogCreate, BlogUpdate


async def get_blog(db: AsyncSession, blog_id: UUID) -> Optional[Blog]:
    """Get blog by ID."""
    result = await db.execute(select(Blog).where(Blog.id == blog_id))
    return result.scalar_one_or_none()


async def get_blogs(
    db: AsyncSession, skip: int = 0, limit: int = 100, author_id: Optional[UUID] = None
) -> List[Blog]:
    """Get all blogs with optional author filter."""
    query = select(Blog)
    if author_id:
        query = query.where(Blog.author_id == author_id)
    query = query.order_by(Blog.published_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


async def create_blog(db: AsyncSession, blog: BlogCreate, author_id: UUID) -> Blog:
    """Create a new blog."""
    db_blog = Blog(
        title=blog.title,
        content=blog.content,
        excerpt=blog.excerpt,
        cover_image=blog.cover_image,
        tags=blog.tags or [],
        author_id=author_id,
    )
    db.add(db_blog)
    await db.commit()
    await db.refresh(db_blog)
    return db_blog


async def update_blog(
    db: AsyncSession, blog_id: UUID, blog_update: BlogUpdate
) -> Optional[Blog]:
    """Update blog information."""
    db_blog = await get_blog(db, blog_id)
    if db_blog is None:
        return None
    update_data = blog_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_blog, field, value)
    await db.commit()
    await db.refresh(db_blog)
    return db_blog


async def delete_blog(db: AsyncSession, blog_id: UUID) -> bool:
    """Delete a blog."""
    db_blog = await get_blog(db, blog_id)
    if db_blog is None:
        return False
    await db.delete(db_blog)
    await db.commit()
    return True


async def like_blog(db: AsyncSession, blog_id: UUID, user_id: UUID) -> Optional[Blog]:
    """Like or unlike a blog."""
    db_blog = await get_blog(db, blog_id)
    if db_blog is None:
        return None
    user_id_str = str(user_id)
    if db_blog.liked_by is None:
        db_blog.liked_by = []
    if user_id_str in db_blog.liked_by:
        # Unlike
        db_blog.liked_by.remove(user_id_str)
        db_blog.likes = max(0, db_blog.likes - 1)
    else:
        # Like
        db_blog.liked_by.append(user_id_str)
        db_blog.likes += 1
    await db.commit()
    await db.refresh(db_blog)
    return db_blog
