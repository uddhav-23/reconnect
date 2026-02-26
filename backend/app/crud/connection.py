"""Connection CRUD operations."""
from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from app.db.models.connection import Connection
from app.schemas.connection import ConnectionCreate, ConnectionUpdate


async def get_connection(
    db: AsyncSession, connection_id: UUID
) -> Optional[Connection]:
    """Get connection by ID."""
    result = await db.execute(select(Connection).where(Connection.id == connection_id))
    return result.scalar_one_or_none()


async def get_connection_status(
    db: AsyncSession, user_id1: UUID, user_id2: UUID
) -> Optional[Connection]:
    """Get connection status between two users."""
    query = select(Connection).where(
        or_(
            and_(
                Connection.requester_id == user_id1,
                Connection.receiver_id == user_id2,
            ),
            and_(
                Connection.requester_id == user_id2,
                Connection.receiver_id == user_id1,
            ),
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_pending_connections(
    db: AsyncSession, user_id: UUID
) -> List[Connection]:
    """Get pending connection requests for a user."""
    query = select(Connection).where(
        and_(Connection.receiver_id == user_id, Connection.status == "pending")
    )
    result = await db.execute(query.order_by(Connection.created_at.desc()))
    return list(result.scalars().all())


async def get_all_connections(
    db: AsyncSession, user_id: UUID
) -> List[Connection]:
    """Get all connections for a user."""
    query = select(Connection).where(
        or_(
            Connection.requester_id == user_id,
            Connection.receiver_id == user_id,
        )
    )
    result = await db.execute(query.order_by(Connection.created_at.desc()))
    return list(result.scalars().all())


async def create_connection(
    db: AsyncSession, connection: ConnectionCreate, requester_id: UUID
) -> Connection:
    """Create a new connection request."""
    # Check if connection already exists
    existing = await get_connection_status(db, requester_id, connection.receiver_id)
    if existing:
        return existing
    db_connection = Connection(
        requester_id=requester_id,
        receiver_id=connection.receiver_id,
        status="pending",
    )
    db.add(db_connection)
    await db.commit()
    await db.refresh(db_connection)
    return db_connection


async def update_connection(
    db: AsyncSession, connection_id: UUID, connection_update: ConnectionUpdate
) -> Optional[Connection]:
    """Update connection status."""
    db_connection = await get_connection(db, connection_id)
    if db_connection is None:
        return None
    db_connection.status = connection_update.status
    await db.commit()
    await db.refresh(db_connection)
    return db_connection


async def delete_connection(db: AsyncSession, connection_id: UUID) -> bool:
    """Delete a connection."""
    db_connection = await get_connection(db, connection_id)
    if db_connection is None:
        return False
    await db.delete(db_connection)
    await db.commit()
    return True
