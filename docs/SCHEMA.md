# Workforce CRM Database Schema Documentation

This document describes the actual database schema and the application data flow implemented in this project. It is based on the server-side Prisma schema, Express route and controller implementation, frontend API calls, and visible UI pages.

## 1. Overview

The database is managed by Prisma and uses PostgreSQL as its persistence layer. The core domain is employee workforce management, centered on:

- Authentication and user roles
- Attendance and leave requests
- Task management with subtasks and attachments
- Project management with milestones and team membership
- Performance scoring and leaderboard data
- Communication channels, chat rooms, and announcements
- Activity logging for basic event audit

Data access is handled through REST endpoints under `/api`, and frontend pages use Axios to call these routes. JWT authentication protects API access, and role-based authorization restricts administrative actions.

## 2. Database architecture and key tables

The Prisma schema uses the following tables and related enums:

- `users`
- `departments`
- `attendance`
- `leaves`
- `tasks`
- `subtasks`
- `attachments`
- `projects`
- `team_members`
- `milestones`
- `performances`
- `chat_rooms`
- `channels`
- `messages`
- `read_receipts`
- `announcements`
- `activity_logs`

### 2.1 Enums

The backend defines these enums:

- `UserRole`: `SUPER_ADMIN`, `HR`, `TEAM_LEAD`, `EMPLOYEE`, `INTERN`
- `AttendanceStatus`: `PRESENT`, `ABSENT`, `LEAVE`, `WORK_FROM_HOME`, `LATE`
- `TaskStatus`: `PENDING`, `IN_PROGRESS`, `UNDER_REVIEW`, `COMPLETED`, `REJECTED`
- `TaskPriority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `LeaveType`: `SICK_LEAVE`, `CASUAL_LEAVE`, `EARNED_LEAVE`, `MATERNITY_LEAVE`, `SPECIAL_LEAVE`
- `LeaveStatus`: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`
- `ProjectStatus`: `PLANNING`, `IN_PROGRESS`, `ON_HOLD`, `COMPLETED`, `CANCELLED`
- `MilestoneStatus`: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `DELAYED`
- `ChatType`: `DIRECT`, `CHANNEL`, `GROUP`

## 3. Tables and fields

### 3.1 `users`

Purpose: store registered accounts and role metadata.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `email` (`String`, unique)
- `password` (`String`)
- `firstName` (`String`)
- `lastName` (`String`)
- `phone` (`String?`)
- `role` (`UserRole`, default `EMPLOYEE`)
- `departmentId` (`String?`)
- `profileImage` (`String?`)
- `isActive` (`Boolean`, default `true`)
- `createdAt` (`DateTime`, default `now()`)
- `updatedAt` (`DateTime`, updated automatically)

Foreign keys:

- `departmentId` → `departments.id`

Relationships:

- One `User` may have many `Attendance` records.
- One `User` may have many `Task` assignments as `assignee`.
- One `User` may have many `Subtask` assignments.
- One `User` may lead many `Project` records.
- One `User` may have many `TeamMember` memberships.
- One `User` may have a single `Performance` record per month/year.
- One `User` may have many `Leave` requests.
- One `User` may send many `Message` records.
- One `User` may create many `ChatRoom` records.
- One `User` may have many `ReadReceipt` records.
- One `User` may have many `ActivityLog` entries.

### 3.2 `departments`

Purpose: store department references for users and channels.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `name` (`String`, unique)
- `description` (`String?`)
- `head` (`String?`)
- `createdAt` (`DateTime`, default `now()`)
- `updatedAt` (`DateTime`, updated automatically)

Relationships:

- One `Department` can have many `User` records.
- One `Department` can have many `Channel` records.

### 3.3 `attendance`

Purpose: track daily employee attendance and check-in/out.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `userId` (`String`, FK)
- `checkInTime` (`DateTime?`)
- `checkOutTime` (`DateTime?`)
- `date` (`DateTime`)
- `status` (`AttendanceStatus`, default `ABSENT`)
- `workingHours` (`Float?`)
- `notes` (`String?`)
- `createdAt` (`DateTime`, default `now()`)
- `updatedAt` (`DateTime`, updated automatically)

Constraints:

- Unique composite index on `(userId, date)`.

Relationships:

- One `Attendance` record belongs to one `User`.

### 3.4 `leaves`

Purpose: store leave request data and approval status.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `userId` (`String`, FK)
- `leaveType` (`LeaveType`)
- `startDate` (`DateTime`)
- `endDate` (`DateTime`)
- `reason` (`String`)
- `status` (`LeaveStatus`, default `PENDING`)
- `approvedBy` (`String?`)
- `approvalDate` (`DateTime?`)
- `rejectReason` (`String?`)
- `createdAt` (`DateTime`, default `now()`)
- `updatedAt` (`DateTime`, updated automatically)

Relationships:

- One `Leave` request belongs to one `User`.

### 3.5 `tasks`

Purpose: store assignable work items for users.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `title` (`String`)
- `description` (`String?`)
- `assigneeId` (`String`, FK)
- `createdBy` (`String`)
- `status` (`TaskStatus`, default `PENDING`)
- `priority` (`TaskPriority`, default `MEDIUM`)
- `dueDate` (`DateTime?`)
- `completedAt` (`DateTime?`)
- `projectId` (`String?`)
- `estimatedHours` (`Float?`)
- `actualHours` (`Float?`)
- `qualityRating` (`Int?`)
- `createdAt` (`DateTime`, default `now()`)
- `updatedAt` (`DateTime`, updated automatically)

Indexes:

- `assigneeId`
- `status`

Relationships:

- One `Task` belongs to one `User` as `assignee`.
- One `Task` may have many `Attachment` records.
- One `Task` may have many `Subtask` records.

### 3.6 `subtasks`

Purpose: store task breakdown items linked to parent tasks.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `taskId` (`String`, FK)
- `title` (`String`)
- `assigneeId` (`String?`, FK)
- `status` (`TaskStatus`, default `PENDING`)
- `dueDate` (`DateTime?`)
- `completedAt` (`DateTime?`)
- `createdAt` (`DateTime`, default `now()`)
- `updatedAt` (`DateTime`, updated automatically)

Indexes:

- `taskId`

Relationships:

- One `Subtask` belongs to one parent `Task`.
- One `Subtask` may optionally belong to one `User`.

### 3.7 `attachments`

Purpose: store file metadata for task attachments.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `taskId` (`String`, FK)
- `fileName` (`String`)
- `fileUrl` (`String`)
- `fileSize` (`Int?`)
- `fileType` (`String?`)
- `uploadedAt` (`DateTime`, default `now()`)

Indexes:

- `taskId`

Relationships:

- One `Attachment` belongs to one `Task`.

### 3.8 `projects`

Purpose: store project metadata, ownership, and progress.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `name` (`String`)
- `description` (`String?`)
- `status` (`ProjectStatus`, default `PLANNING`)
- `startDate` (`DateTime`)
- `endDate` (`DateTime?`)
- `budget` (`Float?`)
- `leadId` (`String`, FK)
- `progress` (`Float?`, default `0`)
- `createdAt` (`DateTime`, default `now()`)
- `updatedAt` (`DateTime`, updated automatically)

Indexes:

- `leadId`

Relationships:

- One `Project` belongs to one `User` as `lead`.
- One `Project` may have many `TeamMember` records.
- One `Project` may have many `Milestone` records.

### 3.9 `team_members`

Purpose: associate users with projects and define member roles.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `projectId` (`String`, FK)
- `memberId` (`String`, FK)
- `role` (`String?`)
- `joinedAt` (`DateTime`, default `now()`)

Constraints:

- Unique composite key on `(projectId, memberId)`.

Relationships:

- One `TeamMember` belongs to one `Project`.
- One `TeamMember` belongs to one `User`.

### 3.10 `milestones`

Purpose: store project milestone details and status.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `projectId` (`String`, FK)
- `name` (`String`)
- `description` (`String?`)
- `dueDate` (`DateTime`)
- `status` (`MilestoneStatus`, default `NOT_STARTED`)
- `completedAt` (`DateTime?`)
- `createdAt` (`DateTime`, default `now()`)
- `updatedAt` (`DateTime`, updated automatically)

Indexes:

- `projectId`

Relationships:

- One `Milestone` belongs to one `Project`.

### 3.11 `performances`

Purpose: store monthly performance metrics per user.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `userId` (`String`, FK, unique with `month` and `year`)
- `attendanceScore` (`Float`, default `0`)
- `taskScore` (`Float`, default `0`)
- `deadlineScore` (`Float`, default `0`)
- `qualityScore` (`Float`, default `0`)
- `totalScore` (`Float`, default `0`)
- `rank` (`Int?`)
- `lastUpdated` (`DateTime`, updated automatically)
- `month` (`Int`)
- `year` (`Int`)
- `createdAt` (`DateTime`, default `now()`)

Constraints:

- Unique composite index on `(userId, month, year)`.

Relationships:

- One `Performance` belongs to one `User`.

### 3.12 `chat_rooms`

Purpose: store chat room and direct/group conversation metadata.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `name` (`String?`)
- `type` (`ChatType`, default `DIRECT`)
- `createdById` (`String`, FK)
- `members` (`String[]`)
- `channelId` (`String?`, FK)
- `createdAt` (`DateTime`, default `now()`)
- `updatedAt` (`DateTime`, updated automatically)

Indexes:

- `createdById`

Relationships:

- One `ChatRoom` belongs to one `User` as `createdBy`.
- One `ChatRoom` may optionally belong to one `Channel`.
- One `ChatRoom` may have many `Message` records.

### 3.13 `channels`

Purpose: store communication channels for department-based announcements.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `name` (`String`)
- `description` (`String?`)
- `departmentId` (`String`, FK)
- `isPrivate` (`Boolean`, default `false`)
- `createdAt` (`DateTime`, default `now()`)
- `updatedAt` (`DateTime`, updated automatically)

Constraints:

- Unique composite index on `(name, departmentId)`.

Relationships:

- One `Channel` belongs to one `Department`.
- One `Channel` may have many `ChatRoom` records.
- One `Channel` may have many `Announcement` records.

### 3.14 `messages`

Purpose: store chat messages and optional attachments.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `chatRoomId` (`String`, FK)
- `senderId` (`String`, FK)
- `content` (`String`)
- `attachmentUrl` (`String?`)
- `createdAt` (`DateTime`, default `now()`)
- `updatedAt` (`DateTime`, updated automatically)

Indexes:

- `chatRoomId`
- `senderId`

Relationships:

- One `Message` belongs to one `ChatRoom`.
- One `Message` belongs to one `User` as `sender`.
- One `Message` may have many `ReadReceipt` records.

### 3.15 `read_receipts`

Purpose: record which users have read each message.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `messageId` (`String`, FK)
- `userId` (`String`, FK)
- `readAt` (`DateTime`, default `now()`)

Constraints:

- Unique composite index on `(messageId, userId)`.

Relationships:

- One `ReadReceipt` belongs to one `Message`.
- One `ReadReceipt` belongs to one `User`.

### 3.16 `announcements`

Purpose: store channel announcement content for communication pages.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `title` (`String`)
- `content` (`String`)
- `channelId` (`String`, FK)
- `priority` (`String?`)
- `expiresAt` (`DateTime?`)
- `createdAt` (`DateTime`, default `now()`)
- `updatedAt` (`DateTime`, updated automatically)

Indexes:

- `channelId`

Relationships:

- One `Announcement` belongs to one `Channel`.

### 3.17 `activity_logs`

Purpose: store user activity audit events.

Columns:

- `id` (`String`, PK, `@default(cuid())`)
- `userId` (`String`, FK)
- `action` (`String`)
- `resource` (`String?`)
- `description` (`String?`)
- `ipAddress` (`String?`)
- `userAgent` (`String?`)
- `createdAt` (`DateTime`, default `now()`)

Indexes:

- `userId`
- `createdAt`

Relationships:

- One `ActivityLog` belongs to one `User`.

## 4. Authentication and authorization

### 4.1 Auth flow

Authentication is implemented with JWT and uses the `users` table.

- `POST /api/auth/register`: creates `User` and initial `Performance` record.
- `POST /api/auth/login`: verifies email/password and returns JWT.
- `POST /api/auth/logout`: returns success without database changes.
- `POST /api/auth/refresh`: reissues tokens if a refresh token is provided.

The `protect` middleware verifies JWT and loads `req.user` from `users` by email.

### 4.2 Role-based permissions

The `authorize` middleware restricts routes by `UserRole`.

Implemented authorizations:

- `TEAM_LEAD`, `SUPER_ADMIN` can create projects.
- `HR`, `SUPER_ADMIN` can update leave status.
- `SUPER_ADMIN` can assign user roles, deactivate users, and recalculate performance metrics.

## 5. Feature-to-database mapping

### 5.1 Dashboard

Frontend: `/dashboard` page.
Backend: `/api/dashboard`, `/api/dashboard/statistics`, `/api/dashboard/leaderboard`.

Data sources:

- `tasks` for task counts and statuses.
- `attendance` for monthly attendance and presence.
- `performances` for score data.
- `projects` for project counts and memberships.
- `activity_logs` for recent actions.
- `announcements` for communication summaries.

### 5.2 Login and registration

Frontend: `/login`, `/register` pages.
Backend: `/api/auth/register`, `/api/auth/login`.

Connected data:

- `users` for account credentials and profile data.
- `performances` created automatically for new users.

### 5.3 Attendance & leaves

Frontend: `/attendance`, `/leaves` pages.
Backend: `/api/attendance/checkin`, `/api/attendance/checkout`, `/api/attendance/history`, `/api/attendance/leaves`, `/api/attendance/leaves/:id`.

Connected data:

- `attendance` for check-in/check-out records.
- `leaves` for leave request lifecycle.

### 5.4 Task management

Frontend: `/tasks` page.
Backend: `/api/tasks`, `/api/tasks/:id`, `/api/tasks/:id/status`, `/api/tasks/:taskId/subtask`, `/api/tasks/subtask/:subtaskId`.

Connected data:

- `tasks` for work item assignment and status.
- `subtasks` for child task tracking.
- `attachments` for task file metadata.

### 5.5 Project management

Frontend: `/projects` page.
Backend: `/api/projects`, `/api/projects/:id`, `/api/projects/:id/progress`, `/api/projects/:projectId/milestones`, `/api/projects/milestone/:id`.

Connected data:

- `projects` for project records.
- `team_members` for project membership.
- `milestones` for milestone tracking.

### 5.6 Communication

Frontend: `/chat` page.
Backend: `/api/chat/rooms`, `/api/chat/rooms/:roomId/messages`, `/api/chat/channels`, `/api/chat/channels/:channelId/announcements`.

Connected data:

- `channels` for channel definitions.
- `chat_rooms` for room metadata and membership.
- `messages` for posted messages.
- `announcements` for channel announcements.
- `read_receipts` for message read tracking.

### 5.7 Performance reporting

Frontend: performance routes and dashboard metrics.
Backend: `/api/performance/metrics`, `/api/performance/leaderboard`, `/api/performance/rank/:userId`, `/api/performance/recalculate`.

Connected data:

- `performances` for monthly score records.
- `tasks` and `attendance` are used to calculate metrics.

### 5.8 User administration

Frontend: `admin` page exists but is mostly placeholder UI.
Backend: `/api/users`, `/api/users/:id`, `/api/users/:id/role`, `/api/users/:id/deactivate`, `/api/users/:userId/activity-logs`.

Connected data:

- `users` for profile and role data.
- `departments` as lookup data.
- `activity_logs` for event history.

### 5.9 Reports

Backend: `/api/reports` exists, but it is a stub returning static JSON.
Frontend: no connected reports UI.

## 6. Database operations and flows

### 6.1 Authentication flow

1. User submits login or registration.
2. Backend validates input with Joi schemas.
3. On registration, `users` is created and a `performances` record is seeded.
4. On login, password is compared and `activity_logs` records the login.
5. JWT is returned and used by frontend Axios interceptors.

### 6.2 Attendance flow

1. Frontend calls `/api/attendance/checkin` or `/api/attendance/checkout`.
2. Backend uses `attendance.upsert` for daily records.
3. Check-out computes `workingHours` and updates `attendance`.
4. History requests query `attendance` records by date range.

### 6.3 Leave request flow

1. Frontend submits leave data to `/api/attendance/leaves`.
2. Backend writes `leaves` with `status = PENDING`.
3. HR or admin updates status via `/api/attendance/leaves/:id`.
4. Frontend filters leave records by status.

### 6.4 Task lifecycle

1. Frontend creates tasks via `/api/tasks`.
2. Backend saves task metadata to `tasks`.
3. Subtasks are created under `/api/tasks/:taskId/subtask`.
4. Status updates change `tasks.status` or `subtasks.status`.
5. Task details include subtasks and attachments.

### 6.5 Project lifecycle

1. Projects are created via `/api/projects`.
2. `projects` stores the lead and optional budget.
3. Team members are persisted in `team_members`.
4. Milestones are created and updated in `milestones`.
5. Progress updates are stored on `projects.progress`.

### 6.6 Performance calculation

1. Performance metrics are calculated from `attendance` and `tasks`.
2. `/api/performance/metrics` computes scores on demand.
3. `/api/performance/recalculate` refreshes current metrics in `performances`.
4. `performances` stores monthly totals for leaderboard queries.

## 7. Database constraints and indexes

### Unique constraints

- `users.email`
- `departments.name`
- `attendance` on `(userId, date)`
- `team_members` on `(projectId, memberId)`
- `performances` on `(userId, month, year)`
- `channels` on `(name, departmentId)`
- `read_receipts` on `(messageId, userId)`

### Indexes

- `tasks.assigneeId`
- `tasks.status`
- `subtasks.taskId`
- `attachments.taskId`
- `projects.leadId`
- `milestones.projectId`
- `performances.userId, month, year`
- `chat_rooms.createdById`
- `messages.chatRoomId`
- `messages.senderId`
- `activity_logs.userId`
- `activity_logs.createdAt`

## 8. File and document storage

File storage is represented by URL metadata only. The current project does not implement a file upload pipeline, and no frontend file picker is present.

## 9. Notable implementation details

- The leave request endpoint accepts both `type` and `leaveType`.
- Attendance check-in uses upsert to enforce one record per user/day.
- Performance scores are derived from `attendance` and `tasks` and stored in `performances`.
- `chat_rooms.members` is modeled as a string array of user IDs.
- Admin UI is placeholder content; backend user management exists.
- Reports route is a stub and has no connected frontend implementation.

## 10. Unconnected or placeholder features

- The `admin` page UI is not fully wired to backend management APIs.
- The `reports` route is implemented only as a placeholder response.
- File uploads are not implemented despite attachment metadata in the schema.
- The `chat` page uses announcements and channels rather than a full direct messaging workflow.

## 11. Summary

This document reflects the current implementation in the repository. The visible frontend features and the backend Prisma schema are aligned around users, attendance, leaves, tasks, projects, performance, and communication.

Only the admin dashboard and reports endpoint remain placeholder elements that are not yet fully wired to the database.
