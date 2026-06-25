# Architecture Overview

This project is split into two main parts: the frontend and the backend.

## Frontend

The frontend is built with React and is organized around pages, reusable components, and shared services.

- Pages live in `client/src/pages/` and represent the main screens such as Dashboard, Tasks, Attendance, Chat, and Admin.
- Reusable UI pieces live in `client/src/components/`.
- API calls are centralized in `client/src/services/api.js`.
- Global state is handled through `client/src/context` using Zustand.

The app keeps the UI consistent and lets pages request the same API client and auth state.

## Backend

The backend uses Express and Prisma to expose a REST API.

- Routes are defined in `server/src/routes/`.
- Each route forwards requests to controller functions in `server/src/controllers/`.
- Controllers use Prisma to read and write the database.
- Middleware handles authentication, authorization, and errors.

This keeps the server simple and easy to maintain.

## How data flows

1. Browser sends a request from the React app.
2. The frontend calls the API through `client/src/services/api.js`.
3. Express routes match the request in `server/src/routes/`.
4. Controllers run business logic and query Prisma.
5. The server sends JSON back to the frontend.

## Coding patterns

### API service

The frontend uses one Axios instance so every page can call the backend the same way.

### Route and controller split

Routes only declare endpoints. Controllers contain the request logic.

### Role checks

Protected routes and admin pages only load when the logged-in user has the right role.

## Why this structure works

This layout makes it easy to add new pages, extend the backend, and keep the frontend and backend separate.
