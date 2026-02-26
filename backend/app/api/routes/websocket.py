"""WebSocket routes for real-time messaging."""
from uuid import UUID
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.services.websocket_manager import manager
from app.core.security import decode_token

router = APIRouter()


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: UUID,
    token: str = Query(..., description="JWT access token"),
) -> None:
    """WebSocket endpoint for real-time messaging."""
    # Verify token
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        await websocket.close(code=1008, reason="Invalid token")
        return
    token_user_id = UUID(payload.get("sub"))
    if token_user_id != user_id:
        await websocket.close(code=1008, reason="User ID mismatch")
        return

    # Connect
    await manager.connect(websocket, user_id)

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            message_type = data.get("type")

            if message_type == "ping":
                # Heartbeat
                await websocket.send_json({"type": "pong"})
            elif message_type == "message":
                # Handle new message (this would typically be handled by HTTP endpoint)
                # WebSocket is mainly for receiving real-time updates
                pass
            elif message_type == "read_receipt":
                # Handle read receipt
                message_id = data.get("message_id")
                other_user_id = UUID(data.get("other_user_id"))
                await manager.broadcast_read_receipt(
                    message_id, user_id, other_user_id
                )

    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(user_id)
