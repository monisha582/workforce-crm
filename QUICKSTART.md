# Quick Start

Use these steps to get the app running on your machine as quickly as possible.

## 1. Prepare your system

Make sure you have:

- Node.js 16 or later
- npm
- PostgreSQL 12 or later

## 2. Start the database

On Windows, use Services or run:

```powershell
net start postgresql
```

On macOS/Linux, use your package manager or systemctl.

## 3. Set up the backend

```powershell
cd .\server
npm install
Copy-Item .\env.example .\env
# edit .env and set DATABASE_URL
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

The backend should run on `http://localhost:5000`.

## 4. Set up the frontend

Open a second terminal and run:

```powershell
cd .\client
npm install
Copy-Item .\env.example .\env
npm run dev
```

The frontend should run on `http://localhost:5173`.

## 5. Open the app

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- API docs: `http://localhost:5000/api/docs`

## 6. Test the main features

- Log in with the demo account.
- Check in and check out on Attendance.
- Create a task and update its status.
- Open Chat and send a message.
- Review the dashboard and performance pages.
