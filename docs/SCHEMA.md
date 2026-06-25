# 📋 Database Schema Documentation

## Overview

The Workforce CRM uses PostgreSQL with Prisma ORM. This document describes the complete database schema.

## Entity Relationship Diagram

```
┌─────────────────┐
│     Users       │──┐
├─────────────────┤  │
│ id (PK)         │  │
│ email (UNIQUE)  │  │
│ password        │  │
│ firstName       │  │
│ lastName        │  │
│ role (ENUM)     │  │
│ departmentId(FK)─┼──→ Departments
│ profileImage    │  │
│ isActive        │  │
│ createdAt       │  │
│ updatedAt       │  │
└─────────────────┘  │
      │              │
      ├─────────────────→ Attendance
      ├─────────────────→ Tasks ──→ Subtasks
      ├─────────────────→ Projects → TeamMembers
      ├─────────────────→ Performance
      ├─────────────────→ Leaves
      ├─────────────────→ ChatRooms → Messages
      └─────────────────→ ActivityLogs
```

## Tables

### 1. Users
Stores user account information and authentication details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| email | String | UNIQUE | User email |
| password | String | - | Hashed password |
| firstName | String | - | First name |
| lastName | String | - | Last name |
| phone | String | OPTIONAL | Phone number |
| role | UserRole | ENUM | Super Admin, HR, Team Lead, Employee, Intern |
| departmentId | String | FK(Departments) | Department assignment |
| profileImage | String | OPTIONAL | Profile photo URL |
| isActive | Boolean | DEFAULT true | Account status |
| createdAt | DateTime | AUTO | Creation timestamp |
| updatedAt | DateTime | AUTO | Update timestamp |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: email

**Relationships:**
- → Departments (many-to-one)
- ← Attendance (one-to-many)
- ← Tasks (one-to-many)
- ← Projects (one-to-many)
- ← Performance (one-to-one)
- ← Leaves (one-to-many)

---

### 2. Departments
Organization structure.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| name | String | UNIQUE | Department name |
| description | String | OPTIONAL | Description |
| head | String | OPTIONAL | Department head name |
| createdAt | DateTime | AUTO | Creation timestamp |
| updatedAt | DateTime | AUTO | Update timestamp |

**Relationships:**
- ← Users (one-to-many)
- ← Channels (one-to-many)

---

### 3. Attendance
Daily attendance records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| userId | String | FK(Users) | Employee reference |
| date | DateTime | - | Attendance date |
| checkInTime | DateTime | OPTIONAL | Check-in timestamp |
| checkOutTime | DateTime | OPTIONAL | Check-out timestamp |
| status | AttendanceStatus | ENUM | Present, Absent, Leave, WFH, Late |
| workingHours | Float | OPTIONAL | Hours worked |
| notes | String | OPTIONAL | Additional notes |
| createdAt | DateTime | AUTO | Creation timestamp |
| updatedAt | DateTime | AUTO | Update timestamp |

**Constraints:**
- UNIQUE(userId, date) - One record per user per day

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: userId
- INDEX: date

---

### 4. Leaves
Leave request management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| userId | String | FK(Users) | Requester reference |
| leaveType | LeaveType | ENUM | Sick, Casual, Earned, etc. |
| startDate | DateTime | - | Leave start date |
| endDate | DateTime | - | Leave end date |
| reason | String | - | Leave reason |
| status | LeaveStatus | ENUM | Pending, Approved, Rejected |
| approvedBy | String | OPTIONAL | Approver ID |
| approvalDate | DateTime | OPTIONAL | Approval date |
| rejectReason | String | OPTIONAL | Rejection reason |
| createdAt | DateTime | AUTO | Creation timestamp |
| updatedAt | DateTime | AUTO | Update timestamp |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: userId

---

### 5. Tasks
Task management and tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| title | String | - | Task title |
| description | String | OPTIONAL | Description |
| assigneeId | String | FK(Users) | Assigned to |
| createdBy | String | - | Creator ID |
| status | TaskStatus | ENUM | Pending, In Progress, Under Review, Completed, Rejected |
| priority | TaskPriority | ENUM | Low, Medium, High, Urgent |
| dueDate | DateTime | OPTIONAL | Due date |
| completedAt | DateTime | OPTIONAL | Completion date |
| estimatedHours | Float | OPTIONAL | Estimated effort |
| actualHours | Float | OPTIONAL | Actual effort |
| qualityRating | Int | OPTIONAL | 1-5 rating |
| projectId | String | OPTIONAL | Associated project |
| createdAt | DateTime | AUTO | Creation timestamp |
| updatedAt | DateTime | AUTO | Update timestamp |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: assigneeId
- INDEX: status
- INDEX: projectId

**Relationships:**
- → Users (many-to-one)
- ← Subtasks (one-to-many)
- ← Attachments (one-to-many)

---

### 6. Subtasks
Task decomposition.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| taskId | String | FK(Tasks) | Parent task |
| title | String | - | Subtask title |
| assigneeId | String | OPTIONAL | Assigned to |
| status | TaskStatus | ENUM | Same as tasks |
| dueDate | DateTime | OPTIONAL | Due date |
| completedAt | DateTime | OPTIONAL | Completion date |
| createdAt | DateTime | AUTO | Creation timestamp |
| updatedAt | DateTime | AUTO | Update timestamp |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: taskId

---

### 7. Attachments
Task file attachments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| taskId | String | FK(Tasks) | Task reference |
| fileName | String | - | File name |
| fileUrl | String | - | File location URL |
| fileSize | Int | OPTIONAL | Size in bytes |
| fileType | String | OPTIONAL | MIME type |
| uploadedAt | DateTime | AUTO | Upload timestamp |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: taskId

---

### 8. Projects
Project management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| name | String | - | Project name |
| description | String | OPTIONAL | Description |
| status | ProjectStatus | ENUM | Planning, In Progress, On Hold, Completed, Cancelled |
| startDate | DateTime | - | Start date |
| endDate | DateTime | OPTIONAL | End date |
| budget | Float | OPTIONAL | Budget amount |
| leadId | String | FK(Users) | Project lead |
| progress | Float | OPTIONAL | 0-100 completion % |
| createdAt | DateTime | AUTO | Creation timestamp |
| updatedAt | DateTime | AUTO | Update timestamp |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: leadId

**Relationships:**
- ← TeamMembers (one-to-many)
- ← Milestones (one-to-many)

---

### 9. TeamMembers
Project team assignments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| projectId | String | FK(Projects) | Project reference |
| memberId | String | FK(Users) | Team member |
| role | String | OPTIONAL | Developer, Designer, etc. |
| joinedAt | DateTime | AUTO | Join date |

**Constraints:**
- UNIQUE(projectId, memberId)

---

### 10. Milestones
Project milestones.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| projectId | String | FK(Projects) | Project reference |
| name | String | - | Milestone name |
| description | String | OPTIONAL | Description |
| dueDate | DateTime | - | Due date |
| status | MilestoneStatus | ENUM | Not Started, In Progress, Completed, Delayed |
| completedAt | DateTime | OPTIONAL | Completion date |
| createdAt | DateTime | AUTO | Creation timestamp |
| updatedAt | DateTime | AUTO | Update timestamp |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: projectId

---

### 11. Performance
Monthly performance metrics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| userId | String | FK(Users) | User reference |
| attendanceScore | Float | - | 0-30 points |
| taskScore | Float | - | 0-40 points |
| deadlineScore | Float | - | 0-20 points |
| qualityScore | Float | - | 0-10 points |
| totalScore | Float | - | 0-100 total |
| rank | Int | OPTIONAL | Rank in company |
| month | Int | - | Month (1-12) |
| year | Int | - | Year |
| lastUpdated | DateTime | AUTO | Update timestamp |
| createdAt | DateTime | AUTO | Creation timestamp |

**Constraints:**
- UNIQUE(userId, month, year)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: userId

---

### 12. ChatRooms
Chat channels and direct messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| name | String | OPTIONAL | Room name |
| type | ChatType | ENUM | Direct, Channel, Group |
| createdById | String | FK(Users) | Creator reference |
| members | String[] | JSON | Array of member IDs |
| channelId | String | OPTIONAL | Associated channel |
| createdAt | DateTime | AUTO | Creation timestamp |
| updatedAt | DateTime | AUTO | Update timestamp |

**Relationships:**
- ← Messages (one-to-many)

---

### 13. Channels
Department communication channels.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| name | String | - | Channel name |
| description | String | OPTIONAL | Description |
| departmentId | String | FK(Departments) | Department |
| isPrivate | Boolean | DEFAULT false | Privacy setting |
| createdAt | DateTime | AUTO | Creation timestamp |
| updatedAt | DateTime | AUTO | Update timestamp |

**Constraints:**
- UNIQUE(name, departmentId)

**Relationships:**
- ← ChatRooms (one-to-many)
- ← Announcements (one-to-many)

---

### 14. Messages
Chat messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| chatRoomId | String | FK(ChatRooms) | Room reference |
| senderId | String | FK(Users) | Sender reference |
| content | String | - | Message text |
| attachmentUrl | String | OPTIONAL | File attachment |
| createdAt | DateTime | AUTO | Creation timestamp |
| updatedAt | DateTime | AUTO | Update timestamp |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: chatRoomId
- FOREIGN KEY: senderId

**Relationships:**
- ← ReadReceipts (one-to-many)

---

### 15. ReadReceipts
Message read tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| messageId | String | FK(Messages) | Message reference |
| userId | String | FK(Users) | Reader reference |
| readAt | DateTime | AUTO | Read timestamp |

**Constraints:**
- UNIQUE(messageId, userId)

---

### 16. Announcements
System-wide announcements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| title | String | - | Announcement title |
| content | String | - | Content text |
| channelId | String | FK(Channels) | Channel reference |
| priority | String | OPTIONAL | High, Medium, Low |
| expiresAt | DateTime | OPTIONAL | Expiration date |
| createdAt | DateTime | AUTO | Creation timestamp |
| updatedAt | DateTime | AUTO | Update timestamp |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: channelId

---

### 17. ActivityLogs
User action audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| userId | String | FK(Users) | User reference |
| action | String | - | Action type |
| resource | String | OPTIONAL | Resource ID |
| description | String | OPTIONAL | Details |
| ipAddress | String | OPTIONAL | IP address |
| userAgent | String | OPTIONAL | Browser info |
| createdAt | DateTime | AUTO | Creation timestamp |

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: userId
- INDEX: createdAt

---

## Enums

### UserRole
```
SUPER_ADMIN
HR
TEAM_LEAD
EMPLOYEE
INTERN
```

### AttendanceStatus
```
PRESENT
ABSENT
LEAVE
WORK_FROM_HOME
LATE
```

### TaskStatus
```
PENDING
IN_PROGRESS
UNDER_REVIEW
COMPLETED
REJECTED
```

### TaskPriority
```
LOW
MEDIUM
HIGH
URGENT
```

### LeaveType
```
SICK_LEAVE
CASUAL_LEAVE
EARNED_LEAVE
MATERNITY_LEAVE
SPECIAL_LEAVE
```

### LeaveStatus
```
PENDING
APPROVED
REJECTED
CANCELLED
```

### ProjectStatus
```
PLANNING
IN_PROGRESS
ON_HOLD
COMPLETED
CANCELLED
```

### MilestoneStatus
```
NOT_STARTED
IN_PROGRESS
COMPLETED
DELAYED
```

### ChatType
```
DIRECT
CHANNEL
GROUP
```

---

## Constraints & Indexes

### Unique Constraints
- Users: email
- Attendance: (userId, date)
- Departments: name
- Channels: (name, departmentId)
- Performance: (userId, month, year)
- TeamMembers: (projectId, memberId)
- ReadReceipts: (messageId, userId)

### Foreign Keys (with CASCADE delete)
- Attendance.userId → Users.id
- Leaves.userId → Users.id
- Tasks.assigneeId → Users.id
- Projects.leadId → Users.id
- ChatRooms.createdById → Users.id
- Messages.senderId → Users.id
- And more...

### Indexes
- Users: email, departmentId
- Tasks: assigneeId, status, projectId
- Attendance: userId, date
- ActivityLogs: userId, createdAt
- Performance: totalScore (for leaderboard)
- Channels: departmentId

---

## Capacity Planning

| Table | Est. Rows (1 year) | Size |
|-------|-------------------|------|
| Users | 500 | 2MB |
| Attendance | 150,000 | 15MB |
| Tasks | 50,000 | 25MB |
| Messages | 1,000,000 | 200MB |
| ActivityLogs | 5,000,000 | 300MB |
| **Total** | | **~550MB** |

---

For migration, Prisma, or ORM queries, see the code repository.
