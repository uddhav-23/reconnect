"""Notification service for creating and managing notifications."""
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud import notification as crud_notification
from app.services.websocket_manager import manager


async def create_message_notification(
    db: AsyncSession,
    receiver_id: UUID,
    sender_id: UUID,
    sender_name: str,
    message_id: UUID,
) -> None:
    """Create a notification for a new message."""
    notification = await crud_notification.create_notification(
        db,
        receiver_id,
        "message",
        f"New message from {sender_name}",
        message_id=message_id,
        sender_id=sender_id,
    )
    # Send via WebSocket if user is connected
    if manager.is_connected(receiver_id):
        await manager.broadcast_notification(
            {
                "id": str(notification.id),
                "type": "message",
                "message": f"New message from {sender_name}",
                "message_id": str(message_id),
                "sender_id": str(sender_id),
                "is_read": False,
            },
            receiver_id,
        )


async def create_connection_notification(
    db: AsyncSession, receiver_id: UUID, requester_name: str
) -> None:
    """Create a notification for a connection request."""
    notification = await crud_notification.create_notification(
        db,
        receiver_id,
        "connection",
        f"{requester_name} sent you a connection request",
    )
    # Send via WebSocket if user is connected
    if manager.is_connected(receiver_id):
        await manager.broadcast_notification(
            {
                "id": str(notification.id),
                "type": "connection",
                "message": f"{requester_name} sent you a connection request",
                "is_read": False,
            },
            receiver_id,
        )
