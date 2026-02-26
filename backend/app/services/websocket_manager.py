"""WebSocket connection manager for real-time messaging."""
from typing import Dict, Set
from uuid import UUID
from fastapi import WebSocket, WebSocketDisconnect
import json


class ConnectionManager:
    """Manages WebSocket connections for real-time messaging."""

    def __init__(self):
        """Initialize connection manager."""
        self.active_connections: Dict[UUID, WebSocket] = {}
        self.user_rooms: Dict[UUID, Set[UUID]] = {}  # user_id -> set of connected user_ids

    async def connect(self, websocket: WebSocket, user_id: UUID) -> None:
        """Accept a WebSocket connection."""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        if user_id not in self.user_rooms:
            self.user_rooms[user_id] = set()

    def disconnect(self, user_id: UUID) -> None:
        """Remove a WebSocket connection."""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.user_rooms:
            del self.user_rooms[user_id]
        # Remove from other users' rooms
        for room_users in self.user_rooms.values():
            room_users.discard(user_id)

    async def send_personal_message(
        self, message: dict, user_id: UUID
    ) -> bool:
        """Send a message to a specific user."""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
                return True
            except Exception:
                self.disconnect(user_id)
                return False
        return False

    async def send_to_conversation(
        self, message: dict, user_id1: UUID, user_id2: UUID
    ) -> None:
        """Send message to both users in a conversation."""
        await self.send_personal_message(message, user_id1)
        await self.send_personal_message(message, user_id2)

    async def broadcast_notification(
        self, notification: dict, user_id: UUID
    ) -> None:
        """Send notification to a user."""
        await self.send_personal_message(
            {"type": "notification", "data": notification}, user_id
        )

    async def broadcast_message(
        self, message: dict, sender_id: UUID, receiver_id: UUID
    ) -> None:
        """Broadcast a new message to conversation participants."""
        message_data = {"type": "message", "data": message}
        await self.send_personal_message(message_data, sender_id)
        await self.send_personal_message(message_data, receiver_id)

    async def broadcast_read_receipt(
        self, message_id: str, user_id: UUID, other_user_id: UUID
    ) -> None:
        """Broadcast read receipt."""
        receipt = {
            "type": "read_receipt",
            "data": {"message_id": message_id, "read_by": str(user_id)},
        }
        await self.send_personal_message(receipt, other_user_id)

    def is_connected(self, user_id: UUID) -> bool:
        """Check if a user is connected."""
        return user_id in self.active_connections


manager = ConnectionManager()
