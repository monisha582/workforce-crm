import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Get allowed origins for CORS
const getAllowedOrigins = () => {
  const allowed = [
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  // Add FRONTEND_URL if set
  if (process.env.FRONTEND_URL) {
    allowed.push(process.env.FRONTEND_URL);
  }
  
  return allowed;
};

// Socket.IO Setup
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = getAllowedOrigins();
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
});

// Store io in app for access in routes
app.set('io', io);

// ============================================
// SWAGGER DOCUMENTATION
// ============================================

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Workforce CRM API',
      version: '1.0.0',
      description: 'Employee Performance Management System API',
      contact: {
        name: 'Support',
        email: 'support@workforcecrm.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging
app.use(requestLogger);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// API root helper
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Workforce CRM API. Use /api/docs for Swagger UI or /api/health for a health check.',
    availableRoutes: [
      '/api/docs',
      '/api/auth',
      '/api/users',
      '/api/attendance',
      '/api/tasks',
      '/api/projects',
      '/api/performance',
      '/api/leaves',
      '/api/chat',
      '/api/dashboard',
      '/api/reports',
    ],
  });
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);

// Serve the built frontend if it exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.join(__dirname, '..', '..', 'client', 'dist');

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({
        success: false,
        message: 'API route not found',
        path: req.originalUrl,
      });
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// ============================================
// SOCKET.IO EVENTS
// ============================================

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join user to their personal room
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined personal room`);
  });

  // Join channel
  socket.on('join-channel', (channelId) => {
    socket.join(`channel-${channelId}`);
  });

  // Send message
  socket.on('send-message', (data) => {
    io.to(`channel-${data.channelId}`).emit('receive-message', data);
  });

  // Presence update
  socket.on('user-online', (userId) => {
    io.emit('user-status', { userId, status: 'online' });
  });

  socket.on('user-offline', (userId) => {
    io.emit('user-status', { userId, status: 'offline' });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 API docs available at http://localhost:${PORT}/api/docs`);
  console.log(`🔧 Environment: ${NODE_ENV}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
