# Serise

Serise is a personal companion app to help you understand and manage social energy, reflect on conversations, plan social goals, and practice difficult interactions through guided simulations.

**Calm. Clarity. Confidence.**

## Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick start](#quick-start-local-development)
- [Environment variables](#environment-variables)
- [Frontend routes](#frontend-routes)
- [API overview](#api-overview)
- [Authentication](#authentication)
- [Development](#development)
- [Project status](#project-status)
- [Security](#security)
- [Contributing](#contributing)

## Features

| Area | Description |
|------|-------------|
| **Dashboard** | Personalized greeting, daily mood/energy check-in, stats, tool shortcuts, recent conversations |
| **Memory Vault** | Log conversations with participants, mood, and summary; search, edit, delete; AI insights |
| **Energy Tracker** | Log social battery level (0–100) with optional notes and history |
| **Anti-Overthinking** | Submit anxious thoughts and receive AI perspective |
| **Simulator** | Practice conversation scenarios with configurable tone, role, and difficulty |
| **Scripts** | Create and store conversation scripts |
| **Goals** | Track social goals with cadence (daily/weekly) |
| **Profile** | Edit name and bio, view activity counts, log out |
| **Auth** | Sign up, log in, JWT-protected routes, logout from navbar and profile |

All authenticated tool pages include **Back to Dashboard** navigation via a shared page header.

## Architecture

This repository contains two main parts:

- **Backend** — Node.js + Express REST API (`backend/`). MongoDB via Mongoose. Entry: `backend/src/server.js` → `backend/src/app.js`.
- **Frontend** — React + Vite SPA (`frontend/`). React Router for navigation. Entry: `frontend/src/main.jsx`.

```
frontend (React)  ──HTTP──►  backend (Express)  ──►  MongoDB
     │                              │
     └── JWT in localStorage        └── authMiddleware on protected routes
```

### Key frontend modules

- `frontend/src/router/AppRouter.jsx` — routes and global navbar
- `frontend/src/utils/api.js` — `apiFetch`, `apiJson`, `authHeaders`
- `frontend/src/utils/auth.js` — token storage, `login()`, `logout()`
- `frontend/src/components/layout/PageHeader.jsx` — back navigation + page title
- `frontend/src/index.css` — shared design tokens, buttons, forms, page shell

## Quick start (local development)

**Prerequisites:** Node.js 16+, npm, MongoDB (local or Atlas).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill MONGO_URI, JWT_SECRET, optional AI keys
npm run dev            # nodemon — default http://localhost:4000
```

Verify: `GET http://localhost:4000/health` → `{ "ok": true }`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # set VITE_API_BASE=http://localhost:4000
npm run dev                        # Vite — default http://localhost:5173
```

### 3. Use the app

1. Open http://localhost:5173
2. Sign up or log in
3. You are redirected to the **Dashboard**
4. Use the hamburger menu or dashboard tiles to reach each tool

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default `4000`) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `GEMINI_API_KEY` | No | Enables real AI (otherwise stub responses) |
| `GEMINI_ENDPOINT` | No | Override Gemini REST URL |
| `OPENAI_API_KEY` | No | Reserved for future OpenAI fallback |

See `backend/.env.example` for a template. **Never commit `.env`.**

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE` | Backend origin, e.g. `http://localhost:4000` |

See `frontend/.env.local.example`.

## Frontend routes

| Path | Access | Page |
|------|--------|------|
| `/` | Public | Home (landing) |
| `/auth/login` | Public | Login |
| `/auth/signup` | Public | Sign up |
| `/dashboard` | Protected | Main dashboard |
| `/vault` | Protected | Memory Vault |
| `/energy` | Protected | Energy Tracker |
| `/overthinking` | Protected | Anti-Overthinking |
| `/simulate` | Protected | Conversation Simulator |
| `/scripts` | Protected | Script Builder |
| `/goals` | Protected | Social Goal Tracker |
| `/profile` | Protected | Profile & logout |

Protected routes require a valid JWT (`ProtectedRoute` checks for `serise_token` in localStorage).

## API overview

All `/api/*` routes except auth require header: `Authorization: Bearer <token>`.

### Health

- `GET /health` — `{ ok: true }`

### Auth — `/api/auth`

- `POST /signup` — body: `{ email, password, name }` → `{ token, user }`
- `POST /login` — body: `{ email, password }` → `{ token, user }`

Signup also creates an empty **Profile** for the user.

### Profile — `/api/profile`

- `GET /` — `{ name, email, bio, strengths, triggers, conversationCount, goalCount }`
- `PUT /` — body: `{ name?, bio? }` → updated profile object

### Conversations — `/api/conversations`

- `GET /` — list user's conversations (newest first, limit 100)
- `POST /` — body: `{ summary, mood?, participants?, title?, tags?, transcript?, actionItems? }`
- `GET /:id` — single conversation
- `PUT /:id` — update fields
- `DELETE /:id` — delete conversation
- `GET /:id/analyze` — AI insights (cached on conversation document)

### Energy — `/api/energy`

- `GET /` — list energy logs
- `POST /` — body: `{ level: 0–100, note? }`

### Overthinking — `/api/overthinking`

- `GET /` — list entries
- `POST /` — body: `{ thought }` → includes `aiResponse`

### Simulate — `/api/simulate`

- `POST /` — body: `{ prompt, scenario?, tone?, difficulty?, role? }` → AI reply

### Scripts — `/api/scripts`

- `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`

### Goals — `/api/goals`

- `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`

For request/response details, see controllers in `backend/src/controllers/`.

## Authentication

- **Login / signup** store JWT in `localStorage` as `serise_token` via `login()` in `frontend/src/utils/auth.js`.
- **Logout** clears the token and dispatches `auth-changed` so the navbar updates immediately.
- Logout is available from:
  - Navbar (desktop button + mobile menu)
  - Profile page → Session section
- **401 responses** from `apiJson()` trigger automatic logout when a token is present.

## Development

```bash
# Frontend lint
cd frontend && npm run lint

# Frontend production build
cd frontend && npm run build

# Backend dev (with nodemon)
cd backend && npm run dev
```

### Suggested workflow

1. Run backend and frontend in separate terminals
2. Use `.env.example` / `.env.local.example` as templates — never commit secrets
3. See [CONTRIBUTING.md](./CONTRIBUTING.md) for branching, code style, and PR guidelines
4. See [SECURITY.md](./SECURITY.md) for secret handling

## Project status

Pages are being hardened one at a time for full end-to-end functionality.

| Page | Status |
|------|--------|
| Profile | Complete — view/edit name & bio, activity stats, logout |
| Memory Vault | Complete — CRUD, search, AI analyze, persistence |
| Dashboard | Complete — check-in, stats, recent conversations |
| Energy Tracker | In progress |
| Goals | Pending — progress update UI |
| Scripts | Pending — edit/delete UI |
| Overthinking | Pending — polish |
| Simulator | Pending — session polish, real AI |

AI features use structured **stub responses** when `GEMINI_API_KEY` is not configured (`backend/src/services/aiService.js`).

## Security

- Do **not** commit `backend/.env` or real API keys
- Before pushing: run `git ls-files backend/.env` — must return nothing
- If secrets were ever in Git history: rotate credentials and follow [GIT_CLEANUP_STEPS.md](./GIT_CLEANUP_STEPS.md)
- Pre-push checklist: [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md)
- Full guidance: [SECURITY.md](./SECURITY.md)

## Contributing

Contributions welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a PR. Use [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) before your first push to GitHub.

---

**Repository structure**

```
Serise/
├── backend/          Express API, Mongoose models, AI service
├── frontend/         React + Vite UI
├── README.md         This file
├── CONTRIBUTING.md   Contribution guidelines
├── SECURITY.md       Security practices
└── LAUNCH_CHECKLIST.md  Pre-push & deploy checklist
```
