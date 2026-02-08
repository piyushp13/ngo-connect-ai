# NGO Connect Frontend

React client for NGO-Connect. It provides role-based experiences for users, NGOs, and admins and consumes backend APIs from the `services/api.js` layer.

## Frontend Architecture

### Stack
- React 18
- React Router v6
- Axios
- Tailwind CSS
- Recharts
- Leaflet (`react-leaflet`, `leaflet-routing-machine`)

### App Structure

```
frontend/src/
├── App.js                 # route graph
├── components/            # shared UI + route guards
│   ├── ProtectedRoute.js
│   ├── UserRoute.js
│   └── AdminRoute.js
├── pages/                 # page-level features
│   ├── admin pages
│   ├── ngo pages
│   ├── user pages
│   └── Map/NgoMap.js
├── services/
│   └── api.js             # axios client + endpoint helpers
└── utils/
```

### Routing Model
- Public routes: home, login/register, NGO list/profile, campaign list/details.
- Auth routes: dashboard, profile, messaging, recommendations.
- User-only routes: donate, volunteer campaigns/opportunities, insights.
- Admin-only routes: verification, analytics, requests, categories, notifications, moderation.

### Feature Highlights
- Donations: initiate/confirm flow, receipts, and NGO certificate approval.
- Volunteering:
  - Volunteer opportunities (apply, complete, NGO certificate approve).
  - Campaign volunteering (submit details, NGO approve/reject, certificate issuance).
- Support Requests: users submit help requests to a selected NGO; NGOs manage request status in their dashboard inbox; admin sees snapshot summary.
- Messaging: threaded user <-> NGO conversations with unread counts.
- Moderation: user-submitted flag requests for NGOs/campaigns and admin review workflow.

### Data Access Model
- `api.js` configures a single Axios instance.
- JWT token from `localStorage` is automatically attached to requests.
- Endpoint helper functions are grouped by domain (donations, volunteering, certificates, categories, help requests, etc.).

## Environment

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5001/api
```

If not set, frontend defaults to `http://localhost:5001/api`.

## Commands

```bash
npm install
npm start
npm run build
npm test
```

## Run With Backend

1. Start backend on `http://localhost:5001`
2. Start frontend on `http://localhost:3000`
3. Ensure API URL points to backend `/api` base

## Common Issues
- `404` for API calls:
  - Check `REACT_APP_API_URL`.
  - Verify backend is running and route exists.
- Auth redirects to login:
  - Token may be expired/invalid; re-login.
- Map not rendering:
  - Confirm Leaflet CSS/assets are loaded by app build.
