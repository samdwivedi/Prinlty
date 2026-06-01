# Printly — Secure Print Management Platform

A production-ready SaaS platform for managing print jobs at colleges, libraries, and print centers.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- npm

### Development Setup

```bash
# 1. Clone and install
cd printly
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Start databases (PostgreSQL + Redis)
docker compose up postgres redis -d

# 4. Push schema and seed database
npm run db:push
npm run db:seed

# 5. Start development server
npm run dev
```

App runs at: **http://localhost:3000**

### Production (Full Docker)

```bash
docker compose up -d
```

---

## 🔐 Demo Credentials

| Role     | Email                     | Password       |
|----------|---------------------------|----------------|
| Admin    | admin@printly.app         | Admin@123      |
| Operator | operator@printly.app      | Operator@123   |
| Student  | student@printly.app       | Student@123    |

---

## 🗺️ Pages

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/signup` | Create account |
| `/dashboard` | Student overview |
| `/dashboard/upload` | Upload PDF & create job |
| `/dashboard/jobs` | List all jobs |
| `/dashboard/jobs/[id]` | Job detail + QR code |
| `/dashboard/analytics` | Charts & metrics |
| `/operator` | Operator print queue |
| `/admin` | Admin overview |
| `/admin/users` | User management |
| `/admin/shops` | Shop management |
| `/settings` | Account settings |
| `/verify/[token]` | QR token verification |

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **State**: Zustand, React Query
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Auth**: JWT (HTTP-only cookies)
- **Charts**: Recharts
- **Upload**: react-dropzone
- **QR**: qrcode library
- **Deploy**: Docker + Docker Compose

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/          # All API routes
│   │   ├── auth/     # login, signup, logout, me
│   │   ├── jobs/     # CRUD + QR generation
│   │   ├── documents/# Upload & list
│   │   ├── shops/    # Public shop list
│   │   ├── operator/ # Queue management
│   │   ├── admin/    # User & shop mgmt
│   │   ├── analytics/# Charts data
│   │   ├── verify/   # QR verification
│   │   └── files/    # File serving
│   ├── dashboard/    # Student pages
│   ├── operator/     # Operator queue
│   ├── admin/        # Admin panel
│   ├── login/        
│   ├── signup/       
│   ├── settings/     
│   └── verify/       
├── components/
│   ├── ui/           # Button, Input, Card, Badge...
│   └── layout/       # Sidebar, DashboardLayout
├── lib/
│   ├── auth.ts       # JWT utilities
│   ├── prisma.ts     # DB client
│   ├── api.ts        # Response helpers
│   ├── storage.ts    # File management
│   └── utils.ts      # Business logic
└── stores/
    └── auth.ts       # Zustand stores
```

---

## 🔒 Security Features

- **JWT** authentication with HTTP-only cookies
- **Role-based access control** (Student/Operator/Admin)
- **Auto-delete** after printing (configurable days)
- **QR token expiry** (48h default)
- **File validation** (PDF only, max 50MB)
- **Secure file serving** with ownership checks

---

## 📊 Database Schema

Tables: `users`, `shops`, `printers`, `documents`, `print_jobs`, `notifications`, `activity_logs`, `password_resets`

Run `npm run db:studio` to view your data visually.
