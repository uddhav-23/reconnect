# Quick Start Guide

Get the backend running in 5 minutes!

## Prerequisites Check

```bash
# Check Python version (need 3.11+)
python --version

# Check PostgreSQL
psql --version
```

## Setup Steps

### 1. Virtual Environment & Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Create database
createdb reconnect

# Or using psql
psql -U postgres -c "CREATE DATABASE reconnect;"
```

### 3. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/reconnect
SECRET_KEY=change-this-to-a-secure-random-string-min-32-chars
FRONTEND_URL=http://localhost:5173
```

**Generate SECRET_KEY:**
```python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4. Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

### 5. Run Server

```bash
./run.sh
```

Or:
```bash
uvicorn app.main:app --reload
```

## Verify It Works

1. **Health Check**: http://localhost:8000/health
2. **API Docs**: http://localhost:8000/docs
3. **Test Signup**:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/auth/signup" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","name":"Test User","role":"user"}'
   ```

## Create Super Admin

```bash
curl -X POST "http://localhost:8000/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "name": "Super Admin",
    "role": "superadmin"
  }'
```

## Next Steps

1. ✅ Backend is running
2. 📖 Read `FRONTEND_INTEGRATION.md` for React integration
3. 🧪 Test endpoints at `/docs`
4. 🔌 Connect WebSocket for real-time features

## Troubleshooting

**Database connection error?**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Ensure database exists: `psql -l | grep reconnect`

**Port 8000 in use?**
- Change port: `uvicorn app.main:app --reload --port 8001`
- Or kill process: `lsof -ti:8000 | xargs kill`

**Import errors?**
- Activate venv: `source venv/bin/activate`
- Reinstall: `pip install -r requirements.txt`
