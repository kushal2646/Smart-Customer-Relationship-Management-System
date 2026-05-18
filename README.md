# Smart CRM – Customer Relationship Management System

A full-stack enterprise CRM built with the **MERN stack** (MongoDB, Express.js, React, Node.js). Manage customers, sales leads, tasks, and employees through a modern SaaS-style dashboard.

![Stack](https://img.shields.io/badge/React-18-blue) ![Stack](https://img.shields.io/badge/Node.js-Express-green) ![Stack](https://img.shields.io/badge/MongoDB-Atlas-green)

## Features

### Authentication & Authorization
- JWT-based authentication with bcrypt password hashing
- Role-based access control: **Admin**, **Sales Manager**, **Employee**
- Protected routes and secure API middleware

### Core Modules
| Module | Features |
|--------|----------|
| **Customers** | Full CRUD, status tracking, employee assignment |
| **Leads** | Pipeline stages (New → Closed), deal value tracking |
| **Tasks** | Follow-ups with deadlines, priorities, assignments |
| **Employees** | User management (Admin only) |
| **Dashboard** | Analytics cards, revenue charts, activity feed |

### Advanced
- Search, filter & pagination on all list views
- Activity logging for audit trail
- Dark / light mode toggle
- Toast notifications & loading states
- Cloudinary-ready avatar upload
- Rate limiting, Helmet security headers
- Responsive mobile design

## Project Structure

```
SmartCRM/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Route pages
│       ├── layouts/        # Dashboard layout
│       ├── routes/         # Protected routes
│       ├── services/       # API service layer
│       ├── context/        # Auth & Theme context
│       └── utils/          # Helpers
└── server/                 # Express API
    ├── controllers/        # Route handlers (MVC)
    ├── models/             # Mongoose schemas
    ├── routes/             # API routes
    ├── middleware/         # Auth, roles, validation
    └── config/             # DB & Cloudinary config
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
# Backend
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install

# Frontend
cd ../client
cp .env.example .env
npm install
```

### 2. Configure Environment

**server/.env**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/smartcrm
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Database (Demo Data)

```bash
cd server
npm run seed
```

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Open **http://localhost:5173**

### Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartcrm.com | admin123 |
| Sales Manager | manager@smartcrm.com | manager123 |
| Employee | employee@smartcrm.com | employee123 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| GET/POST | `/api/customers` | Customer CRUD |
| GET/POST | `/api/leads` | Lead CRUD |
| GET/POST | `/api/tasks` | Task CRUD |
| GET/POST | `/api/users` | Employee management |
| GET | `/api/dashboard/stats` | Dashboard analytics |

All protected routes require `Authorization: Bearer <token>` header.

## Deployment

### Frontend → Vercel
1. Push `client/` to GitHub
2. Import project in Vercel
3. Set environment variable: `VITE_API_URL=https://your-api.onrender.com/api`
4. Deploy

### Backend → Render
1. Push `server/` to GitHub
2. Create Web Service on Render
3. Set environment variables from `.env.example`
4. Build: `npm install` | Start: `npm start`

### Database → MongoDB Atlas
1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Add connection string to `MONGODB_URI`
3. Whitelist IP `0.0.0.0/0` for cloud deployment

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, Recharts, React Hot Toast, Lucide Icons

**Backend:** Node.js, Express.js, Mongoose, JWT, bcryptjs, express-validator, Helmet, Morgan

**Database:** MongoDB Atlas

## License

MIT License – free for personal and commercial use.
