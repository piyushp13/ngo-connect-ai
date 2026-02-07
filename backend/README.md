# NGO Connect Backend

Backend API for NGO-Connect. Runtime is PostgreSQL-first and serves all client applications through Express routes under `/api/*`.

## Backend Architecture

### Stack
- Node.js + Express
- PostgreSQL (`pg`) via pooled connection
- JWT auth (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Multer for document uploads
- Gemini API integration (`@google/generative-ai`)

### Module Layout

```
backend/
├── sql/
│   └── normalized_schema.sql
├── src/
│   ├── db/
│   │   ├── postgres.js        # pg pool + connect/query helpers
│   │   ├── modelFactory.js    # model abstraction mapped to *_rel tables
│   │   └── queryMatcher.js    # compatibility matcher used by model helpers
│   ├── middleware/
│   │   └── auth.js            # JWT + role authorization
│   ├── models/                # Users, NGOs, Campaigns, Donations, etc.
│   ├── routes/                # Domain route handlers
│   ├── services/
│   │   └── paymentGateway.js  # mock/razorpay abstraction
│   └── utils/
├── docs/
├── seed.js
└── package.json
```

### Route Groups
Mounted by `src/server.js`:
- `/api/auth`
- `/api/users`
- `/api/ngos`
- `/api/campaigns`
- `/api/donations`
- `/api/volunteering`
- `/api/certificates`
- `/api/messages`
- `/api/notifications`
- `/api/categories`
- `/api/requests`
- `/api/admin`
- `/api/ai`

### Access Control
- `auth()` middleware verifies bearer token and injects `req.user`.
- Role restrictions are route-level (`user`, `ngo`, `admin`) using `auth(['role'])`.

## Database Design

Schema file: `sql/normalized_schema.sql`

### Table Pattern
Core entity tables use:
- `id BIGSERIAL PRIMARY KEY`
- `external_id TEXT UNIQUE NOT NULL`
- Typed relational columns
- `source_doc JSONB` for API payload compatibility
- `created_at`, `updated_at`

### Core Tables
- `users_rel`
- `ngos_rel`
- `campaigns_rel`
- `volunteer_opportunities_rel`
- `volunteer_applications_rel`
- `donations_rel`
- `certificates_rel`
- `messages_rel`
- `notifications_rel`
- `categories_rel`
- `help_requests_rel`
- `flag_requests_rel`
- `ai_logs_rel`

### Join Tables
- `ngo_categories_rel`
- `campaign_volunteers_rel`
- `campaign_volunteer_registrations_rel`
- `opportunity_applicants_rel`

### Relationship Highlights
- `campaigns_rel.ngo_id -> ngos_rel.id`
- `donations_rel.user_id -> users_rel.id`
- `donations_rel.campaign_id -> campaigns_rel.id`
- `volunteer_applications_rel.opportunity_id -> volunteer_opportunities_rel.id`
- `certificates_rel.donation_id -> donations_rel.id`
- `certificates_rel.volunteer_application_id -> volunteer_applications_rel.id`

## Runtime Model Strategy

- Models in `src/models/*.js` are generated through `createModel(...)`.
- API uses stable `external_id` values in payloads and URLs.
- Route handlers use explicit PostgreSQL query logic where relational filtering/updates are needed.

## Payment Flow (Donations)

1. `POST /api/donations/campaign/:id/initiate`
2. Create gateway order (`mock` or `razorpay`)
3. Persist pending donation
4. `POST /api/donations/:id/confirm`
5. Verify payment, mark donation completed, update campaign amount, trigger certificate-approval state

## Environment

Create `backend/.env`:

```env
PORT=5001
POSTGRES_URL=postgresql://ngo_connect_app:ngo_connect_app_pw_2026@localhost:5432/ngo_connect
JWT_SECRET=<your_jwt_secret>
GEMINI_API_KEY=<optional>
PAYMENT_GATEWAY_PROVIDER=mock
# Optional Razorpay credentials:
# RAZORPAY_KEY_ID=<key>
# RAZORPAY_KEY_SECRET=<secret>
```

Note: old `MONGO_*` variables are not used by the active backend runtime.

## Commands

```bash
npm install
npm run db:relational-schema
npm run seed
npm run dev
npm start
```

## Local Validation Checklist

- `GET /` returns API health payload.
- Login works for seeded user/admin/ngo accounts.
- `GET /api/ngos` and `GET /api/campaigns` return data.
- Donation initiate/confirm endpoints respond successfully.
- Volunteer applications and certificate approval queues return expected results.
