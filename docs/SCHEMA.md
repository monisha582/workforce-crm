# Database Schema

This document describes the main tables used by the HRMS system and how they connect.

## Main entities

### Users
Users store login credentials, names, role, and department.
Every user belongs to a department and can be assigned tasks, attendance records, leaves, and project roles.

### Departments
Departments are used to group users and map the company structure.
A department can have many users.

### Attendance
Attendance records keep track of daily check-in and check-out times.
They also include status and working hours for each day.

### Leaves
Leave requests include the type of leave, date range, reason, and approval status.
They are linked to the user who requested them.

### Tasks
Tasks represent work items assigned to users.
They track status, priority, due dates, estimated hours, and quality ratings.

### Subtasks
Subtasks break larger tasks into smaller pieces.
Each subtask is linked to a parent task.

### Projects
Projects contain project metadata and progress.
They also include the lead, timeline, and related team members.

## How tables relate

- A `User` can have many `Attendance` records.
- A `User` can have many `Task` records.
- A `Task` can have many `Subtask` records.
- A `Project` can have many `TeamMember` assignments.
- A `User` can be the lead of a `Project`.

## Common fields

Most tables include:

- `id` — unique identifier
- `createdAt` — when the row was created
- `updatedAt` — when the row was last changed

## Example relationship map

```
Users → Attendance
Users → Tasks → Subtasks
Users → Leaves
Projects → TeamMembers
Projects → Milestones
```

## Why this schema works

This structure keeps user records separate from attendance and task data while still making it easy to query reports and dashboards.
