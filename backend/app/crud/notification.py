"""Notification CRUD operations."""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.db.models.notification import Notification
from app.schemas.notification import NotificationUpdate


async def get_notifications(
    db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100, unread_only: bool = False
) -> List[Notification]:
    """Get notifications for a user."""
    query = select(Notification).where(Notification.user_id == user_id)
    if unread_only:
        query = query.where(Notification.is_read == False)
    query = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


async def create_notification(
    db: AsyncSession,
    user_id: UUID,
    notification_type: str,
    message: str,
    message_id: Optional[UUID] = None,
    sender_id: Optional[UUID] = None,
) -> Notification:
    """Create a new notification."""
    db_notification = Notification(
        user_id=user_id,
        type=notification_type,
        message=message,
        is_read=False,
        message_id=message_id,
        sender_id=sender_id,
    )
    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    return db_notification


async def mark_notification_as_read(
    db: AsyncSession, notification_id: UUID, user_id: UUID
) -> bool:
    """Mark a notification as read."""
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id)
    )
    db_notification = result.scalar_one_or_none()
    if db_notification is None or db_notification.user_id != user_id:
        return False
    db_notification.is_read = True
    await db.commit()
    return True


async def mark_all_notifications_as_read(
    db: AsyncSession, user_id: UUID
) -> int:
    """Mark all notifications as read for a user."""
    query = select(Notification).where(
        and_(Notification.user_id == user_id, Notification.is_read == False)
    )
    result = await db.execute(query)
    notifications = list(result.scalars().all())
    count = 0
    for notif in notifications:
        notif.is_read = True
        count += 1
    await db.commit()
    return count
