"""Connection routes."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user
from app.db.base import get_db
from app.db.models.user import User
from app.crud import connection as crud_connection
from app.schemas.connection import (
    ConnectionCreate,
    ConnectionResponse,
    ConnectionUpdate,
)
from app.crud import user as crud_user

router = APIRouter(prefix="/connections", tags=["connections"])


@router.post("/request", response_model=ConnectionResponse, status_code=status.HTTP_201_CREATED)
async def create_connection(
    connection: ConnectionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConnectionResponse:
    """Send a connection request."""
    if connection.receiver_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send connection request to yourself",
        )
    new_connection = await crud_connection.create_connection(
        db, connection, current_user.id
    )
    # Create notification for receiver
    from app.crud import notification as crud_notification
    from app.services.websocket_manager import manager
    receiver = await crud_user.get_user(db, connection.receiver_id)
    if receiver:
        notification = await crud_notification.create_notification(
            db,
            connection.receiver_id,
            "connection",
            f"{current_user.name} sent you a connection request",
        )
        # Send via WebSocket if connected
        if manager.is_connected(connection.receiver_id):
            await manager.broadcast_notification(
                {
                    "id": str(notification.id),
                    "type": "connection",
                    "message": f"{current_user.name} sent you a connection request",
                    "is_read": False,
                },
                connection.receiver_id,
            )
    return ConnectionResponse.model_validate(new_connection)


@router.post("/{connection_id}/respond", response_model=ConnectionResponse)
async def respond_to_connection(
    connection_id: UUID,
    connection_update: ConnectionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConnectionResponse:
    """Respond to a connection request (accept/reject)."""
    connection = await crud_connection.get_connection(db, connection_id)
    if connection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Connection not found"
        )
    if connection.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to respond to this connection",
        )
    updated_connection = await crud_connection.update_connection(
        db, connection_id, connection_update
    )
    if updated_connection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Connection not found"
        )
    return ConnectionResponse.model_validate(updated_connection)


@router.get("", response_model=List[ConnectionResponse])
async def get_connections(
    pending_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[ConnectionResponse]:
    """Get all connections for current user."""
    if pending_only:
        connections = await crud_connection.get_pending_connections(db, current_user.id)
    else:
        connections = await crud_connection.get_all_connections(db, current_user.id)
    return [ConnectionResponse.model_validate(conn) for conn in connections]
