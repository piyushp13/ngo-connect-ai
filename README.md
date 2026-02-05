# NGO-Connect

NGO-Connect is a full-stack, AI-enabled platform designed to connect NGOs, donors, and volunteers in one place. It helps NGOs showcase their impact and manage campaigns, while giving users a simple way to discover verified NGOs, donate, and volunteer. AI features enhance discovery, recommendations, and support.

## Features (Detailed)
- Discover verified NGOs with search and filters.
- Dedicated pages for Discover NGOs, Volunteer in Campaigns, Donate, and Smart Insights.
- Campaigns can be funding-only, volunteer-only, or hybrid.
- Donation tracking with live progress and “Campaign Done” state.
- Volunteer sign-up directly inside campaign pages.
- User dashboard with donation history, volunteer history, notifications, and recommendations.
- NGO dashboard with campaign stats, volunteer counts, and verification status.
- Admin dashboard with verification workflow, user management, analytics charts, and platform oversight.
- Admin-only moderation: flag campaigns/NGOs, review user flag requests, resolve flags.
- Admin notifications broadcasted to users and NGOs.
- AI chatbot powered by Gemini for instant help and discovery.
- AI-powered recommendations based on user preferences and activity.
- Messaging between users and NGOs.
- Role-based access control (user, NGO, admin) with protected routes.
- File uploads for NGO verification documents.

## Tech Stack & Tools
### Frontend
- React 18
- React Router v6
- Axios
- Tailwind CSS
- Recharts
- Heroicons
- react-scripts

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT authentication
- bcryptjs
- Multer (file uploads)
- CORS
- Dotenv
- @google/generative-ai (Gemini)

### Dev Tools
- nodemon (backend hot reload)
- @faker-js/faker (database seeding)

## Dependencies (from package.json)
### Backend
- @google/generative-ai
- bcryptjs
- cors
- dotenv
- express
- jsonwebtoken
- mongoose
- multer
- nodemon (dev)
- @faker-js/faker (dev)

### Frontend
- react
- react-dom
- react-router-dom
- axios
- tailwindcss
- recharts
- @heroicons/react
- react-scripts
- @testing-library/react
- @testing-library/jest-dom
- @faker-js/faker (dev)
- @types/google-one-tap (dev)

## Setup Guide (Full Instructions)

### 1) Install required tools (in order)
1. Install **Node.js LTS** (includes npm).
2. Install **MongoDB** (local installation or use MongoDB Atlas).
3. Install **Git** (if not already installed).

### 2) Clone the repo
```bash
git clone <your-repo-url>
cd Ngo-Connect
```

### 3) Install backend dependencies
```bash
cd backend
npm install
```

### 4) Install frontend dependencies
```bash
cd ../frontend
npm install
```

### 5) Configure environment variables
Create a `.env` file in `backend/`:
```env
PORT=5001
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
GEMINI_API_KEY=<your_gemini_api_key>
```

Create a `.env` file in `frontend/` (optional but recommended):
```env
REACT_APP_API_URL=http://localhost:5001/api
```

### 6) (Optional) Seed the database
```bash
cd ../backend
node seed.js
```
This creates sample users, NGOs, campaigns, and an admin account.

### 7) Run the backend server
```bash
cd backend
npm run dev
```
Backend runs at `http://localhost:5001`.

### 8) Run the frontend server
```bash
cd ../frontend
npm start
```
Frontend runs at `http://localhost:3000`.

## Test Credentials (after seeding)
- Admin: `admin@ngoconnect.org` / `password123`
- User: `rahul@example.com` / `password123`
- NGO: `eduforall@ngo.org` / `password123`

## Protected Routes
Some routes require authentication. If you’re not logged in, you’ll be redirected to the login page.

Protected routes include:
- Discover NGOs
- Volunteer in Campaigns
- Donate
- Get Smart Insights
- Dashboards and profile pages

## API Overview
Key API groups:
- `/api/auth` Authentication (register, login)
- `/api/users` User preferences and profile
- `/api/ngos` NGO profiles and verification
- `/api/campaigns` Campaigns, volunteering
- `/api/donations` Donations
- `/api/messages` Messaging
- `/api/admin` Admin moderation, analytics, verifications
- `/api/notifications` Admin notifications to users/NGOs
- `/api/ai` Recommendations, classification, chatbot

## Troubleshooting
- **MongoDB connection errors**:  
  - Ensure MongoDB is running locally or your Atlas cluster is reachable.  
  - Confirm `MONGO_URI` in `backend/.env` is correct and includes the database name.  
  - Check firewall/IP whitelist if using MongoDB Atlas.

- **Missing environment variables**:  
  - If the backend crashes on startup, verify `.env` exists in `backend/` with `PORT`, `MONGO_URI`, and `JWT_SECRET`.  
  - AI chatbot features require `GEMINI_API_KEY`. Without it, chatbot falls back or errors.

- **Port already in use**:  
  - If you see `EADDRINUSE`, another process is already using that port.  
  - Stop the existing process or change the port in `.env` (backend) or `package.json`/`.env` (frontend).

- **Frontend 404s or API errors**:  
  - Ensure backend is running on `http://localhost:5001`.  
  - Check `frontend/.env` has `REACT_APP_API_URL=http://localhost:5001/api`.  
  - Restart the frontend after editing `.env`.

- **Authentication issues**:  
  - If protected routes always redirect to login, clear `localStorage` and re-login.  
  - Make sure backend `JWT_SECRET` matches tokens being issued.

## Project Structure
```
Ngo-Connect/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── seed.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── App.js
    └── package.json
```

## Contributing
Contributions are welcome. Open an issue or submit a pull request with improvements or fixes.
