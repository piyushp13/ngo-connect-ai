## Screenshots

> Place your screenshots in the `screenshots/` folder. Example filenames: `dashboard.png`, `ngo-profile.png`, `campaign-list.png`, `chatbot.png`.

### Example Screenshots

| Dashboard | NGO Profile | Campaign List | Chatbot |
|-----------|-------------|--------------|---------|
| ![Dashboard](screenshots/dashboard.png) | ![NGO Profile](screenshots/ngo-profile.png) | ![Campaign List](screenshots/campaign-list.png) | ![Chatbot](screenshots/chatbot.png) |

---

## Usage Examples

### 1. Register as a User or NGO
Go to `/register`, fill in your details, and select your role. NGOs must upload verification documents for admin approval.

### 2. Browse and Search NGOs
Visit `/ngos` to discover verified NGOs. Use the search and filter options to find organizations by name, category, or location.

### 3. View NGO Profiles
Click on any NGO to see a detailed profile, including programs, people, impact, and financials with interactive graphs.

### 4. Donate or Volunteer
On a campaign page, click "Donate" to contribute or "Volunteer" to sign up. Track your contributions in your dashboard.

### 5. Use the AI Chatbot
Open the Chatbot page to ask questions about the platform, get NGO recommendations, or learn how to use features.

### 6. Admin Actions
Admins can verify NGOs, manage users, and review registrations from the Admin Dashboard.

---
# NGO-Connect


NGO-Connect is a full-stack AI-enabled platform connecting NGOs, donors, and volunteers. It features rich demo data, interactive dashboards, and smart tools for discovery, engagement, and impact tracking. NGOs can create detailed profiles, launch campaigns, and showcase their work, while users can discover, donate, volunteer, and interact via messaging and an AI chatbot.


## Features (2026 Demo)

- **Rich NGO Profiles:** Detailed, visually rich profiles with programs, people, impact metrics, financials (with graphs), badges, and more.
- **Campaign Management:** NGOs can create, update, and manage fundraising and volunteering campaigns. Users can browse, search, and filter campaigns by category and location.
- **Donation & Volunteering:** Secure donation system and volunteer sign-up for campaigns. Users can track their contributions and volunteering history.
- **AI Chatbot:** Smart, rule-based assistant answers questions, recommends NGOs, and helps users navigate the platform.
- **Personalized Dashboards:** Separate dashboards for users, NGOs, and admins, showing stats, recent activity, and quick actions.
- **Admin Tools:** Admin dashboard for verifying NGOs, managing users, and reviewing registrations.
- **Messaging:** In-app messaging between users and NGOs for direct communication.
- **Search & Discovery:** AI-powered recommendations, search, and filters for NGOs and campaigns.
- **Impact Tracking:** Interactive graphs (Recharts) for NGO financials and impact metrics.
- **Profile Management:** Users and NGOs can update their profiles, including uploading documents and editing details.
- **Fraud Detection (Demo):** AI endpoint for scoring potential fraud risk in NGO/campaign data.
- **Volunteer Matching (Demo):** AI endpoint for matching volunteers to campaigns based on skills and location.
- **Fully Populated Demo Data:** Backend seeded with highly detailed, realistic NGO and campaign data for presentation/demo.


## Tech Stack

**Frontend:**
- React 18 (SPA)
- React Router v6
- Axios (API calls)
- Tailwind CSS (UI)
- Heroicons (icons)
- Recharts (interactive graphs)

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT (auth)
- Bcryptjs (passwords)
- Multer (uploads)
- CORS, Dotenv

**AI/Smart Features:**
- Rule-based AI endpoints (recommendation, classification, chatbot, fraud scoring, volunteer matching)
- AI-powered campaign classification and NGO recommendations

**Other:**
- Admin dashboard, messaging, RESTful API, rich seed data


## Current Progress (Jan 2026)

- All major modules implemented: authentication, NGO/user/admin dashboards, campaign management, donations, messaging, AI chatbot, search, and profile management.
- Fully demo-ready: visually rich, interactive, and populated with realistic data for all sections.
- GitHub repo cleaned and pushed (no large files tracked).
- Tech stack and codebase up to date with modern best practices.

---

## Installation

To get started with NGO-Connect, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/Ngo-Connect.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd Ngo-Connect
    ```

3.  **Install backend dependencies:**

    ```bash
    cd backend
    npm install
    ```

4.  **Install frontend dependencies:**

    ```bash
    cd ../frontend
    npm install
    ```

5.  **Set up environment variables:**

    *   In the `backend` directory, create a `.env` file and add the following variables:

        ```
        PORT=5000
        MONGO_URI=<your_mongodb_uri>
        JWT_SECRET=<your_jwt_secret>
        ```

    *   In the `frontend` directory, create a `.env` file and add the following variable:
        ```
        REACT_APP_API_URL=http://localhost:5000/api
        ```

6.  **Run the application:**

    *   **Start the backend server:**

        ```bash
        cd backend
        npm start
        ```

    *   **Start the frontend development server:**
        ```bash
        cd frontend
        npm start
        ```
The application will be available at `http://localhost:3000`.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.
               