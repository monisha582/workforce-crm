# Database Audit and Corrected Schema

This document reflects the database structure that is actually implemented in the current project. I reviewed the frontend screens, the React routes, the backend controllers and routes, the Prisma schema, the migrations, and the seed data before writing this version.

The current application is a workforce management system with authentication, user management, attendance tracking, task management, projects, performance reporting, and internal communication. It does not currently include volunteer management, event registration, or application approval workflows as part of the shipped UI or backend flow.

## What I verified

The audit was based on the real implementation in:

- Frontend pages in the client app, especially the screens under the pages folder
- Navigation and route setup in the app shell
- Backend routes and controller logic in the server app
- Prisma models and the SQL migration file
- Seed data used to initialize the database

## Frontend-to-backend comparison

| Frontend screen | What the UI actually does | Backend support that exists |
|---|---|---|
| Login and Register | Auth forms for sign-in and account creation | Auth endpoints and user creation logic |
| Dashboard | Static dashboard view with placeholder content | Dashboard statistics endpoints |
| Tasks | Create tasks with title, description, and assignee | Task CRUD plus task status updates and subtask support |
| Projects | Project cards and progress display | Project CRUD, milestones, team membership |
| Attendance | Check in and check out with history and summary | Attendance check-in/check-out and leave-related API |
| Performance | Performance overview screen | Performance metrics and leaderboard endpoints |
| Teams | Static team overview screen | Team data is modeled through projects and users, but not fully surfaced in the UI |
| Chat | Channel-based communication UI | Channel and announcement APIs, plus backend chat room support |
| Admin | Static admin overview screen | User role and activity log APIs |

## Audit findings and mismatches

The main mismatches between the earlier schema and the real application are below.

### 1. Leave management

- The frontend has no leave page and no leave entry in the sidebar navigation.
- The backend does contain leave-related routes and controller logic, so the leave table is not completely unused.
- For the current UI-driven application, leave is best treated as a backend-only feature rather than a core visible module.

### 2. Tasks

- The current UI only creates tasks with title, description, and assignee.
- The backend also supports subtasks and attachments, but the visible UI does not use those features.
- Because those tables are still present in the controller logic and routes, they remain part of the implemented backend model.

### 3. Communication

- The frontend uses channels and announcements rather than a full chat-room experience.
- The backend still supports chat rooms, messages, and read receipts, so those tables remain in the implementation.
- They are not the main UI flow, but they are implemented server-side.

### 4. User profile fields

- The registration form only collects first name, last name, email, and password.
- The backend supports additional fields such as phone, profile image, department selection, and active status, but the current UI does not expose them during registration or profile editing.
- These fields remain in the schema because the backend and API support them.

### 5. Departments

- The UI shows departments in the admin screen, but there is no form or workflow to create, edit, or delete departments.
- The department table is still used by users and channels, so it is part of the current data model.

### 6. Attendance fields

- The UI shows attendance status and check-in/check-out times, but it does not display working hours or notes.
- Working hours are still calculated and stored in the backend during checkout.
- Notes are not used anywhere in the application and are not kept in the corrected schema.

### 7. createdAt and updatedAt

- These fields are used for backend ordering, history, and auditing.
- They are not shown in the frontend, but they are still meaningful metadata fields and are kept on the tables where the backend relies on them.

### 8. Volunteer, event, and application workflows

- There is no volunteer registration flow, no event registration flow, and no application approval workflow in the current codebase.
- The earlier statement that these areas are not represented in the schema remains correct.

## A. Mismatches found

1. The earlier schema treated leave as a core visible feature, but the current UI does not expose it.
2. The earlier schema described subtasks and attachments as a major task workflow, but the UI only uses the basic task form.
3. The earlier schema described chat rooms and read receipts as a central feature, while the current UI is centered on channels and announcements.
4. The earlier schema implied a fully editable department management module, but the current project does not implement that workflow.
5. The earlier schema included attendance notes and other fields that are not used by the current application logic.
6. The earlier schema implied a stronger volunteer/event/application model than the code actually contains.

## B. Unused database tables

No table is completely unused in the current codebase.

The closest cases are:

- Leave is backend-only and not surfaced in the UI.
- Chat rooms and read receipts are implemented in the backend but are not part of the primary UI experience.

## C. Unused columns

These columns are not used by the current application logic and are removed from the corrected schema:

- attendance.notes
- performance.rank

## D. Missing columns that should exist

No essential database columns are missing for the current implementation.

The application already has the core columns needed for:

- authentication and user roles
- attendance handling
- task assignment
- project tracking
- performance scoring
- channels and announcements

## Corrected database schema

The schema below matches the implementation that currently exists in the project.

### Users

- Purpose: Stores the account details for every person who can log in and use the application.
- Primary key: id
- Important columns:
  - id: String
  - email: String, unique
  - password: String
  - firstName: String
  - lastName: String
  - phone: String, optional
  - role: Enum, one of SUPER_ADMIN, HR, TEAM_LEAD, EMPLOYEE, INTERN
  - departmentId: String, optional
  - profileImage: String, optional
  - isActive: Boolean, default true
  - createdAt: DateTime
  - updatedAt: DateTime
- Foreign keys:
  - departmentId -> departments.id
- Relationships:
  - One department can have many users.
  - One user can have many attendance records, tasks, leaves, projects through team membership, performance records, messages, and activity logs.

### Departments

- Purpose: Stores the organization’s departments.
- Primary key: id
- Important columns:
  - id: String
  - name: String, unique
  - description: String, optional
  - head: String, optional
  - createdAt: DateTime
  - updatedAt: DateTime
- Foreign keys: None
- Relationships:
  - One department can have many users.
  - One department can have many channels.

### Attendance

- Purpose: Tracks daily attendance for each user.
- Primary key: id
- Important columns:
  - id: String
  - userId: String
  - checkInTime: DateTime, optional
  - checkOutTime: DateTime, optional
  - date: DateTime
  - status: Enum
  - workingHours: Float, optional
  - createdAt: DateTime
  - updatedAt: DateTime
- Foreign keys:
  - userId -> users.id
- Relationships:
  - One user can have many attendance rows.
  - The schema enforces one attendance row per user per date.

### Leaves

- Purpose: Stores leave requests submitted by users.
- Primary key: id
- Important columns:
  - id: String
  - userId: String
  - leaveType: Enum
  - startDate: DateTime
  - endDate: DateTime
  - reason: String
  - status: Enum
  - approvedBy: String, optional
  - approvalDate: DateTime, optional
  - rejectReason: String, optional
  - createdAt: DateTime
  - updatedAt: DateTime
- Foreign keys:
  - userId -> users.id
- Relationships:
  - One user can submit many leave requests.

### Tasks

- Purpose: Stores work items assigned to employees.
- Primary key: id
- Important columns:
  - id: String
  - title: String
  - description: String, optional
  - assigneeId: String
  - createdBy: String
  - status: Enum
  - priority: Enum
  - dueDate: DateTime, optional
  - completedAt: DateTime, optional
  - projectId: String, optional
  - estimatedHours: Float, optional
  - actualHours: Float, optional
  - qualityRating: Int, optional
  - createdAt: DateTime
  - updatedAt: DateTime
- Foreign keys:
  - assigneeId -> users.id
- Relationships:
  - One user can be assigned many tasks.
  - One task can have many subtasks and attachments.
  - A task can optionally belong to a project.

### Subtasks

- Purpose: Breaks a task into smaller pieces.
- Primary key: id
- Important columns:
  - id: String
  - taskId: String
  - title: String
  - assigneeId: String, optional
  - status: Enum
  - dueDate: DateTime, optional
  - completedAt: DateTime, optional
  - createdAt: DateTime
  - updatedAt: DateTime
- Foreign keys:
  - taskId -> tasks.id
  - assigneeId -> users.id
- Relationships:
  - One task can have many subtasks.

### Attachments

- Purpose: Stores files attached to a task.
- Primary key: id
- Important columns:
  - id: String
  - taskId: String
  - fileName: String
  - fileUrl: String
  - fileSize: Int, optional
  - fileType: String, optional
  - uploadedAt: DateTime
- Foreign keys:
  - taskId -> tasks.id
- Relationships:
  - One task can have many attachments.

### Projects

- Purpose: Stores larger initiatives that are assigned to a lead and a set of team members.
- Primary key: id
- Important columns:
  - id: String
  - name: String
  - description: String, optional
  - status: Enum
  - startDate: DateTime
  - endDate: DateTime, optional
  - budget: Float, optional
  - leadId: String
  - progress: Float, optional
  - createdAt: DateTime
  - updatedAt: DateTime
- Foreign keys:
  - leadId -> users.id
- Relationships:
  - One user can lead many projects.
  - One project can have many team members and milestones.

### Team Members

- Purpose: Connects users to projects.
- Primary key: id
- Important columns:
  - id: String
  - projectId: String
  - memberId: String
  - role: String, optional
  - joinedAt: DateTime
- Foreign keys:
  - projectId -> projects.id
  - memberId -> users.id
- Relationships:
  - This is the many-to-many bridge between users and projects.

### Milestones

- Purpose: Stores project checkpoints.
- Primary key: id
- Important columns:
  - id: String
  - projectId: String
  - name: String
  - description: String, optional
  - dueDate: DateTime
  - status: Enum
  - completedAt: DateTime, optional
  - createdAt: DateTime
  - updatedAt: DateTime
- Foreign keys:
  - projectId -> projects.id
- Relationships:
  - One project can have many milestones.

### Performance

- Purpose: Stores calculated performance scores for a user.
- Primary key: id
- Important columns:
  - id: String
  - userId: String, unique
  - attendanceScore: Float
  - taskScore: Float
  - deadlineScore: Float
  - qualityScore: Float
  - totalScore: Float
  - month: Int
  - year: Int
  - lastUpdated: DateTime
  - createdAt: DateTime
- Foreign keys:
  - userId -> users.id
- Relationships:
  - One user has one performance record for a given month and year.

### Channels

- Purpose: Stores communication channels linked to departments.
- Primary key: id
- Important columns:
  - id: String
  - name: String
  - description: String, optional
  - departmentId: String
  - isPrivate: Boolean, default false
  - createdAt: DateTime
  - updatedAt: DateTime
- Foreign keys:
  - departmentId -> departments.id
- Relationships:
  - One department can have many channels.
  - One channel can have many announcements and chat rooms.

### Chat Rooms

- Purpose: Stores chat threads for conversations.
- Primary key: id
- Important columns:
  - id: String
  - name: String, optional
  - type: Enum
  - createdById: String
  - members: String array
  - channelId: String, optional
  - createdAt: DateTime
  - updatedAt: DateTime
- Foreign keys:
  - createdById -> users.id
  - channelId -> channels.id
- Relationships:
  - One user can create many chat rooms.
  - One chat room can have many messages.

### Messages

- Purpose: Stores content inside a chat room.
- Primary key: id
- Important columns:
  - id: String
  - chatRoomId: String
  - senderId: String
  - content: String
  - attachmentUrl: String, optional
  - createdAt: DateTime
  - updatedAt: DateTime
- Foreign keys:
  - chatRoomId -> chat_rooms.id
  - senderId -> users.id
- Relationships:
  - One chat room can have many messages.

### Announcements

- Purpose: Stores departmental announcements posted to channels.
- Primary key: id
- Important columns:
  - id: String
  - title: String
  - content: String
  - channelId: String
  - priority: String, optional
  - expiresAt: DateTime, optional
  - createdAt: DateTime
  - updatedAt: DateTime
- Foreign keys:
  - channelId -> channels.id
- Relationships:
  - One channel can have many announcements.

### Read Receipts

- Purpose: Tracks which users have read a message.
- Primary key: id
- Important columns:
  - id: String
  - messageId: String
  - userId: String
  - readAt: DateTime
- Foreign keys:
  - messageId -> messages.id
  - userId -> users.id
- Relationships:
  - One message can have many read receipts.

### Activity Logs

- Purpose: Records user actions and system events for auditing.
- Primary key: id
- Important columns:
  - id: String
  - userId: String
  - action: String
  - resource: String, optional
  - description: String, optional
  - ipAddress: String, optional
  - userAgent: String, optional
  - createdAt: DateTime
- Foreign keys:
  - userId -> users.id
- Relationships:
  - One user can have many activity log entries.

## Relationship summary

The current schema uses three main relationship patterns:

- One-to-many:
  - Departments to Users
  - Departments to Channels
  - Users to Attendance
  - Users to Leaves
  - Users to Tasks
  - Tasks to Subtasks
  - Tasks to Attachments
  - Projects to Team Members
  - Projects to Milestones
  - Channels to Announcements
  - Chat Rooms to Messages
  - Messages to Read Receipts
  - Users to Activity Logs
- One-to-one:
  - Users to Performance records
- Many-to-many:
  - Users and Projects are joined through team_members

## Updated ER diagram

```mermaid
er diagram
  User ||--o{ Attendance : has
  User ||--o{ Leave : submits
  User ||--o{ Task : assigned
  User ||--o{ Subtask : assigned
  User ||--o{ ActivityLog : creates
  User ||--o{ Message : sends
  User ||--o{ TeamMember : joins
  User ||--o{ Project : leads
  User ||--o| Performance : has

  Department ||--o{ User : contains
  Department ||--o{ Channel : contains

  Task ||--o{ Subtask : contains
  Task ||--o{ Attachment : has
  Task }o--|| Project : belongs_to

  Project ||--o{ TeamMember : has
  Project ||--o{ Milestone : has

  Channel ||--o{ Announcement : contains
  Channel ||--o{ ChatRoom : contains

  ChatRoom ||--o{ Message : contains
  Message ||--o{ ReadReceipt : has
```

## Updated SQL schema

```sql
CREATE TABLE departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  head TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'EMPLOYEE',
  departmentId TEXT REFERENCES departments(id),
  profileImage TEXT,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checkInTime TIMESTAMP,
  checkOutTime TIMESTAMP,
  date TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'ABSENT',
  workingHours DOUBLE PRECISION,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, date)
);

CREATE TABLE leaves (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leaveType TEXT NOT NULL,
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  approvedBy TEXT,
  approvalDate TIMESTAMP,
  rejectReason TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigneeId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  createdBy TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  dueDate TIMESTAMP,
  completedAt TIMESTAMP,
  projectId TEXT,
  estimatedHours DOUBLE PRECISION,
  actualHours DOUBLE PRECISION,
  qualityRating INTEGER,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subtasks (
  id TEXT PRIMARY KEY,
  taskId TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  assigneeId TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'PENDING',
  dueDate TIMESTAMP,
  completedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attachments (
  id TEXT PRIMARY KEY,
  taskId TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  fileName TEXT NOT NULL,
  fileUrl TEXT NOT NULL,
  fileSize INTEGER,
  fileType TEXT,
  uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PLANNING',
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP,
  budget DOUBLE PRECISION,
  leadId TEXT NOT NULL REFERENCES users(id),
  progress DOUBLE PRECISION DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_members (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  memberId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT,
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(projectId, memberId)
);

CREATE TABLE milestones (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  dueDate TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  completedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE performances (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  attendanceScore DOUBLE PRECISION NOT NULL DEFAULT 0,
  taskScore DOUBLE PRECISION NOT NULL DEFAULT 0,
  deadlineScore DOUBLE PRECISION NOT NULL DEFAULT 0,
  qualityScore DOUBLE PRECISION NOT NULL DEFAULT 0,
  totalScore DOUBLE PRECISION NOT NULL DEFAULT 0,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, month, year)
);

CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  departmentId TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  isPrivate BOOLEAN NOT NULL DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, departmentId)
);

CREATE TABLE chat_rooms (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT NOT NULL DEFAULT 'DIRECT',
  createdById TEXT NOT NULL REFERENCES users(id),
  members TEXT[],
  channelId TEXT REFERENCES channels(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  chatRoomId TEXT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  senderId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachmentUrl TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  channelId TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  priority TEXT,
  expiresAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE read_receipts (
  id TEXT PRIMARY KEY,
  messageId TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  readAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(messageId, userId)
);

CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource TEXT,
  description TEXT,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Why this schema was changed

The main changes were made to keep the schema aligned with the way the project actually works today:

- The leave table was kept because the backend has leave routes and controller logic, but it is documented as a backend-only feature rather than a main UI workflow.
- Subtasks and attachments were kept because the backend task routes support them even though the visible task form does not expose them.
- Chat rooms and read receipts were kept because the backend implements them, even though the UI primarily uses channels and announcements.
- The attendance notes field was removed because it is not used anywhere in the current code.
- The performance rank field was removed because it is not referenced by the current backend or frontend logic.
- Department management remains a lookup and association feature rather than a full CRUD module, which matches the current implementation.

## Summary

The corrected schema reflects the current application more accurately than the earlier document. It keeps the core entities that are actively used by the authentication flow, attendance flow, task flow, project flow, performance flow, and communication flow, while leaving out fields and concepts that are not part of the current implementation.
