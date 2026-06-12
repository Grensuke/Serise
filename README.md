# Serise

> *Calm. Clarity. Confidence.*

**Serise** is a personal growth application designed specifically for introverts. At the heart of the idea, Serise provides a safe, reflective space to manage your social battery, log your interactions, and practice conversations without the real-world pressure. 

Whether you're gearing up for a meeting, processing an awkward chat, or just tracking your daily energy, Serise is here to help you navigate social waters smoothly.

---

## 🌟 Core Features

- **Memory Vault**: Log your daily conversations and instantly get AI-driven insights (tone analysis, alternative replies, and confidence scoring) so you can stop overthinking and start improving.
- **Conversation Simulator**: Practice social scenarios (like small talk, saying no, or asking doubts) with an AI partner that adapts to different tones and roles.
- **Energy Tracker**: Monitor your social battery check-ins. Keep an eye on what drains you and what gives you energy.
- **Anti-Overthinking Tools**: Step-by-step cognitive reframing exercises to ground you when social anxiety kicks in.
- **Beautiful Blended Dark Mode**: A sleek, premium UI that adapts to your preference seamlessly.

---

## 💻 Tech Stack

Serise is built with a modern MERN stack plus AI integration:

- **Frontend**: [React 19](https://react.dev/) & [Vite](https://vitejs.dev/)
- **Routing**: React Router DOM
- **Backend**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via Mongoose
- **Authentication**: JWT (JSON Web Tokens) with BcryptJS password hashing
- **AI Engine**: Google Gemini API integration for real-time conversation simulation and tone analysis.

---

## 📂 Project Structure

```text
Serise/
├── frontend/             # React (Vite) Application
│   ├── src/
│   │   ├── components/   # Reusable UI elements (Navbar, Layouts, Modals)
│   │   ├── pages/        # Core views (Simulator, MemoryVault, Auth, etc.)
│   │   ├── utils/        # Helpers (API fetch wrappers, Auth token managers)
│   │   ├── index.css     # Global CSS and Design System (Dark mode vars)
│   │   └── router/       # Protected routing logic
│   └── package.json
│
└── backend/              # Node.js API
    ├── src/
    │   ├── config/       # Environment & Database config
    │   ├── controllers/  # Route logic (Auth, Conversations, AI Simulator)
    │   ├── models/       # Mongoose schemas
    │   ├── routes/       # Express route definitions
    │   └── services/     # External integrations (Gemini API)
    └── package.json
```

---

## 🔌 API Routes

Here is a summary of the core API endpoints that power Serise:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate and retrieve JWT token | No |
| `GET` | `/api/conversations` | Retrieve all memory vault logs | Yes |
| `POST` | `/api/conversations` | Log a new conversation to the vault | Yes |
| `GET` | `/api/conversations/:id/insights`| Get AI-generated insights for a specific log | Yes |
| `POST` | `/api/simulate` | Run an interactive AI conversation simulation | Yes |
| `GET` | `/api/goals` | List all user active goals | Yes |

---

## 🚀 Getting Started

Follow these steps to set up Serise locally on your machine.

### 1. Prerequisites
- Node.js (v18+)
- MongoDB connection string (Atlas or Local)
- Google Gemini API Key

### 2. Install Dependencies

Open two separate terminals for the frontend and backend.

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 3. Environment Setup

Create a `.env` file in the **`backend`** directory and populate it with the following keys:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
```

*(Note: If `GEMINI_API_KEY` is not provided, the backend will gracefully fall back to returning hardcoded stub responses for the AI features.)*

### 4. Run the Development Servers

**Start the Backend:**
```bash
cd backend
npm run dev
```

**Start the Frontend:**
```bash
cd frontend
npm run dev
```

Your app should now be running at `http://localhost:5173`.

---

## 🔒 Authentication Flow
Serise uses a robust JWT-based authentication system. On successful login or signup, a token is stored securely in `localStorage` and sent via an Authorization Bearer header on every protected API request. 

## 🌙 Blended Dark Mode
Serise features a premium, non-pure-black dark mode powered by CSS variables (`--surface-muted`, `--text-subtle`, etc.) for maximum readability. Users can toggle this preference using the Navbar, and it persists in `localStorage`.

---

## 📝 Author & License

**Nithilan Posani**  
B.Tech UnderGraduate | [grensuke@gmail.com](mailto:grensuke@gmail.com)

*Built with empathy for introverts.*
