# 🚀 Deployment Guide - Workforce CRM

Complete guide to deploy Workforce CRM to production.

## Deployment Overview

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │ ──────→ │   Backend    │ ──────→ │  Database    │
│  (Vercel)    │         │  (Render)    │         │  (Railway)   │
└──────────────┘         └──────────────┘         └──────────────┘
```

## Option 1: Deploy Backend (Render)

### Step 1: Prepare Backend

```bash
cd server

# Ensure .env has all required variables
# Create .env.production
cp .env .env.production

# Update .env.production for production
```

**Production .env.example:**
```env
DATABASE_URL="postgresql://user:pass@db-host:5432/workforce_crm"
JWT_SECRET="production-secret-key-256-chars"
JWT_EXPIRE="30d"
PORT=5000
NODE_ENV="production"
FRONTEND_URL="https://yourdomain.com"
```

### Step 2: Push to GitHub

```bash
# Initialize git repo (if not done)
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub
# Then push
git remote add origin https://github.com/yourusername/workforce-crm.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Render

1. **Go to https://render.com**
2. **Sign up/Login**
3. **Click "New +" → "Web Service"**
4. **Connect GitHub repository**
5. **Configure:**
   - Name: `workforce-crm-api`
   - Environment: `Node`
   - Build Command: `cd server && npm install && npx prisma generate`
   - Start Command: `cd server && npm start`
   - Runtime: `node-18`

6. **Add Environment Variables:**
   - Click "Environment"
   - Add all variables from `.env.production`

7. **Deploy Database (PostgreSQL on Railway)**

### Step 4: Setup PostgreSQL on Railway

1. **Go to https://railway.app**
2. **Click "New Project"**
3. **Add Service → PostgreSQL**
4. **Get connection string:**
   - In Railway dashboard
   - Copy "Database URL"
   - Paste in Render env as `DATABASE_URL`

5. **Run Migrations:**
   ```bash
   # Use Railway CLI or backend connection
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Step 5: Verify Backend Deployment

```bash
# Test API
curl https://your-app.onrender.com/api/health

# Should return: {"status":"OK","timestamp":"..."}
```

## Option 2: Deploy Backend (Railway)

### Step 1: Create Railway Project

1. **Go to https://railway.app**
2. **Click "New Project"**
3. **Select "Deploy from GitHub"**
4. **Select your repository**
5. **Select `server` directory**

### Step 2: Configure Environment

1. **Add PostgreSQL Service**
2. **Set Environment Variables:**
   ```
   DATABASE_URL -> from PostgreSQL service
   JWT_SECRET -> your secret key
   NODE_ENV -> production
   FRONTEND_URL -> your frontend URL
   ```

3. **Deploy**

## Option 3: Deploy Frontend (Vercel)

### Step 1: Prepare Frontend

```bash
cd client

# Update .env.production
echo 'VITE_API_URL=https://your-backend-domain.com' > .env.production

# Build
npm run build

# Test build
npm run preview
```

### Step 2: Deploy to Vercel

1. **Go to https://vercel.com**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Select repository**
5. **Configure:**
   - Framework: `Vite`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. **Set Environment Variables:**
   - `VITE_API_URL`: `https://your-backend-domain.com`

7. **Deploy**

### Step 3: Verify Frontend

- Visit your Vercel domain
- Login with demo credentials
- Test all features

## Option 4: Deploy Frontend (Netlify)

### Step 1: Deploy

1. **Go to https://netlify.com**
2. **Connect GitHub**
3. **Select repository**
4. **Configure:**
   - Base Directory: `client`
   - Build Command: `npm run build`
   - Publish Directory: `dist`

5. **Add Environment Variables**
   - `VITE_API_URL`: backend URL

6. **Deploy**

## Option 5: Deploy Everywhere (Docker)

### Create Dockerfile for Backend

```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install

COPY src ./src

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]
```

### Create Dockerfile for Frontend

```dockerfile
# client/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Deploy with Docker

```bash
# Build images
docker build -t workforce-backend ./server
docker build -t workforce-frontend ./client

# Run containers
docker run -d -p 5000:5000 workforce-backend
docker run -d -p 80:80 workforce-frontend
```

## Custom Domain Setup

### For Render/Railway/Vercel

1. **Buy domain** (GoDaddy, Namecheap, etc.)
2. **Go to provider settings**
3. **Add Custom Domain:**
   - In Render/Vercel: Settings → Custom Domains
   - Add your domain name
   - Follow DNS setup instructions

4. **Update DNS Records:**
   ```
   Type: CNAME
   Name: @
   Value: your-app.onrender.com
   ```

5. **SSL Certificate** (automatic)

### Enable HTTPS

- Most platforms auto-enable SSL
- Update `FRONTEND_URL` to use https://

## Production Checklist

- [ ] Backend API deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database migrated and seeded
- [ ] Environment variables configured
- [ ] SSL/HTTPS enabled
- [ ] CORS configured for domain
- [ ] JWT secret changed from default
- [ ] Database backups configured
- [ ] Error logging setup (Sentry/LogRocket)
- [ ] Performance monitoring enabled
- [ ] Email notifications configured
- [ ] Cloudinary integrated (optional)

## Performance Optimization

### Backend

```env
# Enable compression
COMPRESSION_ENABLED=true

# Setup caching
CACHE_ENABLED=true

# Rate limiting
RATE_LIMIT=100/15min
```

### Frontend

```bash
# Optimize builds
npm run build

# Size analysis
npm run build -- --analyze

# Enable gzip
# Configure in Vercel/Netlify settings
```

## Database Backups

### Railway

1. Go to PostgreSQL service
2. Settings → Backups
3. Enable automatic backups
4. Set retention: 7-30 days

### Render

1. Dashboard → PostgreSQL
2. Backup settings
3. Configure frequency

## Monitoring & Logging

### Error Tracking (Sentry)

1. **Sign up**: https://sentry.io
2. **Create Project**:
   - Platform: Node.js
   - Framework: Express

3. **Install Sentry:**
   ```bash
   npm install @sentry/node
   ```

4. **Configure Backend** (`src/index.js`):
   ```js
   import * as Sentry from "@sentry/node";
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

### Performance Monitoring (LogRocket)

1. **Sign up**: https://logrocket.com
2. **Create App**
3. **Install Frontend SDK**:
   ```bash
   npm install logrocket
   ```

## Scaling Tips

1. **Database**: Use connection pooling (PgBouncer)
2. **Cache**: Add Redis for sessions
3. **CDN**: Use Cloudflare for static assets
4. **API**: Setup load balancing for multiple instances
5. **Storage**: Use S3 for file storage instead of local

## Troubleshooting Deployment

### Build Fails
```bash
# Check logs
npm run build

# Clear cache
rm -rf node_modules
npm install
```

### Database Connection Error
```bash
# Verify credentials
psql -U user -d database -h host

# Check URL format
postgresql://user:pass@host:5432/dbname
```

### CORS Errors
```env
# Update FRONTEND_URL in backend
FRONTEND_URL=https://yourdomain.com
```

### API Not Responding
- Check backend service status
- Verify environment variables
- Check logs in deployment platform
- Test with `curl https://your-api-domain/api/health`

## Cost Estimation

| Service | Tier | Cost |
|---------|------|------|
| Render Web | Starter | $7/mo |
| Railway PostgreSQL | Starter | $5/mo |
| Vercel Frontend | Hobby | Free |
| Domain | Annual | $10-15 |
| **Total** | | ~$22-27/month |

## Post-Deployment

1. **Test all features** in production
2. **Monitor logs** for errors
3. **Set up alerts** for crashes
4. **Plan scaling** if needed
5. **Update documentation** with URLs
6. **Configure email** (SendGrid/Mailgun)
7. **Setup analytics** (Google Analytics)

## Production URLs

```
Frontend: https://workforce-crm.yourdomain.com
Backend API: https://api.yourdomain.com
API Docs: https://api.yourdomain.com/api/docs
```

## Maintenance

### Regular Tasks

- [ ] Monitor disk space
- [ ] Review error logs
- [ ] Update dependencies monthly
- [ ] Test database backups
- [ ] Check performance metrics
- [ ] Update SSL certificates

### Emergency Procedures

1. **Database Down**: Restore from backup
2. **API Down**: Restart service
3. **Frontend Down**: Redeploy from Git
4. **Breach**: Rotate secrets immediately

---

**Deployed! 🎉 Your application is now live.**

For support: Check logs, review API docs, or contact hosting provider.
