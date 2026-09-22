<div align="center">

# ⚡ RoleFlow
### Enterprise-Grade Multi-Role Workplace Management & RBAC SaaS Platform

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-role--flow--six.vercel.app-4f46e5?style=for-the-badge)](https://role-flow-six.vercel.app)
[![API Status](https://img.shields.io/badge/Backend_API-Render-22c55e?style=for-the-badge)](https://roleflow-zye6.onrender.com/api/health)

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://supabase.com/)

<p align="center">
  🔗 <strong>Live Application:</strong> <a href="https://role-flow-six.vercel.app">https://role-flow-six.vercel.app</a>
</p>

<p align="center">
  A collaborative workplace SaaS platform featuring strict <strong>Role-Based Access Control (RBAC)</strong>, dual-mode authentication (Instant Sign-Up + 6-digit Email OTP Verification), team organization, department-scoped task delegation, real-time activity audit logs, and interactive productivity boards.
</p>

</div>

---

## 👥 1-Click Demo Accounts

Try all roles instantly without registering:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin@roleflow.demo` | `RoleflowDemo123!` | Global Organization & User Management |
| 👔 **Manager** | `manager@roleflow.demo` | `RoleflowDemo123!` | Engineering Department Workspace |
| 💻 **Employee** | `employee@roleflow.demo` | `RoleflowDemo123!` | Personal Assigned Tasks & Discussions |

---

## ✨ Core Features

- **🔐 Dual Authentication & RBAC:**
  - **⚡ Instant Sign Up:** Immediate account access without email waiting.
  - **🔐 Email OTP Verification:** Secure 6-digit verification code with direct Gmail SMTP and Supabase delivery.
  - **Strict RBAC Enforcement:** Isolated routes and views for Admin, Manager, and Employee.
- **👑 Admin Control Center:** Manage users, elevate/demote roles, soft-deactivate accounts, assign teams, and inspect system-wide chronological activity audit logs.
- **👔 Manager Workspace:** Team sprint velocity tracking, member workloads, and task delegation restricted to team members.
- **💻 Employee Workspace:** Personal Kanban task board (`To Do` $\to$ `In Progress` $\to$ `Completed`), task detail slide-over drawer, and real-time comment threads.
- **📱 100% Responsive:** Optimized for Mobile, Tablet, and Desktop with off-canvas drawers and adaptive grids.

---

## 🛡️ Role Permission Matrix

| Feature / Action | Admin | Manager | Employee |
| :--- | :---: | :---: | :---: |
| **System Analytics & Audit Logs** | ✅ | ❌ | ❌ |
| **Manage Users & Roles** | ✅ | ❌ | ❌ |
| **Create Teams & Assign Leads** | ✅ | ❌ | ❌ |
| **Create / Assign / Delete Tasks** | ✅ | ✅ *(Own team)* | ❌ |
| **View Team Dashboard** | ✅ | ✅ *(Own team)* | ❌ |
| **Update Assigned Task Status** | ✅ | ✅ | ✅ |
| **Task Comment Threads** | ✅ | ✅ | ✅ |
| **Edit Profile & Password** | ✅ | ✅ | ✅ |

---

## 🏗️ Architecture

```
React 19 + Vite (Vercel) ──► Express API (Render) ──► PostgreSQL (Supabase)
                                   │
                                   └──► Direct SMTP / Nodemailer (OTP Mail)
```

---

## 🚀 Local Quickstart

### 1. Clone & Install
```bash
git clone https://github.com/vidit-ks/RoleFlow.git
cd RoleFlow

# Install dependencies
cd server && npm install
cd ../client && npm install
```

### 2. Environment Setup
Create `server/.env`:
```env
PORT=5001
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres
JWT_SECRET=super_secret_roleflow_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM="RoleFlow" <your-email@gmail.com>
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Run Locally
```bash
# Start backend (Port 5001)
cd server && npm run dev

# Start frontend (Port 5173)
cd client && npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📄 License
This project is licensed under the MIT License.
