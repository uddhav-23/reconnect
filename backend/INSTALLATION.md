# Backend Installation Guide

Complete step-by-step guide to set up the ReConnect FastAPI backend.

## Prerequisites

- Python 3.11 or higher
- PostgreSQL 12 or higher
- pip (Python package manager)

## Step 1: Create Virtual Environment

```bash
cd backend
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

## Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

## Step 3: Setup PostgreSQL Database

### Option A: Using psql

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE reconnect;

# Exit psql
\q
```

### Option B: Using createdb command

```bash
createdb reconnect
```

## Step 4: Configure Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env file with your values
nano .env  # or use your preferred editor
```

Update these values in `.env`:

```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/reconnect
SECRET_KEY=your-very-secure-secret-key-minimum-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

**Important**: Generate a secure SECRET_KEY:

```python
# Run in Python
import secrets
print(secrets.token_urlsafe(32))
```

## Step 5: Initialize Alembic (First Time Only)

```bash
# If alembic folder doesn't exist, initialize it
alembic init alembic
```

## Step 6: Create Database Migrations

```bash
# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations to database
alembic upgrade head
```

## Step 7: Run the Server

```bash
# Option 1: Using the run script
./run.sh

# Option 2: Directly with uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Step 8: Verify Installation

1. **Check API Health**: http://localhost:8000/health
2. **View API Docs**: http://localhost:8000/docs
3. **Interactive API**: http://localhost:8000/redoc

## Creating a Super Admin

### Option 1: Using API

```bash
# Signup as superadmin
curl -X POST "http://localhost:8000/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "name": "Super Admin",
    "role": "superadmin"
  }'
```

### Option 2: Using Python Script

Create `scripts/create_superadmin.py`:

```python
import asyncio
from app.db.base import AsyncSessionLocal
from app.crud import user as crud_user
from app.schemas.user import UserCreate

async def create_superadmin():
    async with AsyncSessionLocal() as db:
        user = UserCreate(
            email="admin@example.com",
            password="SecurePassword123!",
            name="Super Admin",
            role="superadmin"
        )
        await crud_user.create_user(db, user)
        print("Super admin created!")

asyncio.run(create_superadmin())
```

## Troubleshooting

### Database Connection Error

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format: `postgresql+asyncpg://user:pass@host:port/dbname`
- Verify database exists: `psql -l | grep reconnect`

### Migration Errors

- Ensure all models are imported in `alembic/env.py`
- Check database permissions
- Try: `alembic downgrade -1` then `alembic upgrade head`

### Import Errors

- Ensure virtual environment is activated
- Verify all dependencies installed: `pip list`
- Check Python path: `python -c "import sys; print(sys.path)"`

### Port Already in Use

- Change port in `run.sh` or uvicorn command
- Kill process using port: `lsof -ti:8000 | xargs kill`

## Next Steps

1. Test API endpoints using Swagger UI at `/docs`
2. Integrate with React frontend (see `FRONTEND_INTEGRATION.md`)
3. Set up production deployment
4. Configure logging and monitoring

## Production Deployment

For production:

1. Set `ENVIRONMENT=production` in `.env`
2. Use Gunicorn with Uvicorn workers
3. Set up reverse proxy (Nginx)
4. Enable HTTPS
5. Configure database connection pooling
6. Set up monitoring and logging

Example Gunicorn command:

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
