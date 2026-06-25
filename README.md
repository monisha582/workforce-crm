# Workforce CRM - Employee Performance Management System

> A complete production-ready HRMS and Employee Performance Management System built with modern tech stack.

## 🎯 Overview

Workforce CRM is an enterprise-grade Employee Performance Management System designed to streamline HR operations, track employee performance, manage tasks and projects, and facilitate team communication. Built with a modern tech stack for scalability and performance.

## ✨ Key Features

### 1. **Authentication & RBAC**
- Secure JWT-based authentication
- 5 user roles: Super Admin, HR, Team Lead, Employee, Intern
- Role-based access control for all features

### 2. **Dashboard**
- Real-time performance overview
- Task statistics (Active/Completed/Pending)
- Attendance metrics
- Performance score and leaderboard
- Recent activity log
- Announcements widget

### 3. **Attendance Management**
- Check-in/Check-out system
- Attendance history and monthly reports
- Leave requests (with approvals)
- Multiple leave types support
- Working hours calculation

### 4. **Task Management**
- Create and assign tasks
- Kanban board (Pending → In Progress → Under Review → Completed/Rejected)
- Subtasks support
- File attachments
- Priority levels
- Quality rating system

### 5. **Project Management**
- Create and manage projects
- Team member assignment
- Milestone tracking
- Project progress tracking
- Status management

### 6. **Performance System**
- Auto-calculated performance score based on:
  - Attendance (30%)
  - Task completion (40%)
  - Deadline adherence (20%)
  - Quality rating (10%)
- Monthly performance records
- Leaderboard rankings

### 7. **Communication Module**
- Global chat channels
- Department-specific channels
- Private messaging
- Real-time messaging with Socket.IO
- Announcements system
- Message read receipts

### 8. **Reports & Analytics**
- Task completion reports
- Attendance reports
- Performance reports
- Department analytics
- Export to PDF & CSV

### 9. **Admin Panel**
- User management (CRUD)
- Role assignment
- Department management
- Activity logging
- System statistics

## 🛠 Tech Stack

### **Frontend**
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)
- Recharts (data visualization)
- Socket.IO Client (real-time updates)
- Zustand (state management)
- Axios (API calls)

### **Backend**
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT (authentication)
- bcrypt (password hashing)
- Socket.IO (real-time communication)
- Swagger (API documentation)

### **Database**
- PostgreSQL 12+
- Prisma ORM

## 📋 Project Structure

```
workforce-crm/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   ├── services/           # API calls
│   │   ├── context/            # State management
│   │   ├── hooks/              # Custom hooks
│   │   └── utils/              # Utilities
│   ├── public/                 # Static assets
│   └── package.json
│
├── server/                      # Node/Express Backend
│   ├── src/
│   │   ├── routes/             # API routes
│   │   ├── controllers/        # Business logic
│   │   ├── middleware/         # Custom middleware
│   │   ├── services/           # Business services
│   │   ├── config/             # Configuration
│   │   ├── utils/              # Utilities
│   │   └── index.js            # Entry point
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Seed data
│   └── package.json
│
└── docs/                        # Documentation
    ├── API.md                  # API documentation
    ├── SETUP.md               # Setup guide
    └── DEPLOYMENT.md          # Deployment guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- Git

### Installation

1. **Clone the repository**
```bash
cd workforce-crm
```

2. **Setup Backend**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database credentials
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

3. **Setup Frontend**
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

4. **Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api/docs

## 📝 Demo Credentials

```
Email: admin@workforce.com
Password: Password123!

Alternative accounts:
- HR Manager: hr@workforce.com
- Team Lead: lead@workforce.com
- Employee: emp1@workforce.com
- Intern: intern@workforce.com
(All use: Password123!)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id` - Update profile
- `PATCH /api/users/:id/role` - Assign role (Admin)

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/history` - Get history
- `POST /api/attendance/leave` - Request leave
- `GET /api/attendance/leaves` - Get leaves
- `PATCH /api/attendance/leaves/:id` - Approve/Reject

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get tasks
- `GET /api/tasks/:id` - Get task details
- `PATCH /api/tasks/:id/status` - Update status
- `DELETE /api/tasks/:id` - Delete task

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - Get projects
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id/progress` - Update progress

### Performance
- `GET /api/performance/metrics` - Get performance metrics
- `GET /api/performance/leaderboard` - Get leaderboard
- `GET /api/performance/rank/:userId` - Get user rank

### Chat
- `POST /api/chat/rooms` - Create chat room
- `GET /api/chat/rooms` - Get chat rooms
- `POST /api/chat/rooms/:roomId/messages` - Send message
- `GET /api/chat/rooms/:roomId/messages` - Get messages

### Dashboard
- `GET /api/dashboard` - Get overview
- `GET /api/dashboard/statistics` - Get statistics
- `GET /api/dashboard/leaderboard` - Get leaderboard

### Reports
- `GET /api/reports/tasks` - Task reports
- `GET /api/reports/attendance` - Attendance reports
- `GET /api/reports/performance` - Performance reports

## 📊 Database Schema

The application uses a comprehensive Prisma ORM schema with the following main entities:

- **Users** - User accounts with roles
- **Departments** - Organization structure
- **Attendance** - Daily attendance records
- **Leaves** - Leave requests and approvals
- **Tasks** - Task management
- **Subtasks** - Task breakdown
- **Projects** - Project tracking
- **TeamMembers** - Project team assignments
- **Milestones** - Project milestones
- **Performance** - Performance metrics
- **ChatRooms** - Communication channels
- **Messages** - Chat messages
- **Announcements** - System announcements
- **ActivityLogs** - User activity tracking

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- CORS protection
- Helmet.js for HTTP headers
- Request validation
- Activity logging
- Rate limiting ready

## 📈 Performance Scoring Algorithm

```
Total Score = Attendance Score + Task Score + Deadline Score + Quality Score

- Attendance Score (0-30): Based on present days ratio
- Task Score (0-40): Based on completed tasks ratio
- Deadline Score (0-20): Based on on-time delivery ratio
- Quality Score (0-10): Based on quality ratings average
```

## 🧪 Dummy Data

The database comes pre-seeded with:
- 8 users (Super Admin, HR, Team Lead, 4 Employees, 1 Intern)
- 4 departments (Engineering, HR, Operations, Sales)
- 30 days of attendance records
- 3 tasks with different statuses
- 1 project with 4 team members and 2 milestones
- 2 chat channels with messages
- 1 announcement

**Use these to test the application immediately after setup!**

## 🌐 Real-time Features

The application uses Socket.IO for real-time updates:
- Instant chat messaging
- Live user presence status
- Real-time notifications
- Activity stream updates

## 📱 Responsive Design

The frontend is fully responsive with:
- Mobile-first approach
- Tailwind CSS grid system
- Adaptive sidebars
- Touch-friendly interfaces

## 🚢 Deployment

### 🔥 Deploy to Production (Recommended)

**Frontend:** Vercel | **Backend:** Railway (Postgres included)

- **📖 Quick Start:** [QUICK_DEPLOY.md](./docs/QUICK_DEPLOY.md) *(5-15 min setup)*
- **📚 Detailed Guide:** [DEPLOYMENT_VERCEL_RAILWAY.md](./docs/DEPLOYMENT_VERCEL_RAILWAY.md) *(full walkthrough)*

**Estimated Cost:** ~$5/month (covered by Railway's free tier)

### Alternative Deployment Options

For other platforms, see [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

### Quick Deploy Command

```bash
# Build frontend
cd client && npm run build

# Deploy backend to Railway via GitHub
# (automatic when you push to main)

# Deploy frontend to Vercel via GitHub
# (automatic when you push to main)
```

## 📚 API Documentation

Full Swagger API documentation available at:
`http://localhost:5000/api/docs`

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Run: `npx prisma db push`

2. **Port Already in Use**
   ```bash
   # Change port in .env or kill process
   lsof -ti:5000 | xargs kill -9
   ```

3. **CORS Issues**
   - Check FRONTEND_URL in backend .env
   - Verify frontend is accessible

4. **Import Errors**
   - Run: `npm install`
   - Run: `npx prisma generate`

## 📞 Support & Contribution

For issues, suggestions, or contributions:
1. Check existing issues
2. Create detailed bug reports
3. Submit pull requests

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🎉 Key Highlights

✅ **Production-Ready**: Enterprise-grade code quality and architecture
✅ **Fully Functional**: All 10 core modules implemented
✅ **Impressive UI**: Modern, responsive, recruiter-friendly design
✅ **Real-time**: Socket.IO integration for instant updates
✅ **Scalable**: Clean architecture ready for growth
✅ **Documented**: Comprehensive API and setup documentation
✅ **Secure**: JWT auth, password hashing, RBAC
✅ **Seeded Data**: Pre-populated database for immediate testing

---

**Built with ❤️ for modern workforce management.**
