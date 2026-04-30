# JobFlow – End-to-End Job Application Management SaaS

A full-stack **MERN** (MongoDB, Express, React, Node.js) web application for tracking your entire job search in one place.

---

## 🗂️ Project Structure

```
full stack/
├── backend/                  # Node.js + Express API
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js # Register / Login / Me
│   │   └── jobController.js  # CRUD job applications
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT protect middleware
│   │   └── errorMiddleware.js # Global error handler
│   ├── models/
│   │   ├── User.js           # User schema (bcrypt + JWT)
│   │   └── Job.js            # Job schema
│   ├── routes/
│   │   ├── authRoutes.js     # /api/auth/*
│   │   └── jobRoutes.js      # /api/jobs/*
│   ├── .env                  # Environment variables
│   ├── .env.example          # Example env file
│   ├── package.json
│   └── server.js             # Express app entry point
│
└── frontend/                 # React + Vite app
    ├── src/
    │   ├── api/
    │   │   └── axiosConfig.js    # Axios instance + interceptors
    │   ├── components/
    │   │   ├── JobModal.jsx      # Add / Edit job modal
    │   │   ├── ProtectedRoute.jsx
    │   │   └── StatusBadge.jsx   # Color-coded status badge
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   └── DashboardPage.jsx # Full dashboard
    │   ├── App.jsx
    │   ├── index.css             # Global styles + design tokens
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

Make sure you have these installed:

- **Node.js** v18+ → [nodejs.org](https://nodejs.org)
- **MongoDB** (local) → [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
  - Start MongoDB: `mongod` (or via MongoDB Compass)
- **npm** v9+

---

## 🚀 Setup & Running

### Step 1 — Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy env file and edit if needed
copy .env.example .env

# Start development server (with hot reload)
npm run dev
```

> Backend runs at: **http://localhost:5000**

### Step 2 — Frontend

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

> Frontend runs at: **http://localhost:5173**

### Step 3 — Open the App

Visit **http://localhost:5173** in your browser.

---

## 🔑 Environment Variables (`backend/.env`)

| Variable       | Default                              | Description              |
|----------------|--------------------------------------|--------------------------|
| `PORT`         | `5000`                               | Express server port      |
| `MONGODB_URI`  | `mongodb://localhost:27017/jobflow`  | MongoDB connection URI   |
| `JWT_SECRET`   | `jobflow_secret_key_2024_change_me`  | Secret for signing JWTs  |
| `JWT_EXPIRE`   | `7d`                                 | JWT token expiry         |
| `NODE_ENV`     | `development`                        | Environment mode         |

---

## 📡 API Endpoints

### Auth Routes — `/api/auth`

| Method | Route              | Access  | Description              |
|--------|--------------------|---------|--------------------------|
| POST   | `/api/auth/register` | Public  | Register new user       |
| POST   | `/api/auth/login`    | Public  | Login & get JWT         |
| GET    | `/api/auth/me`       | Private | Get current user        |

### Job Routes — `/api/jobs`

| Method | Route           | Access  | Description                          |
|--------|-----------------|---------|--------------------------------------|
| GET    | `/api/jobs`     | Private | Get all jobs (supports filters)      |
| POST   | `/api/jobs`     | Private | Create new job application           |
| PUT    | `/api/jobs/:id` | Private | Update a job application             |
| DELETE | `/api/jobs/:id` | Private | Delete a job application             |

#### Query Parameters for GET `/api/jobs`

| Param    | Values                                | Description        |
|----------|---------------------------------------|--------------------|
| `status` | `Applied`, `Interview`, `Offer`, `Rejected` | Filter by status |
| `search` | any string                            | Search company/role |
| `sort`   | `newest`, `oldest`, `company`, `status` | Sort order       |

---

## 🔐 Authentication Flow

1. User registers → password hashed with **bcrypt** (12 rounds)
2. User logs in → **JWT** generated (7-day expiry)
3. Token stored in **localStorage**
4. All protected routes require `Authorization: Bearer <token>` header
5. Axios interceptor auto-attaches the token to every request
6. On 401 response, user is automatically logged out and redirected

---

## 📋 Features

- ✅ **JWT Authentication** — Register, Login, Protected routes
- ✅ **Full CRUD** — Add, Edit, Delete, List job applications
- ✅ **Filter by Status** — All / Applied / Interview / Offer / Rejected
- ✅ **Search** — Real-time search by company or role
- ✅ **Sort** — Newest, Oldest, Company A-Z, By Status
- ✅ **Table View** — Full data table with sortable columns
- ✅ **Kanban View** — Visual board grouped by status
- ✅ **Stats Dashboard** — Live counts with percentage progress bars
- ✅ **Toast Notifications** — Success and error feedback
- ✅ **Form Validation** — Client-side + server-side
- ✅ **Loading States** — Skeleton loaders and spinners
- ✅ **Responsive Design** — Works on mobile and desktop
- ✅ **MVC Architecture** — Clean separation of concerns

---

## 🛠️ Tech Stack

| Layer     | Technology                               |
|-----------|------------------------------------------|
| Frontend  | React 19, Vite 8, Tailwind CSS v4        |
| Backend   | Node.js, Express 4                       |
| Database  | MongoDB, Mongoose 8                      |
| Auth      | JWT (jsonwebtoken), bcryptjs             |
| HTTP      | Axios (with interceptors)                |
| Routing   | React Router DOM v7                      |
| Toasts    | react-hot-toast                          |
| Icons     | lucide-react                             |

---

## 🎓 Academic Notes

This project demonstrates:

- **MVC Pattern**: Models (`/models`), Controllers (`/controllers`), Views (React components)
- **RESTful API Design**: Proper HTTP verbs and status codes
- **Middleware Chain**: Auth middleware → Controller → Error handler
- **Security**: Password hashing, JWT, ownership verification on all mutations
- **State Management**: React Context API for global auth state
- **Component Architecture**: Reusable components (StatusBadge, JobModal, ProtectedRoute)
