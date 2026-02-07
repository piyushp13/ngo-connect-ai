# NGO-Connect

NGO-Connect is a full-stack platform that connects donors, volunteers, NGOs, and admins in one workflow. The project now runs on a PostgreSQL-backed architecture across the backend runtime.

## Architecture At A Glance

```
React SPA (frontend)
  -> Axios API client + JWT
Express API (backend)
  -> Route handlers + auth middleware + service layer
PostgreSQL
  -> *_rel tables + JSONB source_doc + relational keys/indexes
```

## Repository Layout

```
Ngo-Connect/
├── backend/
│   ├── sql/                     # PostgreSQL schema (normalized_schema.sql)
│   ├── src/
│   │   ├── db/                  # pg pool, model factory, query helpers
│   │   ├── middleware/          # JWT auth + role checks
│   │   ├── models/              # Model wrappers mapped to *_rel tables
│   │   ├── routes/              # Domain API routes
│   │   ├── services/            # External service adapters (payments)
│   │   └── utils/               # Utility helpers (certificates, etc.)
│   ├── docs/                    # Migration/design notes
│   └── seed.js                  # Sample data seeding
├── frontend/
│   └── src/
│       ├── components/          # Shared UI + route guards
│       ├── pages/               # Feature pages (user/ngo/admin)
│       ├── services/            # API client
│       └── utils/               # Client-side helpers
└── README.md
```

## Frontend Design

### Core Stack
- React 18
- React Router v6
- Axios
- Tailwind CSS
- Recharts
- Leaflet + react-leaflet

### Routing And Access Control
- `frontend/src/App.js` defines all page routes.
- `ProtectedRoute` gates authenticated routes.
- `UserRoute` gates donor/volunteer-only screens.
- `AdminRoute` gates admin-only screens.

### Feature Areas
- Public: Home, NGO list/profile, campaign list/details.
- User: discover NGOs, donations, volunteer campaigns/opportunities, recommendations, insights, dashboard/profile, messaging.
- NGO: profile updates, campaign creation, volunteer and donation operations.
- Admin: NGO verification, flags moderation, categories, notifications, requests, analytics, user management.

### API Client Pattern
- `frontend/src/services/api.js` centralizes all HTTP calls.
- JWT token is injected via Axios request interceptor.
- API base comes from `REACT_APP_API_URL` (defaults to `http://localhost:5001/api`).
- Frontend exposes feature-specific API helpers for donations, volunteering, certificates, categories, requests, recommendations, and NGO discovery.

## Backend Design

### Runtime Stack
- Node.js + Express
- PostgreSQL (`pg`)
- JWT auth (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Multer uploads
- Gemini integration (`@google/generative-ai`)

### API Composition
Mounted in `backend/src/server.js`:
- `/api/auth`
- `/api/ngos`
- `/api/campaigns`
- `/api/donations`
- `/api/volunteering`
- `/api/certificates`
- `/api/messages`
- `/api/notifications`
- `/api/categories`
- `/api/requests`
- `/api/users`
- `/api/admin`
- `/api/ai`

### Layered Structure
- Routes: request validation, authorization, response shaping.
- Middleware: token verification + role-based access.
- Models: table mappings via `createModel` in `backend/src/db/modelFactory.js`.
- DB layer: pooled pg connection + SQL helpers in `backend/src/db/postgres.js`.
- Services: payment gateway abstraction (`mock` and `razorpay`).

### Key Backend Flows
- Donation flow:
  - Initiate payment order (`/api/donations/campaign/:id/initiate`).
  - Confirm payment (`/api/donations/:id/confirm`).
  - Update donation state, campaign amount, and certificate approval workflow.
- Volunteer flow:
  - Opportunity publishing by NGOs.
  - User applications and completion state transitions.
  - NGO certificate approval decision endpoints.
- Admin flow:
  - NGO verification/rejection.
  - Flags moderation and resolution.
  - Broadcast notifications and analytics endpoints.

## Database Design (PostgreSQL)

### ID Strategy
- `id BIGSERIAL` is the internal relational primary key.
- `external_id TEXT UNIQUE` is the API-facing stable ID.
- `source_doc JSONB` stores full API payload compatibility.
- `created_at` and `updated_at` are maintained on all core tables.

### Main Tables
- `users_rel`
- `ngos_rel`
- `categories_rel`
- `campaigns_rel`
- `volunteer_opportunities_rel`
- `volunteer_applications_rel`
- `donations_rel`
- `certificates_rel`
- `messages_rel`
- `notifications_rel`
- `help_requests_rel`
- `flag_requests_rel`
- `ai_logs_rel`

### Join Tables
- `ngo_categories_rel`
- `campaign_volunteers_rel`
- `campaign_volunteer_registrations_rel`
- `opportunity_applicants_rel`

### Core Relationships
- Campaigns belong to NGOs.
- Donations link users, campaigns, and NGOs.
- Volunteer applications link users, opportunities, and NGOs.
- Certificates link to donation or volunteer-completion records.
- Requests, messages, notifications, and flags link to user/admin actors.

### Query Semantics
- Route-level filtering and update behavior has been moved toward explicit PostgreSQL logic.
- SQL joins and JSONB expressions are used where route filters need richer selection.
- Mongo-style query/update operators are not used in route handlers for the newer Postgres-native paths.

## Setup

### Prerequisites
1. Node.js LTS
2. PostgreSQL 14+
3. npm

### Backend Env (`backend/.env`)

```env
PORT=5001
POSTGRES_URL=postgresql://<user>:<password>@localhost:5432/ngo_connect
JWT_SECRET=<strong-secret>
GEMINI_API_KEY=<optional>
PAYMENT_GATEWAY_PROVIDER=mock
# Optional for Razorpay
# RAZORPAY_KEY_ID=<key>
# RAZORPAY_KEY_SECRET=<secret>
```

### Frontend Env (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:5001/api
```

### Install + Run

```bash
# backend
cd backend
npm install
npm run db:relational-schema
npm run seed
npm run dev

# frontend (new terminal)
cd ../frontend
npm install
npm start
```

## Seed Credentials (Local)
- Admin: `admin@ngoconnect.org` / `password123`
- User: `rahul@example.com` / `password123`
- NGO: `eduforall@ngo.org` / `password123`

## API Surface Summary
- Authentication and profile: `/api/auth`, `/api/users`
- NGO and campaigns: `/api/ngos`, `/api/campaigns`
- Donations, volunteering, certificates: `/api/donations`, `/api/volunteering`, `/api/certificates`
- Communication and operations: `/api/messages`, `/api/notifications`, `/api/requests`
- Platform admin and intelligence: `/api/admin`, `/api/ai`, `/api/categories`

## Troubleshooting
- `404` on donation/payment endpoints:
  - Confirm frontend uses `REACT_APP_API_URL=http://localhost:5001/api`.
  - Confirm backend is running on port `5001`.
- DB connection failures:
  - Verify `POSTGRES_URL` and ensure PostgreSQL is running.
  - Re-run `npm run db:relational-schema` and `npm run seed`.
- Auth failures:
  - Ensure `JWT_SECRET` is set and stable across backend restarts.
  - Re-login after backend auth changes.

## Notes
- Legacy Mongo/Mongoose runtime dependencies are not required for the current backend runtime.
- If old `MONGO_*` variables exist in local env files, they are not used by the active server code.
