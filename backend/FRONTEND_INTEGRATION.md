# Frontend Integration Guide

This guide explains how to integrate the React frontend with the FastAPI backend.

## Axios Setup

Create a new file `src/services/api.ts` in your React frontend:

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken }
          );
          const { access_token, refresh_token: new_refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', new_refresh_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

## Update Environment Variables

Add to your `.env` file in the frontend:

```
VITE_API_URL=http://localhost:8000/api/v1
```

## Authentication Service

Update `src/services/firebaseAuth.ts` or create `src/services/apiAuth.ts`:

```typescript
import api from './api';
import { LoginRequest, SignupRequest, Token } from '../types/api';

export const login = async (email: string, password: string): Promise<Token> => {
  const response = await api.post('/auth/login', { email, password });
  const token: Token = response.data;
  localStorage.setItem('access_token', token.access_token);
  localStorage.setItem('refresh_token', token.refresh_token);
  return token;
};

export const signup = async (data: SignupRequest): Promise<Token> => {
  const response = await api.post('/auth/signup', data);
  const token: Token = response.data;
  localStorage.setItem('access_token', token.access_token);
  localStorage.setItem('refresh_token', token.refresh_token);
  return token;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};
```

## API Service Examples

### Users API

```typescript
import api from './api';

export const getUsers = async (skip = 0, limit = 100, role?: string) => {
  const response = await api.get('/users', { params: { skip, limit, role } });
  return response.data;
};

export const getUser = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, data: any) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};
```

### Alumni API

```typescript
import api from './api';

export const searchAlumni = async (search?: string, skill?: string, location?: string) => {
  const response = await api.get('/alumni', {
    params: { search, skill, location },
  });
  return response.data;
};
```

### Messages API

```typescript
import api from './api';

export const getMessages = async (userId: string) => {
  const response = await api.get(`/messages/${userId}`);
  return response.data;
};

export const sendMessage = async (receiverId: string, content: string) => {
  const response = await api.post('/messages', {
    receiver_id: receiverId,
    content,
  });
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get('/messages/conversations/list');
  return response.data;
};
```

### WebSocket Setup

Create `src/services/websocket.ts`:

```typescript
import { getCurrentUser } from './apiAuth';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(userId: string, onMessage: (data: any) => void) {
    this.userId = userId;
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token');
    }

    const wsUrl = `ws://localhost:8000/ws/${userId}?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      // Send ping every 30 seconds
      setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'pong') {
        return; // Heartbeat response
      }
      onMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(this.userId!, () => {});
      }, 1000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

export const wsService = new WebSocketService();
```

## Migration from Firebase

To migrate from Firebase to the FastAPI backend:

1. **Update Auth Context**: Replace Firebase auth with API calls
2. **Update Firestore calls**: Replace with API endpoints
3. **Update WebSocket**: Use the new WebSocket service
4. **Update environment**: Point to FastAPI backend URL

## Type Definitions

Create `src/types/api.ts`:

```typescript
export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  // ... other fields
}
```

## Testing

Test the API using:

1. **Swagger UI**: http://localhost:8000/docs
2. **Postman**: Import the API endpoints
3. **Frontend**: Use the axios setup above

## CORS

The backend is configured to allow requests from:
- `http://localhost:5173` (Vite default)
- Your `FRONTEND_URL` from `.env`

Update CORS in `app/main.py` if needed.
