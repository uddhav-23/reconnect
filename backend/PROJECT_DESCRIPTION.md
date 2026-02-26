# ReConnect Backend - Complete Project Description

## 🎯 Project Overview

**ReConnect Backend** is a production-ready FastAPI-based REST API and WebSocket server for the ReConnect Alumni Network Platform. It provides a complete backend solution with authentication, real-time messaging, and comprehensive CRUD operations for an alumni networking application.

## 🏗️ Architecture

### Technology Stack
- **Framework**: FastAPI 0.109.0
- **Language**: Python 3.11+
- **Database**: PostgreSQL with asyncpg driver
- **ORM**: SQLAlchemy 2.0 (async)
- **Migrations**: Alembic
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **Real-time**: WebSockets (FastAPI native)
- **Validation**: Pydantic 2.5
- **Code Quality**: PEP8 compliant

### Design Patterns
- **Repository Pattern**: CRUD operations separated from routes
- **Dependency Injection**: FastAPI dependencies for auth and DB
- **Service Layer**: WebSocket and notification services
- **Schema Validation**: Pydantic models for request/response
- **Async/Await**: Full async support throughout

## 📊 Database Schema

### Core Tables

1. **users** - Base user accounts
   - UUID primary key
   - Email (unique), password_hash, name, role
   - college_id, university_id (foreign keys)
   - profile_picture, phone, created_at

2. **alumni** - Extended alumni profiles
   - Foreign key to users
   - graduation_year, degree, department
   - current_company, current_position, location
   - bio, skills (JSON), social_links (JSON)
   - address

3. **blogs** - Blog posts
   - UUID primary key
   - title, content, excerpt, cover_image
   - tags (JSON array)
   - author_id (FK to users)
   - published_at, likes, liked_by (JSON), shares
   - created_at, updated_at

4. **messages** - Chat messages
   - UUID primary key
   - sender_id, receiver_id (FKs to users)
   - content (text)
   - read (boolean), read_at (timestamp)
   - deleted_by (JSON array of user IDs)
   - created_at

5. **connections** - Connection requests
   - UUID primary key
   - requester_id, receiver_id (FKs to users)
   - status (pending/accepted/rejected)
   - created_at

6. **achievements** - User achievements
   - UUID primary key
   - user_id (FK to users)
   - title, description, date
   - category (academic/professional/personal/community)
   - image URL

7. **notifications** - User notifications
   - UUID primary key
   - user_id (FK to users)
   - type (message/connection/etc.)
   - message (text)
   - is_read (boolean)
   - message_id, sender_id (optional, for message notifications)
   - created_at

8. **colleges** - College information
   - UUID primary key
   - name, description, logo
   - university_id
   - departments (JSON array)
   - established_year, website
   - contact_email, phone
   - admin_name, admin_email
   - created_at

## 🔐 Authentication & Authorization

### JWT Token System
- **Access Token**: 15-minute expiry, contains user_id, email, role
- **Refresh Token**: 7-day expiry, used to get new access tokens
- **Token Storage**: Frontend stores in localStorage
- **Auto Refresh**: Axios interceptor handles token refresh

### Role-Based Access Control
- **superadmin**: Full system access
- **subadmin**: Manage college alumni and content
- **alumni**: Manage own profile, blogs, achievements
- **student/user**: View directory, send connections, message

### Security Features
- Password hashing with bcrypt
- JWT token validation
- CORS protection
- SQL injection prevention (SQLAlchemy)
- Input validation (Pydantic)

## 🌐 API Endpoints

### Authentication (`/api/v1/auth`)
```
POST   /signup          - Register new user
POST   /login           - Login and get tokens
POST   /refresh         - Refresh access token
GET    /me              - Get current user info
```

### Users (`/api/v1/users`)
```
GET    /                - List users (admin)
GET    /{id}            - Get user by ID
PUT    /{id}            - Update user
DELETE /{id}            - Delete user (admin)
POST   /alumni          - Create alumni (admin)
PUT    /alumni/{id}     - Update alumni
```

### Alumni Directory (`/api/v1/alumni`) - Public
```
GET    /?search=&skill=&location=  - Search alumni
```

### Blogs (`/api/v1/blogs`)
```
POST   /                - Create blog
GET    /                - List blogs (public)
GET    /{id}            - Get blog (public)
PUT    /{id}            - Update blog
DELETE /{id}            - Delete blog
POST   /{id}/like       - Like/unlike blog
```

### Messages (`/api/v1/messages`)
```
GET    /{user_id}                    - Get messages with user
POST   /                             - Send message
GET    /conversations/list           - Get all conversations
POST   /{id}/read                    - Mark message as read
DELETE /{id}                         - Delete message (soft)
```

### Connections (`/api/v1/connections`)
```
POST   /request                      - Send connection request
POST   /{id}/respond                 - Accept/reject connection
GET    /?pending_only=               - Get connections
```

### Achievements (`/api/v1/achievements`)
```
POST   /                             - Create achievement
GET    /?user_id=                    - Get achievements
GET    /{id}                         - Get achievement
PUT    /{id}                         - Update achievement
DELETE /{id}                         - Delete achievement
```

### Notifications (`/api/v1/notifications`)
```
GET    /?unread_only=                - Get notifications
POST   /{id}/read                    - Mark as read
POST   /read-all                     - Mark all as read
```

### Colleges (`/api/v1/colleges`) - Admin Only
```
POST   /                             - Create college
GET    /                             - List colleges
GET    /{id}                         - Get college
PUT    /{id}                         - Update college
DELETE /{id}                         - Delete college (superadmin)
```

## 🔌 WebSocket Implementation

### Connection
```
ws://localhost:8000/ws/{user_id}?token={access_token}
```

### Message Types

**Client → Server:**
- `ping` - Heartbeat (server responds with `pong`)
- `read_receipt` - Send read receipt
  ```json
  {
    "type": "read_receipt",
    "message_id": "uuid",
    "other_user_id": "uuid"
  }
  ```

**Server → Client:**
- `pong` - Heartbeat response
- `message` - New message received
  ```json
  {
    "type": "message",
    "data": {
      "id": "uuid",
      "sender_id": "uuid",
      "receiver_id": "uuid",
      "content": "Message text",
      "created_at": "2024-01-01T00:00:00",
      "read": false
    }
  }
  ```
- `notification` - New notification
  ```json
  {
    "type": "notification",
    "data": {
      "id": "uuid",
      "type": "message",
      "message": "New message from John",
      "is_read": false
    }
  }
  ```
- `read_receipt` - Message read receipt
  ```json
  {
    "type": "read_receipt",
    "data": {
      "message_id": "uuid",
      "read_by": "uuid"
    }
  }
  ```

### ConnectionManager Features
- Manages active WebSocket connections
- Broadcasts messages to conversation participants
- Sends real-time notifications
- Handles read receipts
- Automatic cleanup on disconnect

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app entry point
│   ├── core/
│   │   ├── config.py              # Settings from environment
│   │   ├── security.py            # JWT & password hashing
│   │   └── dependencies.py        # Auth dependencies
│   ├── db/
│   │   ├── base.py                # Database engine & session
│   │   └── models/                # SQLAlchemy models
│   │       ├── user.py
│   │       ├── blog.py
│   │       ├── message.py
│   │       ├── connection.py
│   │       ├── achievement.py
│   │       ├── notification.py
│   │       └── college.py
│   ├── schemas/                   # Pydantic schemas
│   │   ├── user.py
│   │   ├── auth.py
│   │   ├── blog.py
│   │   ├── message.py
│   │   ├── connection.py
│   │   ├── achievement.py
│   │   ├── notification.py
│   │   └── college.py
│   ├── crud/                      # CRUD operations
│   │   ├── user.py
│   │   ├── blog.py
│   │   ├── message.py
│   │   ├── connection.py
│   │   ├── achievement.py
│   │   ├── notification.py
│   │   └── college.py
│   ├── api/
│   │   ├── router.py              # Main API router
│   │   └── routes/                 # Route handlers
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── alumni.py
│   │       ├── blogs.py
│   │       ├── messages.py
│   │       ├── connections.py
│   │       ├── achievements.py
│   │       ├── notifications.py
│   │       ├── colleges.py
│   │       └── websocket.py
│   └── services/
│       ├── websocket_manager.py    # WebSocket connection manager
│       └── notification_service.py # Notification helpers
├── alembic/                        # Database migrations
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── requirements.txt
├── .env.example
├── run.sh
└── Documentation files...
```

## 🔄 Data Flow

### Authentication Flow
1. User signs up/logs in → Backend creates JWT tokens
2. Frontend stores tokens in localStorage
3. All API requests include `Authorization: Bearer {token}` header
4. Backend validates token and extracts user info
5. On token expiry, frontend uses refresh token to get new access token

### Message Flow
1. User sends message via `POST /api/v1/messages`
2. Backend saves to database
3. Backend creates notification for receiver
4. If receiver is connected via WebSocket, message is broadcasted in real-time
5. Receiver sees message immediately without page refresh

### Connection Flow
1. User sends connection request via `POST /api/v1/connections/request`
2. Backend creates connection record with "pending" status
3. Backend creates notification for receiver
4. Receiver can accept/reject via `POST /api/v1/connections/{id}/respond`
5. Real-time updates via WebSocket if users are connected

## 🛡️ Security Implementation

### Password Security
- Bcrypt hashing with salt
- Never store plain passwords
- Password verification on login

### JWT Security
- Secret key stored in environment variables
- Token expiration (15 min access, 7 days refresh)
- Token type validation (access vs refresh)
- User ID validation on each request

### Database Security
- Parameterized queries (SQLAlchemy prevents SQL injection)
- Role-based access control
- Users can only access their own data (unless admin)
- Soft delete for messages (no hard deletes)

### CORS Security
- Configured allowed origins
- Credentials support
- Specific methods and headers

## 📈 Performance Optimizations

### Database
- Async queries for non-blocking I/O
- Indexed fields (email, role, user_id)
- Efficient queries with proper joins
- Connection pooling

### API
- Async endpoints throughout
- Efficient serialization (Pydantic)
- Pagination support (skip/limit)
- Filtering and searching

### WebSocket
- Connection pooling
- Efficient message broadcasting
- Heartbeat mechanism
- Automatic cleanup

## 🧪 Testing

### Manual Testing
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Postman: See `POSTMAN_COLLECTION.md`

### Example Test Flow
1. Signup → Get tokens
2. Use token to access protected endpoints
3. Create blog, send message, etc.
4. Test WebSocket connection
5. Verify real-time updates

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/dbname
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

### Database Configuration
- PostgreSQL 12+
- Async driver: asyncpg
- Connection pooling enabled
- Auto-commit disabled (manual transactions)

## 🚀 Deployment

### Development
```bash
uvicorn app.main:app --reload
```

### Production
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker (Optional)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📝 Code Quality Standards

- ✅ **PEP8 Compliance**: All code follows Python style guide
- ✅ **Type Hints**: Full type annotations
- ✅ **Docstrings**: Function documentation
- ✅ **Error Handling**: Comprehensive try/except blocks
- ✅ **HTTP Status Codes**: Proper status codes (200, 201, 400, 401, 403, 404, 500)
- ✅ **Async/Await**: Modern async Python throughout
- ✅ **Clean Architecture**: Separation of concerns

## 🔗 Frontend Integration

### Axios Setup
- Base URL configuration
- Request interceptor for auth tokens
- Response interceptor for token refresh
- Error handling

### WebSocket Client
- Connection management
- Message handling
- Reconnection logic
- Heartbeat mechanism

### API Services
- Authentication service
- User service
- Message service
- Blog service
- etc.

See `FRONTEND_INTEGRATION.md` for complete integration guide.

## 📊 API Response Format

### Success Response
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  ...
}
```

### Error Response
```json
{
  "detail": "Error message here"
}
```

### List Response
```json
[
  { "id": "uuid", ... },
  { "id": "uuid", ... }
]
```

## 🎯 Key Features Implemented

1. ✅ **Complete Authentication System**
   - Signup, login, token refresh
   - Password hashing
   - JWT tokens

2. ✅ **User Management**
   - CRUD operations
   - Role-based access
   - Profile management

3. ✅ **Alumni Directory**
   - Public search endpoint
   - Filtering by skills, location
   - Search by name/email

4. ✅ **Blog System**
   - Create, read, update, delete
   - Like/unlike functionality
   - Public access

5. ✅ **Real-time Messaging**
   - Send/receive messages
   - Read receipts
   - Conversation list
   - Soft delete
   - WebSocket support

6. ✅ **Connections**
   - Send requests
   - Accept/reject
   - Status tracking

7. ✅ **Achievements**
   - CRUD operations
   - Categories
   - User-specific

8. ✅ **Notifications**
   - Real-time delivery
   - Read status
   - WebSocket integration

9. ✅ **College Management**
   - Admin-only CRUD
   - University association

## 🔄 Migration from Firebase

This backend replaces the Firebase backend. Key differences:

- **Database**: PostgreSQL instead of Firestore
- **Auth**: JWT instead of Firebase Auth
- **Real-time**: WebSocket instead of Firestore listeners
- **API**: REST API instead of direct Firestore access

Migration steps:
1. Update frontend to use API endpoints
2. Replace Firebase auth with JWT
3. Replace Firestore listeners with API calls + WebSocket
4. Update environment variables

## 📚 Additional Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **Alembic Docs**: https://alembic.sqlalchemy.org/
- **Pydantic Docs**: https://docs.pydantic.dev/

## ✅ Completion Status

**100% Complete** - All features implemented and tested:
- ✅ All database models
- ✅ All CRUD operations
- ✅ All API endpoints
- ✅ Authentication system
- ✅ WebSocket support
- ✅ Error handling
- ✅ Documentation
- ✅ Migration setup

## 🎉 Ready for Production!

The backend is fully functional and ready to:
1. Integrate with React frontend
2. Deploy to production
3. Scale with additional features
4. Handle real-world traffic

---

**This is a complete, production-ready FastAPI backend following all best practices and PEP8 standards!**
