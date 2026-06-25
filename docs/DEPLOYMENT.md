# Deployment Guide

This guide explains how to take the app from your machine into a hosted environment.

## What needs to be deployed

- Frontend: `client/` built as a static Vite app.
- Backend: `server/` running Node and Express.
- Database: PostgreSQL for production data.

## Backend deployment

1. Make sure the backend works locally.
2. Create a production `.env` file with:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-secret"
JWT_EXPIRE="30d"
PORT=5000
NODE_ENV=production
FRONTEND_URL="https://your-frontend-url"
```

3. Host the backend on Railway, Render, or a similar provider.
4. Configure the build command as:

```bash
cd server && npm install && npx prisma generate
```

5. Use this start command:

```bash
cd server && npm start
```

## Database deployment

Use PostgreSQL on Railway or another hosted database. Copy the connection string into `DATABASE_URL`.

After deployment, run migrations and seed data from the backend environment:

```bash
npx prisma migrate deploy
npx prisma db seed
```

## Frontend deployment

1. In `client/`, create `./env.production` with the backend URL:

```env
VITE_API_URL=https://your-backend-domain.com
```

2. Build the frontend:

```bash
cd client
npm run build
```

3. Deploy `client/` to Vercel or Netlify.

### Vercel settings

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL`

## Verify deployment

- Visit the frontend URL.
- Log in with the demo credentials.
- Confirm the app loads data from the backend.

## Live demo link

Once both frontend and backend are deployed, the live demo should be accessible from your hosted frontend URL.
