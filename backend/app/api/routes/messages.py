"""Message routes."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user
from app.db.base import get_db
from app.db.models.user import User
from app.crud import message as crud_message
from app.schemas.message import MessageCreate, MessageResponse, ConversationResponse
from app.crud import user as crud_user

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/{user_id}", response_model=List[MessageResponse])
async def get_messages(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[MessageResponse]:
    """Get messages between current user and another user."""
    messages = await crud_message.get_messages(db, current_user.id, user_id)
    # Mark conversation as read
    await crud_message.mark_conversation_as_read(db, current_user.id, user_id)
    return [MessageResponse.model_validate(msg) for msg in messages]


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """Send a message."""
    new_message = await crud_message.create_message(db, message, current_user.id)
    message_response = MessageResponse.model_validate(new_message)
    
    # Create notification for receiver
    from app.crud import notification as crud_notification
    from app.services.websocket_manager import manager
    receiver = await crud_user.get_user(db, message.receiver_id)
    if receiver:
        notification = await crud_notification.create_notification(
            db,
            message.receiver_id,
            "message",
            f"New message from {current_user.name}",
            message_id=new_message.id,
            sender_id=current_user.id,
        )
        # Send via WebSocket if connected
        if manager.is_connected(message.receiver_id):
            await manager.broadcast_message(
                message_response.model_dump(),
                current_user.id,
                message.receiver_id,
            )
    return message_response


@router.get("/conversations/list", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[ConversationResponse]:
    """Get all conversations for current user."""
    conversations = await crud_message.get_conversations(db, current_user.id)
    result = []
    for conv in conversations:
        other_user = await crud_user.get_user(db, conv["user_id"])
        if other_user:
            result.append(
                ConversationResponse(
                    user_id=conv["user_id"],
                    user_name=other_user.name,
                    user_email=other_user.email,
                    last_message=MessageResponse.model_validate(conv["last_message"]),
                    unread_count=conv["unread_count"],
                )
            )
    return result


@router.post("/{message_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_message_read(
    message_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Mark a message as read."""
    success = await crud_message.mark_message_as_read(db, message_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Message not found"
        )


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a message (soft delete)."""
    success = await crud_message.delete_message(db, message_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Message not found"
        )
