# ReConnect Backend API

FastAPI backend for the ReConnect Alumni Network Platform.

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Update the following in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Generate a secure random key (min 32 characters)
- `FRONTEND_URL`: Your frontend URL (default: http://localhost:5173)

### 4. Setup Database

Create PostgreSQL database:

```bash
createdb reconnect
```

Or using psql:

```sql
CREATE DATABASE reconnect;
```

### 5. Run Migrations

```bash
# Initialize Alembic (if not already done)
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### 6. Run Server

```bash
# Using the run script
./run.sh

# Or directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users` - Get all users (admin)
- `GET /api/v1/users/{id}` - Get user by ID
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user (admin)

### Alumni Directory (Public)
- `GET /api/v1/alumni?search=&skill=&location=` - Search alumni

### Blogs
- `POST /api/v1/blogs` - Create blog
- `GET /api/v1/blogs` - Get all blogs
- `GET /api/v1/blogs/{id}` - Get blog by ID
- `PUT /api/v1/blogs/{id}` - Update blog
- `DELETE /api/v1/blogs/{id}` - Delete blog
- `POST /api/v1/blogs/{id}/like` - Like/unlike blog

### Messages
- `GET /api/v1/messages/{user_id}` - Get messages with user
- `POST /api/v1/messages` - Send message
- `GET /api/v1/messages/conversations/list` - Get all conversations
- `POST /api/v1/messages/{id}/read` - Mark message as read
- `DELETE /api/v1/messages/{id}` - Delete message

### Connections
- `POST /api/v1/connections/request` - Send connection request
- `POST /api/v1/connections/{id}/respond` - Accept/reject connection
- `GET /api/v1/connections` - Get all connections

### Achievements
- `POST /api/v1/achievements` - Create achievement
- `GET /api/v1/achievements?user_id=` - Get achievements
- `GET /api/v1/achievements/{id}` - Get achievement
- `PUT /api/v1/achievements/{id}` - Update achievement
- `DELETE /api/v1/achievements/{id}` - Delete achievement

### Notifications
- `GET /api/v1/notifications` - Get notifications
- `POST /api/v1/notifications/{id}/read` - Mark as read
- `POST /api/v1/notifications/read-all` - Mark all as read

### Colleges (Admin)
- `POST /api/v1/colleges` - Create college
- `GET /api/v1/colleges` - Get all colleges
- `GET /api/v1/colleges/{id}` - Get college
- `PUT /api/v1/colleges/{id}` - Update college
- `DELETE /api/v1/colleges/{id}` - Delete college (superadmin)

## WebSocket

Real-time messaging via WebSocket:

```
ws://localhost:8000/ws/{user_id}?token={access_token}
```

## Testing

Use the interactive API docs at `/docs` or Postman collection.

## Production

For production deployment:

1. Set `ENVIRONMENT=production` in `.env`
2. Use a production ASGI server like Gunicorn with Uvicorn workers
3. Set up proper CORS origins
4. Use environment variables for all secrets
5. Enable HTTPS
6. Set up database connection pooling
7. Configure logging
