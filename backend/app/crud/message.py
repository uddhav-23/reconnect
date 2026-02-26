"""Message CRUD operations."""
from typing import List
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from app.db.models.message import Message
from app.schemas.message import MessageCreate


async def get_messages(
    db: AsyncSession, user_id1: UUID, user_id2: UUID
) -> List[Message]:
    """Get messages between two users."""
    query = select(Message).where(
        or_(
            and_(Message.sender_id == user_id1, Message.receiver_id == user_id2),
            and_(Message.sender_id == user_id2, Message.receiver_id == user_id1),
        )
    )
    # Filter out messages deleted by current user
    result = await db.execute(query.order_by(Message.created_at.asc()))
    messages = list(result.scalars().all())
    # Filter deleted messages
    filtered = [
        msg
        for msg in messages
        if not msg.deleted_by or str(user_id1) not in msg.deleted_by
    ]
    return filtered


async def create_message(
    db: AsyncSession, message: MessageCreate, sender_id: UUID
) -> Message:
    """Create a new message."""
    db_message = Message(
        sender_id=sender_id,
        receiver_id=message.receiver_id,
        content=message.content,
        read=False,
        deleted_by=[],
    )
    db.add(db_message)
    await db.commit()
    await db.refresh(db_message)
    return db_message


async def mark_message_as_read(
    db: AsyncSession, message_id: UUID, user_id: UUID
) -> bool:
    """Mark a message as read."""
    result = await db.execute(select(Message).where(Message.id == message_id))
    db_message = result.scalar_one_or_none()
    if db_message is None or db_message.receiver_id != user_id:
        return False
    if not db_message.read:
        db_message.read = True
        db_message.read_at = datetime.utcnow()
        await db.commit()
    return True


async def mark_conversation_as_read(
    db: AsyncSession, user_id1: UUID, user_id2: UUID
) -> int:
    """Mark all messages in a conversation as read."""
    query = select(Message).where(
        and_(
            Message.receiver_id == user_id1,
            Message.sender_id == user_id2,
            Message.read == False,
        )
    )
    result = await db.execute(query)
    messages = list(result.scalars().all())
    count = 0
    for msg in messages:
        msg.read = True
        msg.read_at = datetime.utcnow()
        count += 1
    await db.commit()
    return count


async def delete_message(db: AsyncSession, message_id: UUID, user_id: UUID) -> bool:
    """Soft delete a message (add user to deleted_by array)."""
    result = await db.execute(select(Message).where(Message.id == message_id))
    db_message = result.scalar_one_or_none()
    if db_message is None:
        return False
    if db_message.sender_id != user_id and db_message.receiver_id != user_id:
        return False
    if db_message.deleted_by is None:
        db_message.deleted_by = []
    user_id_str = str(user_id)
    if user_id_str not in db_message.deleted_by:
        db_message.deleted_by.append(user_id_str)
        await db.commit()
    return True


async def get_conversations(
    db: AsyncSession, user_id: UUID
) -> List[dict]:
    """Get all conversations for a user with last message and unread count."""
    # Get all messages where user is sender or receiver
    query = select(Message).where(
        or_(Message.sender_id == user_id, Message.receiver_id == user_id)
    )
    result = await db.execute(query.order_by(Message.created_at.desc()))
    all_messages = list(result.scalars().all())
    # Filter deleted messages
    visible_messages = [
        msg
        for msg in all_messages
        if not msg.deleted_by or str(user_id) not in msg.deleted_by
    ]
    # Group by other user
    conversations_map = {}
    for msg in visible_messages:
        other_user_id = (
            msg.receiver_id if msg.sender_id == user_id else msg.sender_id
        )
        if other_user_id not in conversations_map:
            conversations_map[other_user_id] = {
                "last_message": msg,
                "unread_count": 0,
            }
        else:
            if msg.created_at > conversations_map[other_user_id]["last_message"].created_at:
                conversations_map[other_user_id]["last_message"] = msg
        # Count unread
        if msg.receiver_id == user_id and not msg.read:
            conversations_map[other_user_id]["unread_count"] += 1
    return [
        {
            "user_id": other_id,
            "last_message": conv["last_message"],
            "unread_count": conv["unread_count"],
        }
        for other_id, conv in conversations_map.items()
    ]
