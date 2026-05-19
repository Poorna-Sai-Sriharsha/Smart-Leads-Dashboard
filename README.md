# Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack and TypeScript — featuring JWT authentication, role-based access control, advanced multi-filter search, backend pagination, CSV export, and a responsive dark mode UI with real-time analytics.

## 🚀 Setup Instructions

```bash
# Clone the repository
git clone https://github.com/Poorna-Sai-Sriharsha/Smart-Leads-Dashboard.git

# Backend setup
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run dev

# Frontend setup (in a new terminal)
cd frontend
npm install
npm run dev
```

The backend runs at `http://localhost:5000` and the frontend at `http://localhost:5173`.

### Docker Setup (alternative)

```bash
docker-compose up -d --build
# Backend: http://localhost:5000
# Frontend: http://localhost:80
```

### Seed Demo Accounts (optional)

```bash
cd backend
npm run seed
# Admin: admin@smartleads.com / Admin123!
# Sales: priya@smartleads.com / Sales123!
```

## 🏗️ Architecture & Key Decisions

### Tech Stack

**Frontend:** React 18, TypeScript, TailwindCSS, Vite, Recharts, Framer Motion  
**Backend:** Node.js, Express.js, TypeScript, MongoDB, Mongoose, Zod  
**Auth:** JWT + bcrypt (12-round salt)  
**DevOps:** Docker multi-stage builds, Docker Compose

### Why Zod over Joi/Express-Validator

1. **TypeScript-first** — Zod schemas infer types automatically, so validation and typing stay in sync without duplication.
2. **Lightweight** — No heavy dependencies; Zod is ~13KB gzipped compared to Joi's ~50KB.
3. **Composable** — Schemas can be reused, extended, and refined easily (e.g., `createLeadSchema` vs `updateLeadSchema` with `.optional()` fields).
4. **Better error format** — Zod's error output maps cleanly to field-level validation messages on the frontend.

### Project Structure

```
backend/src/
├── config/          # Database connection setup
├── controllers/     # Request handlers (auth, leads)
├── middleware/      # Auth, RBAC, Zod validation, error handler
├── models/          # Mongoose schemas (User, Lead)
├── routes/          # Express route definitions
├── types/           # TypeScript interfaces and type aliases
├── utils/           # ApiError, ApiResponse, seed script
├── validators/      # Zod validation schemas
├── app.ts           # Express app configuration
└── server.ts        # Server entry point

frontend/src/
├── api/             # Axios instance with JWT interceptor
├── components/      # Reusable UI (Sidebar, LeadForm, Pagination, etc.)
├── context/         # AuthContext, ThemeContext (React Context API)
├── hooks/           # Custom hooks (useDebounce)
├── pages/           # Route pages (Login, Register, Dashboard, Leads)
├── types/           # Shared TypeScript interfaces
├── utils/           # Helpers (CSV export, color mappings)
├── App.tsx          # Root router with protected routes
└── index.css        # TailwindCSS base + custom component classes
```

## 🎯 Architecture Implementations

### Authentication Flow

The app uses a stateless JWT-based auth system. On login or register, the backend generates a signed JWT containing the user's ID, name, email, and role. The frontend stores this token in `localStorage` and attaches it to every API request via an Axios request interceptor. A response interceptor watches for 401 errors and auto-redirects to the login page with localStorage cleanup.

### Centralized Error Handling

All backend errors funnel through a single `errorHandler` middleware that distinguishes between custom `ApiError` instances, Mongoose validation errors, duplicate key violations, invalid ObjectId formats, and JWT failures — each mapped to the correct HTTP status code. This keeps controller code clean (just `throw` and `next(err)`) and guarantees a consistent JSON response format across every endpoint.

### Role-Based Access Control

The `authorize()` middleware is a factory function that accepts allowed roles and blocks everyone else with a 403. On the frontend, the `ProtectedRoute` component checks auth state and optionally enforces role requirements. UI elements like the delete button are conditionally rendered based on `user.role`, so sales users never see actions they can't perform.

### Responsive Design Strategy

Instead of hiding the desktop table behind a horizontal scroll on mobile, the leads page conditionally renders a completely different layout — a stacked card view — on screens below 768px. The sidebar transitions from a fixed side panel on desktop to an off-canvas drawer with backdrop overlay on mobile, driven by a shared `isMobile` state that reacts to window resize events.

## ✅ Implemented Features

### Core

- **JWT Authentication** — Secure register/login with bcrypt password hashing (12 salt rounds) and 7-day token expiry.
- **Protected Routes** — Frontend route guards with loading states; backend middleware verifying every request.
- **Leads CRUD** — Create, read, update, and delete leads with full Zod request validation.
- **Single Lead Details** — Click any lead name to view a detailed modal with all fields, status badge, source, assignee, and timestamps.
- **Dashboard Analytics** — Real-time stats cards (Total Leads, Qualified, Active Contacts, Conversion Rate) computed from live API data.
- **Pipeline Chart** — Recharts bar chart showing lead distribution across statuses (New, Contacted, Qualified, Lost).
- **Recent Activity Feed** — Latest 5 leads added to the pipeline with staggered entrance animations.

### Role-Based UI (RBAC)

- **Admin Role** — Full access: create, view, update, delete leads, export CSV.
- **Sales Role** — Can create, view, update leads and export, but cannot delete.
- **Backend Enforcement** — Delete route protected with `authorize('admin')` middleware.
- **Frontend Enforcement** — Delete buttons hidden for non-admin users; no hacky client-only restrictions.

### Advanced Filtering & Search

- **Filter by Status** — New, Contacted, Qualified, Lost.
- **Filter by Source** — Website, Instagram, Referral.
- **Search by Name or Email** — Case-insensitive regex search across both fields.
- **Sort by Date** — Newest first or oldest first.
- **Combined Filters** — All filters work together (e.g., Status = Qualified + Source = Instagram + Search = "Rahul").
- **Debounced Search** — 300ms debounce to avoid hammering the API on every keystroke.
- **Empty State** — Clean UI with a floating animation when no results match.

### Pagination

- **Backend Pagination** — Proper `skip` and `limit` with MongoDB, capped at 50 per page.
- **Pagination Metadata** — Every list response includes `total`, `page`, `totalPages`, `hasNextPage`, `hasPrevPage`.
- **Page Controls** — Clickable page numbers with ellipsis for large page counts, previous/next buttons with disabled states.

### CSV Export

- **Backend Export** — Dedicated `GET /api/leads/export/csv` endpoint that respects active filters.
- **Frontend Download** — One-click export button that triggers a file download with timestamped filename.

### Enhancements

- **Dark / Light Mode** — Toggle with `localStorage` persistence via ThemeContext.
- **Form Validation** — Name must be 3-50 alphabetic characters; email format validated; source required.
- **Loading Skeletons** — Pulse-animated skeleton loaders on dashboard and leads table.
- **Framer Motion Animations** — Page transitions, card entrances, sidebar collapse, and modal overlays.
- **Custom Scrollbars** — Styled WebKit scrollbars that match the theme.
- **Glassmorphism Cards** — Backdrop-blur glass-effect card components throughout the UI.
- **Toast Notifications** — Contextual success/error toasts for every user action.
- **Auto Logout** — Axios 401 interceptor clears session and redirects on token expiry.

## 📊 Database Schema

### User Model

| Field      | Type     | Details                                |
|-----------|----------|----------------------------------------|
| name      | String   | Required, max 100 chars                |
| email     | String   | Required, unique, lowercase, validated |
| password  | String   | Required, bcrypt hashed, hidden from API responses |
| role      | String   | Enum: `admin` \| `sales`, default: `sales` |
| createdAt | Date     | Auto-generated                         |
| updatedAt | Date     | Auto-generated                         |

### Lead Model

| Field      | Type     | Details                                |
|-----------|----------|----------------------------------------|
| name      | String   | Required, max 100 chars                |
| email     | String   | Required, lowercase, validated         |
| status    | String   | Enum: `New` \| `Contacted` \| `Qualified` \| `Lost` |
| source    | String   | Enum: `Website` \| `Instagram` \| `Referral` |
| assignedTo| ObjectId | Reference to User model                |
| createdAt | Date     | Auto-generated                         |
| updatedAt | Date     | Auto-generated                         |

**Indexes:** `status`, `source`, compound `[status, source]`, text index on `[name, email]`

## 📡 API Documentation

### Authentication

| Method | Endpoint             | Access | Description              |
|--------|----------------------|--------|--------------------------|
| POST   | `/api/auth/register` | Public | Register user, return JWT |
| POST   | `/api/auth/login`    | Public | Login, return JWT         |

### Leads

| Method | Endpoint                | Access     | Description                    |
|--------|-------------------------|------------|--------------------------------|
| GET    | `/api/leads`            | Auth       | List leads (paginated, filtered) |
| GET    | `/api/leads/:id`        | Auth       | Get single lead details        |
| POST   | `/api/leads`            | Auth       | Create lead (Zod validated)    |
| PUT    | `/api/leads/:id`        | Auth       | Update lead                    |
| DELETE | `/api/leads/:id`        | Admin only | Delete lead                    |
| GET    | `/api/leads/export/csv` | Auth       | Export leads as CSV            |

### Query Parameters (GET /api/leads)

```
?page=1&limit=10&status=Qualified&source=Instagram&search=Rahul&sortBy=latest
```

All filters are optional and can be combined freely.

### Response Format

```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": [...],
  "meta": {
    "total": 14,
    "page": 1,
    "limit": 10,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🔐 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart_leads_db
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## 🐳 Docker

The project includes a multi-stage Dockerfile for the backend (TypeScript compilation → production Node.js image) and a Docker Compose configuration that orchestrates MongoDB, the API server, and the frontend behind Nginx.

```bash
docker-compose up -d --build
```

## 🔮 Future Improvements

- **Lead Assignment UI** — Dropdown to reassign leads between team members directly from the dashboard.
- **Activity Timeline** — Track every status change on a lead with timestamps and the user who made the change.
- **Email Integration** — Send follow-up emails directly from the lead detail view.
- **Advanced Analytics** — Conversion funnel visualization, source performance comparison, and time-to-close metrics.
- **Webhook Support** — Push lead events to external CRMs and notification services.

## 📄 License

MIT
