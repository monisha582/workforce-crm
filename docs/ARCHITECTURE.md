# 🧑‍💻 Developer Guide - Architecture & Code Patterns

This guide explains the architecture and code patterns used in Workforce CRM.

## Architecture Overview

### Frontend Architecture (React)

```
Pages (High-level components)
    ↓
Components (Reusable UI components)
    ↓
Services (API calls)
    ↓
Context/Store (State management)
    ↓
Utils & Hooks (Utilities and custom hooks)
```

### Backend Architecture (Node.js/Express)

```
Routes (HTTP endpoints)
    ↓
Controllers (Request handlers)
    ↓
Services (Business logic) - [Optional layer]
    ↓
Models (Database queries via Prisma)
    ↓
Middleware (Authentication, validation)
```

## Frontend Patterns

### 1. Page Components

Location: `src/pages/`

Pattern:
```jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../context/authStore';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tasks</h1>
      {/* Component content */}
    </div>
  );
}
```

### 2. API Service Pattern

Location: `src/services/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// Interceptors for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3. State Management with Zustand

Location: `src/context/authStore.js`

```javascript
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    set({ token, isAuthenticated: !!token });
  },
}));
```

### 4. Component Pattern

```jsx
// Reusable component
function TaskCard({ task, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold">{task.title}</h3>
      <p className="text-gray-600">{task.description}</p>
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </div>
  );
}

export default TaskCard;
```

## Backend Patterns

### 1. Route Pattern

Location: `src/routes/taskRoutes.js`

```javascript
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

// Public routes (none in HRMS)

// Protected routes
router.get('/', protect, getTasks);
router.post('/', protect, createTask);
router.patch('/:id', protect, updateTask);
router.delete('/:id', protect, authorize('ADMIN', 'LEAD'), deleteTask);

export default router;
```

### 2. Controller Pattern

Location: `src/controllers/taskController.js`

```javascript
import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const getTasks = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    // Build query
    const where = { assigneeId: userId };
    if (status) where.status = status;

    // Execute query with pagination
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        include: { assignee: true, subtasks: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    throw error; // Caught by error middleware
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, assigneeId, dueDate } = req.body;

    // Validation
    if (!title || !assigneeId) {
      throw new AppError('Missing required fields', 400);
    }

    // Create
    const task = await prisma.task.create({
      data: {
        title,
        description,
        assigneeId,
        createdBy: req.user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_TASK',
        resource: `Task:${task.id}`,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Task created',
      data: task,
    });
  } catch (error) {
    throw error;
  }
};
```

### 3. Middleware Pattern

Location: `src/middleware/auth.js`

```javascript
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

// Authentication middleware
export const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new AppError('No token provided', 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

// Authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }
    next();
  };
};
```

### 4. Error Handling Pattern

Location: `src/middleware/errorHandler.js`

```javascript
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (err, req, res, next) => {
  if (err.code === 'P2002') {
    // Prisma unique constraint
    return res.status(400).json({
      success: false,
      message: `${err.meta.target[0]} already exists`,
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
  });
};
```

## Database Patterns (Prisma)

### 1. Create with Relations

```javascript
const project = await prisma.project.create({
  data: {
    name: 'Project Name',
    leadId: userId,
    teamMembers: {
      create: [
        { memberId: user1Id },
        { memberId: user2Id },
      ],
    },
  },
  include: { teamMembers: true },
});
```

### 2. Update with Relations

```javascript
const task = await prisma.task.update({
  where: { id: taskId },
  data: {
    status: 'COMPLETED',
    subtasks: {
      updateMany: {
        where: { status: { not: 'COMPLETED' } },
        data: { status: 'COMPLETED' },
      },
    },
  },
});
```

### 3. Query with Filtering

```javascript
const tasks = await prisma.task.findMany({
  where: {
    AND: [
      { assigneeId: userId },
      { status: 'IN_PROGRESS' },
      { dueDate: { lte: new Date() } },
    ],
  },
  orderBy: { dueDate: 'asc' },
  take: 10,
});
```

### 4. Transaction Pattern

```javascript
const result = await prisma.$transaction(async (tx) => {
  // Multiple operations as one transaction
  const user = await tx.user.create({ data: {...} });
  const perf = await tx.performance.create({
    data: { userId: user.id, ... }
  });
  return { user, perf };
});
```

## Performance Patterns

### 1. Pagination

```javascript
// Frontend
const [page, setPage] = useState(1);
const limit = 10;

const response = await api.get(`/tasks?page=${page}&limit=${limit}`);

// Backend already implemented in controllers
```

### 2. Selective Field Loading

```javascript
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
    // Don't fetch password
  },
});
```

### 3. Lazy Loading Relations

```javascript
// Load only when needed
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    tasks: { take: 5 }, // Limit related records
    performance: true,
  },
});
```

## Testing Patterns

### Unit Test Example

```javascript
// test.js
describe('Task Controller', () => {
  it('should create task with valid data', async () => {
    const taskData = {
      title: 'Test Task',
      assigneeId: 'user-123',
    };

    const result = await createTask(taskData);

    expect(result.id).toBeDefined();
    expect(result.title).toBe('Test Task');
  });

  it('should throw error without title', async () => {
    expect(() => createTask({ assigneeId: 'user-123' }))
      .toThrow('Missing required fields');
  });
});
```

## API Response Pattern

All API responses follow this pattern:

```json
{
  "success": true|false,
  "message": "Human readable message",
  "data": {...},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  },
  "errors": [...] // Optional
}
```

## Best Practices Used

✅ **Frontend:**
- Functional components with hooks
- Custom hooks for reusability
- State management with Zustand
- API error handling
- Loading and error states
- Responsive Tailwind CSS
- Component composition

✅ **Backend:**
- Express middleware pipeline
- Prisma ORM for type safety
- Error handling middleware
- Input validation
- Activity logging
- Role-based access control
- Pagination for large datasets
- Proper HTTP status codes

✅ **Database:**
- Normalized schema
- Proper relationships
- Foreign key constraints
- Unique constraints
- Indexes on frequently queried columns
- Timestamps (createdAt, updatedAt)
- Soft deletes (isActive flag)

✅ **General:**
- Separation of concerns
- DRY (Don't Repeat Yourself)
- SOLID principles
- Clean code
- Comprehensive comments
- Meaningful variable names

## Code Quality Metrics

- **Lines of Code**: ~5000
- **Functions**: 100+
- **Database Tables**: 17
- **API Endpoints**: 30+
- **Frontend Components**: 20+
- **Test Coverage**: Ready for testing

## Future Improvements

1. Add comprehensive unit tests
2. Implement integration tests
3. Add E2E tests with Cypress
4. Setup CI/CD pipeline
5. Add load testing
6. Implement caching (Redis)
7. Add GraphQL API layer
8. Microservices architecture

---

For questions about specific patterns, check the corresponding file in the codebase.
