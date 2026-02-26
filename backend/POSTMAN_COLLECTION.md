# Postman API Collection Examples

## Authentication Endpoints

### Signup
```
POST http://localhost:8000/api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "user",
  "phone": "+1234567890"
}
```

### Login
```
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

### Get Current User
```
GET http://localhost:8000/api/v1/auth/me
Authorization: Bearer {access_token}
```

### Refresh Token
```
POST http://localhost:8000/api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ..."
}
```

## User Endpoints

### Get All Users (Admin)
```
GET http://localhost:8000/api/v1/users?skip=0&limit=100&role=alumni
Authorization: Bearer {access_token}
```

### Get User by ID
```
GET http://localhost:8000/api/v1/users/{user_id}
Authorization: Bearer {access_token}
```

### Update User
```
PUT http://localhost:8000/api/v1/users/{user_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+9876543210"
}
```

## Alumni Directory (Public)

### Search Alumni
```
GET http://localhost:8000/api/v1/alumni?search=john&skill=python&location=NYC
```

## Blog Endpoints

### Create Blog
```
POST http://localhost:8000/api/v1/blogs
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "My Blog Post",
  "content": "Blog content here...",
  "excerpt": "Short excerpt",
  "tags": ["tech", "alumni"],
  "cover_image": "https://example.com/image.jpg"
}
```

### Get All Blogs
```
GET http://localhost:8000/api/v1/blogs?skip=0&limit=100&author_id={user_id}
```

### Like Blog
```
POST http://localhost:8000/api/v1/blogs/{blog_id}/like
Authorization: Bearer {access_token}
```

## Message Endpoints

### Get Messages with User
```
GET http://localhost:8000/api/v1/messages/{user_id}
Authorization: Bearer {access_token}
```

### Send Message
```
POST http://localhost:8000/api/v1/messages
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "receiver_id": "user-uuid-here",
  "content": "Hello, how are you?"
}
```

### Get Conversations
```
GET http://localhost:8000/api/v1/messages/conversations/list
Authorization: Bearer {access_token}
```

## Connection Endpoints

### Send Connection Request
```
POST http://localhost:8000/api/v1/connections/request
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "receiver_id": "user-uuid-here"
}
```

### Respond to Connection
```
POST http://localhost:8000/api/v1/connections/{connection_id}/respond
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "accepted"  // or "rejected"
}
```

## Achievement Endpoints

### Create Achievement
```
POST http://localhost:8000/api/v1/achievements
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Graduated with Honors",
  "description": "Graduated top of class",
  "date": "2024-05-15",
  "category": "academic",
  "image": "https://example.com/achievement.jpg"
}
```

## Notification Endpoints

### Get Notifications
```
GET http://localhost:8000/api/v1/notifications?unread_only=true
Authorization: Bearer {access_token}
```

### Mark Notification as Read
```
POST http://localhost:8000/api/v1/notifications/{notification_id}/read
Authorization: Bearer {access_token}
```

## College Endpoints (Admin Only)

### Create College
```
POST http://localhost:8000/api/v1/colleges
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Engineering College",
  "description": "College description",
  "contact_email": "admin@college.edu",
  "departments": ["CS", "EE", "ME"]
}
```

## WebSocket Connection

Connect to WebSocket:

```
ws://localhost:8000/ws/{user_id}?token={access_token}
```

Send message:
```json
{
  "type": "ping"
}
```

Receive:
```json
{
  "type": "message",
  "data": {
    "id": "message-id",
    "sender_id": "sender-uuid",
    "receiver_id": "receiver-uuid",
    "content": "Message content",
    "created_at": "2024-01-01T00:00:00"
  }
}
```
