<div align="center">

# ⚡ RoleFlow
### Enterprise-Grade Multi-Role Workplace Management & RBAC SaaS Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v20-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-5.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

<p align="center">
  A secure, modern, full-stack collaborative workplace platform featuring strict <strong>Role-Based Access Control (RBAC)</strong>, dual-mode authentication (Instant Sign-Up + 6-digit Email OTP Verification), team organization, department-scoped task delegation, real-time activity audit logs, and interactive productivity boards.
</p>

[Key Features](#-key-features) • [RBAC Matrix](#-role-based-permission-matrix) • [Architecture](#-architecture) • [API Routes](#-api-endpoints) • [Quickstart](#-getting-started) • [Demo Credentials](#-demo-accounts)

</div>

---

## 🏗️ Architecture

```
                                 ┌─────────────────────────────────────────┐
                                 │            Client Application           │
                                 │        React 19 + Vite + Tailwind v4    │
                                 └────────────────────┬────────────────────┘
                                                      │
                                                      │ HTTPS REST + JWT Bearer
                                                      ▼
                                 ┌─────────────────────────────────────────┐
                                 │           Express.js API Server         │
                                 │ ─────────────────────────────────────── │
                                 │  • JWT Auth & Bcrypt Security           │
                                 │  • RBAC Access Verification Guards      │
                                 │  • Dual OTP Mailer (Gmail SMTP/Supabase)│
                                 │  • Immutable Activity Audit Logger      │
                                 │  • PostgreSQL Connection Pooler         │
                                 └────────────────────┬────────────────────┘
                                                      │
                                      ┌───────────────┴───────────────┐
                                      ▼                               ▼
                      ┌───────────────────────────────┐ ┌───────────────────────────┐
                      │    PostgreSQL on Supabase     │ │     Nodemailer / SMTP     │
                      │ ───────────────────────────── │ │ ───────────────────────── │
                      │  • users & teams              │ │  • Branded HTML OTP Mail  │
                      │  • team_members (M:N)         │ │  • Supabase Fallback Mail │
                      │  • tasks & comments           │ └───────────────────────────┘
                      │  • activity_logs              │
                      └───────────────────────────────┘
```

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Dual Registration Modes:**
  - **⚡ Instant Sign Up:** Create and test accounts immediately with zero email wait time.
  - **🔐 Email OTP Verification:** Secure 6-digit email confirmation dispatched via direct Gmail SMTP or Supabase Auth.
- **Strict Role-Based Access Control (RBAC):** Backend route middleware enforces permission boundaries; frontend route guards isolate role interfaces.
- **Password Security:** Industry-standard Bcrypt hashing (10 salt rounds) with real-time complexity validation (8+ chars, uppercase, numeric).
- **1-Click Demo Accounts:** Pre-seeded demo credentials for instant testing of Admin, Manager, and Employee roles.

### 👑 Admin Control Center
- **User Provisioning & Lifecycle:** Create team members, reassign roles (Admin, Manager, Employee), and softly deactivate/activate access without breaking relational integrity.
- **Team & Department Hierarchy:** Create departments, designate team leads/managers, and organize employee distribution.
- **System Activity Audit Trail:** Chronological log of all actions (task updates, role changes, logins, comments) across the organization.
- **Executive Analytics:** High-level metrics tracking active users, departmental velocity, and platform distribution.

### 👔 Manager Workspace
- **Team Velocity & Productivity:** Visual dashboard monitoring task completion status, member workloads, and team milestones.
- **Scoped Task Management:** Create, assign, edit, and manage tasks exclusively for the manager's assigned team.
- **Real-Time Collaboration:** Comment threads and instant status monitoring for ongoing team deliverables.

### 💻 Employee Workspace
- **Personal Kanban & Task Board:** Clear separation of **To Do**, **In Progress**, and **Completed** tasks with priority tags (Low, Medium, High, Urgent) and due date trackers.
- **Interactive Task Transitions:** One-click task progress updates with instant visual feedback.
- **Discussion Threads:** Task-specific comment feeds for direct team communication.
- **Profile Customization:** Edit display name, switch avatar presets, and change security credentials.

---

## 🛡️ Role-Based Permission Matrix

| Feature / Action | Admin | Manager | Employee |
| :--- | :---: | :---: | :---: |
| **View System Analytics & Audit Logs** | ✅ | ❌ | ❌ |
| **Manage Users (Create, Edit, Deactivate)** | ✅ | ❌ | ❌ |
| **Change User Roles** | ✅ | ❌ | ❌ |
| **Create Teams & Assign Managers** | ✅ | ❌ | ❌ |
| **Create Tasks** | ✅ | ✅ *(Own team only)* | ❌ |
| **Assign Tasks** | ✅ | ✅ *(Own team members)* | ❌ |
| **Delete Tasks** | ✅ | ✅ *(Own team tasks)* | ❌ |
| **View Team Dashboard & Productivity** | ✅ | ✅ *(Own team)* | ❌ |
| **View Assigned Tasks** | ✅ | ✅ | ✅ |
| **Update Task Status (Todo $\to$ In Progress $\to$ Done)** | ✅ | ✅ | ✅ |
| **Post Comments on Tasks** | ✅ | ✅ | ✅ |
| **Edit Profile & Password** | ✅ | ✅ | ✅ |

---

## 👥 Demo Accounts

Pre-configured accounts ready for testing:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin@roleflow.demo` | `RoleflowDemo123!` | Global Organization & User Management |
| 👔 **Manager** | `manager@roleflow.demo` | `RoleflowDemo123!` | Engineering Department Workspace |
| 💻 **Employee** | `employee@roleflow.demo` | `RoleflowDemo123!` | Personal Assigned Tasks & Discussions |

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`instant` or `requiresVerification: true`)
- `POST /api/auth/verify-otp` — Verify 6-digit email confirmation code
- `POST /api/auth/resend-otp` — Request a fresh 6-digit OTP
- `POST /api/auth/login` — Authenticate and receive JWT session token
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `PUT /api/auth/profile` — Update display name and avatar
- `PUT /api/auth/password` — Change account password

### Users & Administration (`/api/users` — *Admin Only*)
- `GET /api/users` — Paginated user directory with role and status filtering
- `GET /api/users/stats` — Organization-wide analytics summary
- `POST /api/users` — Admin manual user creation
- `PUT /api/users/:id/role` — Update user permissions
- `PUT /api/users/:id/status` — Toggle user activation status

### Teams (`/api/teams`)
- `GET /api/teams` — List all departments and members
- `GET /api/teams/:id` — Team details and member roster
- `POST /api/teams` — Create new department (*Admin*)
- `PUT /api/teams/:id` — Update team details (*Admin*)
- `POST /api/teams/:id/members` — Add team members (*Admin*)
- `DELETE /api/teams/:id/members/:userId` — Remove team member (*Admin*)

### Tasks (`/api/tasks`)
- `GET /api/tasks` — List tasks scoped to user's role and team
- `POST /api/tasks` — Create new task (*Admin & Manager*)
- `PUT /api/tasks/:id` — Update task details (*Admin & Manager*)
- `PATCH /api/tasks/:id/status` — Update task progress (*All assigned users*)
- `DELETE /api/tasks/:id` — Delete task (*Admin & Manager*)
- `POST /api/tasks/:id/comments` — Post comment on task

### Activity Audit (`/api/activity` — *Admin Only*)
- `GET /api/activity` — Chronological audit trail of all organization activities

---

## 🚀 Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/your-username/roleflow.git
cd roleflow
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5001
DATABASE_URL=postgresql://postgres.your-project:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Direct Gmail SMTP (for 6-digit OTP delivery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM="RoleFlow" <your-email@gmail.com>

# Supabase Credentials (Optional Fallback)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Database Initialization & Seeding
Execute the SQL migration scripts in your PostgreSQL instance or Supabase SQL Editor:
1. Run [`server/src/db/schema.sql`](server/src/db/schema.sql)
2. Run [`server/src/db/seed.sql`](server/src/db/seed.sql)

*Alternatively, run the automated seed script:*
```bash
cd server
npm install
node src/db/seed.js
```

### 4. Start the Application

```bash
# Start backend server (Port 5001)
cd server
npm install
npm run dev

# Start frontend client (Port 5173)
cd ../client
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti, Axios
- **Backend:** Node.js, Express.js (ES Modules), JSON Web Tokens (JWT), Bcrypt.js, Nodemailer
- **Database:** PostgreSQL (Supabase Cloud), `pg` connection pooling
- **Validation & Security:** Zod schemas, CORS, Helmet, rate limiting

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
