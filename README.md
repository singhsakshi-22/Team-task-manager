# 🌌 Aether Productivity — Futuristic Team Task Manager

Welcome to **Aether Productivity**, a state-of-the-art, glassmorphism-themed, full-stack **Team Task Manager** built using the MERN Stack. 

Aether features a robust **Role-Based Access Control (RBAC)** authentication engine (Admin/Member) that enables admins to manage project workspace clusters, assign tasks, and track team outputs, while members collaborate in real-time, update task progress, and visualize workflows using an interactive drag-and-drop Kanban desk.

---

## 🚀 Key Visual & Architecture Highlights

1. **Futuristic Glassmorphic Theme**: Deep galactic dark mode featuring custom glowing neon borders, shifting hover glows, soft backdrop-blur card panels, and micro-animated metrics grids.
2. **Zero-Configuration Fallback DB**: Connects to production MongoDB Atlas. If no connection URI is supplied in the `.env` variable, **the backend automatically falls back to an integrated local file-based database (`local_db.json`)**. This guarantees the application compiles, boots, and executes local persistency operations out of the box with zero external configuration!
3. **Buttery-Smooth Kanban Drag-and-Drop**: Built using lightweight, hyper-performant HTML5 drag handlers. Members can drag task cards betweencolumns, instantly updating metrics grids and activity feeds.
4. **Collaborative Action Streams**: Fully integrated Activity Logs that chronologically record task creations, status updates, and membership changes, streamed to the dashboard.
5. **Unified Router Shield**: React Router routes are secured using stateful JWT token validation, blocking unauthorized members from hitting administrative endpoints.

---

## 🛠️ Technology Stack
* **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + custom SVGs
* **Backend**: Node.js + Express.js + JWT Auth (jsonwebtoken) + bcryptjs
* **Database**: MongoDB + Mongoose ODM (with automatic SQLite-like Local JSON File database fallback)

---

## 🏁 Quick Start Guide

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v16.0.0 or higher recommended).

### 1. Repository Setup & Installations
Execute the monorepo helper script from the root directory to automatically resolve and install dependencies for both the frontend and backend:
```bash
# From the root directory:
npm run install:all
```

### 2. Seeding Sample Data
Aether comes packaged with highly realistic mock project states, overdue task nodes, and user cards. Run the seed script to wipe and populate the active database (whether standard MongoDB or the local fallback):
```bash
npm run seed
```

### 3. Launching the Application
Launch both the backend API server (port 5000) and the frontend React dev client (port 3000) concurrently with a single command from the root directory:
```bash
npm run dev
```

Your browser should automatically boot and serve the client at **`http://localhost:3000`**.

---

## 🔑 Demonstration Credentials
Use these pre-configured seeded logins to test Aether:

### 🛡️ Administrative Identity
* **Email Matrix**: `admin@aether.com`
* **Access Key**: `password123`
* **Authority**: Full dashboard metrics, task creations, member allocations, project deletions.

### 👥 Member Identity
* **Email Matrix**: `sakshi@aether.com`
* **Access Key**: `password123`
* **Authority**: Workspace visualizer, drag-and-drop Kanban status updates, collaborative activity stream checks, identity styling controls.

*Other seeded members: `liam@aether.com` (password123), `sophia@aether.com` (password123).*

---

## 📂 Architecture Mapping
```
team-task-manager/
├── package.json              # Monorepo tasks (install all, launch dev)
├── backend/
│   ├── server.js             # Express entry point
│   ├── config/db.js          # DB connector & elegant JSON-file fallback
│   ├── models/               # Schemas (User, Project, Task, ActivityLog)
│   ├── middleware/           # JWT verification & global error logger
│   ├── routes/               # API Router endpoints
│   └── seed.js               # Database population script
└── frontend/
    ├── vite.config.js        # Vite & API gateway proxy
    ├── tailwind.config.js    # Cyber glow colors, shadows & animations
    ├── index.html            # Google Fonts Outfit load
    └── src/
        ├── index.css         # Styling system & glassmorphism filters
        ├── context/          # Auth & Theme states
        ├── components/       # GlassCard, StatCard, Sidebar, TaskModal
        └── pages/            # Dashboard, Projects, Kanban, Profile, Team
```

---

## 🌐 API Endpoint Definitions

### Authentication (`/api/auth`)
* `POST /register` — Sign up new user node (Member/Admin selection)
* `POST /login` — Authenticate and issue secure signed JWT
* `GET /profile` — Fetch details of current session
* `GET /users` — Get all users (to assign members to project/tasks)

### Projects (`/api/projects`)
* `GET /` — Fetch projects associated with user (Admins see all)
* `POST /` — Provision a new project workspace (**Admin only**)
* `PUT /:id` — Modify project parameters (**Admin only**)
* `DELETE /:id` — Destroy project node and tasks (**Admin only**)
* `POST /:id/members` — Enroll team member (**Admin only**)

### Tasks (`/api/tasks`)
* `GET /project/:projectId` — Fetch all tasks under project
* `POST /` — Provision new task node (**Admin only**)
* `PUT /:id` — Modify task fields (**Admin only**)
* `PATCH /:id/status` — Modify task status Pending/Progress/Completed (**Assigned User**)
* `DELETE /:id` — Destroy task node (**Admin only**)

### Dashboard (`/api/dashboard`)
* `GET /summary` — Retrieve aggregated analytics metrics
* `GET /activity` — Fetch chronologically sorted team action log feed
