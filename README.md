# Workforce CRM

This repository contains a complete HRMS and employee performance system with both frontend and backend ready to run.

The application helps teams track attendance, assign tasks, manage projects, and measure performance using role-based access control.

## What is included

- `client/` — React frontend with protected pages, role-aware navigation, chat, attendance, tasks, and performance dashboards.
- `server/` — Express backend with JWT authentication, Prisma ORM, PostgreSQL support, and a clean REST API.
- `docs/` — Documentation for architecture, deployment, and schema.
- `prisma/` — Database schema and seed files.

## Main features

- Secure login and role-based access for Super Admin, HR, Team Lead, Employee, and Intern.
- Attendance tracking with check-in, check-out, and leave requests.
- Task and project management with status updates and progress tracking.
- Performance reporting with leaderboards and metric summaries.
- Chat support for communication across teams.

## Technology used

- Frontend: React, Vite, Tailwind CSS, Zustand, Axios
- Backend: Node.js, Express, Prisma, PostgreSQL, JWT
- Realtime: Socket.IO for chat and status updates

## Run locally

1. Open a terminal and go to the project folder.
2. Set up the backend in `server/`.
3. Set up the frontend in `client/`.
4. Start both servers and open the app at `http://localhost:5173`.

## Quick links

- Frontend live preview: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- API docs: `http://localhost:5000/api/docs`

## Demo login credentials

- Email: `admin@workforce.com`
- Password: `Password123!`

Alternative accounts are available for HR, Team Lead, Employee, and Intern roles.
