# ⚡ Quick Start - Run Everything in 5 Minutes

**TL;DR: Complete commands to get the app running immediately.**

---

## Prerequisites Check

```bash
# Verify installations
node -v        # Should be v16+
npm -v         # Should be v8+
psql --version # Should be 12+
git --version  # Should be installed
```

If not installed, go to SETUP.md.

---

## 1️⃣ Start PostgreSQL

### Windows
```bash
# Open Services and find PostgreSQL → Right-click → Start
# OR in Command Prompt (admin)
net start postgresql
```

### Mac/Linux
```bash
# Mac with Homebrew
brew services start postgresql

# Linux with systemctl
sudo systemctl start postgresql
```

**Verify:**
```bash
psql -U postgres -h localhost
# Type password if prompted
\q  # Exit
```

If `psql` isn't on your PATH on Windows, use the full binary path (example):

```powershell
$env:PGPASSWORD='your_postgres_password'; \\
& 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -h localhost
```

---

## 2️⃣ Create Database (First Time Only)

```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# Run these commands in psql:
CREATE DATABASE workforce_crm;
CREATE USER workforce_user WITH PASSWORD 'secure_password_123';
GRANT ALL PRIVILEGES ON DATABASE workforce_crm TO workforce_user;
\q

# Done!
```

**Next time:** Database already exists, skip this step.

---

## 3️⃣ Setup Backend (One Time)

```bash
# Navigate to server
cd /path/to/defenceminia/server

# Install dependencies (first time)
npm install

# Setup environment
cp .env.example .env

# Edit .env file - update database URL if needed:
# DATABASE_URL="postgresql://workforce_user:secure_password_123@localhost:5432/workforce_crm"

# Setup database
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# You should see: ✅ Database seeded successfully!
```

Alternative: from the repo root you can run backend commands without changing directories using `npm --prefix`:

```powershell
npm --prefix "./server" run dev
```

---

## 4️⃣ Start Backend

```bash
# From server directory
npm run dev

# Or from the repository root (alternative)
npm --prefix "./server" run dev

# Output should show:
# 🚀 Server running on port 5000
# 📖 API docs available at http://localhost:5000/api/docs
```

**✅ Keep this terminal open!**

---

## 5️⃣ Setup Frontend (Another Terminal)

```bash
# Open NEW terminal window/tab

# Navigate to client
cd /path/to/defenceminia/client

# Install dependencies (first time)
npm install

# No need to edit .env - defaults to localhost:5000

# Start dev server
# Start dev server
npm run dev

# Or from the repository root (alternative)
npm --prefix "./client" run dev

# Output should show:
#  ➜  Local: http://localhost:5173/
```

**✅ Keep this terminal open too!**

---

## 6️⃣ Access Application

### Open Browser

1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:5000/api
3. **API Docs**: http://localhost:5000/api/docs

### Login

```
Email: admin@workforce.com
Password: Password123!
```

✅ **YOU'RE IN!**

---

## 🎯 Quick Commands Reference

### Backend

```bash
# Development server (auto-reload)
npm run dev

# Production build
npm run build

# View database in UI
npx prisma studio

# Reseed database
npx prisma db seed

# Reset everything (careful!)
npx prisma migrate reset
```

### Frontend

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## 🧪 Test Features

### 1. Check In/Out
- Go to "Attendance" page
- Click "Check In"
- Click "Check Out"

### 2. Create Task
- Go to "Tasks" page
- Click "+ Create Task"
- Fill in details and save

### 3. View Performance
- Go to "Performance" page
- See your score breakdown
- Check leaderboard

### 4. Chat
- Go to "Chat" page
- Send a message
- See real-time updates

### 5. Admin Panel
- Go to "Admin" page (Super Admin only)
- Manage users and departments

---

## 📊 Database Test

```bash
# Connect to database
psql -U workforce_user -d workforce_crm -h localhost

# Check tables
\dt

# See users
SELECT id, email, "firstName", "lastName", role FROM "User";

# See tasks count
SELECT COUNT(*) FROM "Task";

# Exit
\q
```

---

## 🔧 Troubleshooting

### Port Already in Use

**Backend (5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Frontend (5173):**
```bash
# Vite will use next available port automatically
# Or change port in vite.config.js
```

### Database Connection Error

```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
psql -U workforce_user -d workforce_crm -h localhost
```

### Modules Not Found

```bash
# Backend
cd server
rm -rf node_modules package-lock.json
npm install

# Frontend
cd client
rm -rf node_modules package-lock.json
npm install
```

### Prisma Errors

```bash
npx prisma generate
npx prisma validate
npx prisma migrate status
```

---

## 📝 Demo Accounts

```
Super Admin (Full Access):
Email: admin@workforce.com
Password: Password123!

HR Manager:
Email: hr@workforce.com
Password: Password123!

Team Lead:
Email: lead@workforce.com
Password: Password123!

Employee:
Email: emp1@workforce.com
Password: Password123!

Intern:
Email: intern@workforce.com
Password: Password123!
```

---

## ✨ What's Pre-Loaded

✅ 4 Departments
✅ 8 Users with different roles
✅ 30 days of attendance records
✅ 3 tasks with different statuses
✅ 1 project with 4 team members
✅ 2 milestones
✅ 2 chat channels with messages
✅ 1 announcement

**Test everything immediately!**

---

## 🚀 Next Steps

### Develop More
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/your-feature
```

### Deploy (Optional)
See DEPLOYMENT.md for production setup

### Share with Recruiters
See SUBMISSION.md for GitHub submission guide

---

## 📚 Documentation

- **README.md** - Project overview
- **SETUP.md** - Detailed installation
- **DEPLOYMENT.md** - Production deployment
- **SCHEMA.md** - Database design
- **SUBMISSION.md** - GitHub submission
- **ARCHITECTURE.md** - Code patterns

---

## 💡 Pro Tips

1. **Multiple Tabs**: Keep backend and frontend in separate terminal tabs
2. **Real-time Sync**: Changes auto-reload in dev mode
3. **API Testing**: Use Swagger at http://localhost:5000/api/docs
4. **Database Queries**: Use `npx prisma studio` for GUI
5. **Hot Reload**: Vite frontend reloads automatically on save
6. **Email Alerts**: Will work once configured (optional)

---

## ✅ Success Checklist

- [ ] PostgreSQL running
- [ ] Database created
- [ ] Backend started (`npm run dev`)
- [ ] Frontend started (`npm run dev`)
- [ ] Can access http://localhost:5173
- [ ] Can login with demo account
- [ ] Can see dashboard
- [ ] Can perform basic actions

---

**🎉 Congratulations! You're ready to go!**

Explore the features, test everything, and most importantly - enjoy the app!

Any issues? Check the troubleshooting section above or refer to detailed docs.

Happy coding! 🚀
