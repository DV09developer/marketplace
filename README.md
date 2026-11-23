# Justdial-Inspired Business Discovery & Inquiry Marketplace

A production-minded, clean-architecture local business discovery and inquiry marketplace monorepo built with **Next.js (App Router)** and **Express.js (TypeScript)** powered by **Supabase PostgreSQL**.

---

## 🏗️ Architecture & Monorepo Structure

```
marketplace/
├── package.json              # Monorepo root scripts
├── README.md                 # Project documentation
├── server/                   # Express.js REST API Backend
│   ├── src/
│   │   ├── config/           # Database pool, environment config
│   │   ├── controllers/      # REST API route controllers
│   │   ├── services/         # Business logic layer
│   │   ├── repositories/     # Parameterized PostgreSQL data access
│   │   ├── routes/           # Express routers
│   │   ├── middlewares/      # Authentication, authorization, error handling
│   │   ├── validators/       # Zod validation schemas
│   │   ├── utils/            # Token generation, password hashing, API responses
│   │   ├── types/            # TypeScript interfaces
│   │   ├── migrations/       # SQL database migrations
│   │   ├── app.ts            # Express application setup
│   │   └── server.ts         # Server entrypoint and graceful shutdown
│   ├── .env.example          # Backend environment variables template
│   └── tsconfig.json
└── client/                   # Next.js 14+ App Router Frontend
    ├── src/
    │   ├── app/              # App router (Public, Auth, Dashboard, Admin)
    │   ├── components/       # UI (shadcn/ui), shared layout components
    │   ├── features/         # Domain-driven feature modules
    │   ├── hooks/            # Custom React hooks
    │   ├── lib/              # API client, utility functions
    │   └── types/            # Frontend TypeScript definitions
    ├── .env.example          # Frontend environment variables template
    ├── tailwind.config.ts    # Tailwind styling configuration
    └── tsconfig.json
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v22+ recommended)
- **npm** or **pnpm**
- **Supabase Account** or local PostgreSQL instance

### 2. Configure Environment Variables

#### Backend (`server/.env`):
Copy `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```
Fill in your Supabase PostgreSQL credentials:
```env
PORT=5000
NODE_ENV=development
API_PREFIX=/api
CLIENT_URL=http://localhost:3000

# Supabase PostgreSQL Connection String
DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[YOUR-REGION].pooler.supabase.com:6543/postgres
DB_SSL=true

JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_at_least_32_characters_long

SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Frontend (`client/.env.local`):
Copy `client/.env.example` to `client/.env.local`:
```bash
cp client/.env.example client/.env.local
```
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME="Marketplace"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🛠️ Development Commands

From the monorepo root:

- **Start Backend Development Server**:
  ```bash
  npm run dev:server
  ```
- **Start Frontend Development Server**:
  ```bash
  npm run dev:client
  ```
- **Test Database Connectivity**:
  ```bash
  npm run db:test
  ```
- **Build Backend**:
  ```bash
  npm run build:server
  ```
- **Build Frontend**:
  ```bash
  npm run build:client
  ```

---

## 🛡️ Key Features & Business Rules
1. **Unified Dual-Role User Account**: A single registered user can act as both a buyer and a multi-business owner without separate login portals.
2. **Direct Inquiry Isolation**: Inquiries are sent strictly to the specific selected business; no broadcasting or spam distribution.
3. **Approval Gating**: Newly created businesses and listings require admin review before appearing in public searches.
4. **Clean Layered Architecture**: Strictly separated Controller -> Service -> Repository layers with parameterized SQL queries.
5. **Secure Authentication**: Short-lived JWT access tokens with rotating refresh tokens stored in secure HTTP-only cookies.
