# Serise
Serise is a personal companion app to help users understand and manage social energy, reflect on conversations, plan social goals, and practice difficult interactions using small guided simulations.

## Table of contents
- **Project**: high-level overview and architecture
- **Quick Start**: run backend and frontend locally
- **Environment**: required environment variables
- **API**: main routes and purpose
- **Security Notes**: secrets handling and git hygiene
- **Development**: linting, build and helpful tips
- **Contributing**: how to help

## Project
This repository contains two main parts:

- **Backend**: Node.js + Express API (located in `backend/`). Uses MongoDB via Mongoose. Main entry: `backend/src/server.js` which loads `backend/src/app.js`.
- **Frontend**: React + Vite single-page app (located in `frontend/`). Main entry: `frontend/src/main.jsx` which mounts the React app.

### Architecture (quick)
- Backend exposes JSON REST endpoints grouped under `/api/*` (auth, conversations, energy, overthinking, simulate, profile, scripts, goals).
- Frontend calls the backend API using a small helper (`frontend/src/utils/api.js`) and renders pages/components in `frontend/src/pages/`.

## Quick Start (local development)
Prerequisites: Node.js (v16+ recommended), npm, and access to a MongoDB instance.

1. Backend

	```bash
	cd backend
	npm install
	cp .env.example .env   # or create .env and populate vars
	# fill MONGO_URI, JWT_SECRET, and any AI keys in .env
	npm run dev            # starts nodemon on src/server.js
	```

2. Frontend

	```bash
	cd frontend
	npm install
	# optionally copy .env.example to .env and adjust VITE_API_BASE
	npm run dev            # starts Vite dev server (hot reload)
	```

Open the frontend dev server URL reported by Vite (usually http://localhost:5173) and ensure the backend is running (default port 4000).

## Environment variables
Backend environment variables are loaded from `backend/src/config/env.js`. Provide the following in `backend/.env` or your deployment environment (do NOT commit secrets):

- `PORT` — port for backend (default 4000)
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret for signing JSON Web Tokens
- `OPENAI_API_KEY` — optional (if OpenAI used)
- `GEMINI_API_KEY` — optional (if Gemini/PaLM used)
- `GEMINI_ENDPOINT` — optional REST endpoint override

Frontend: `VITE_API_BASE` (see `frontend/.env.example`). Use full backend origin like `http://localhost:4000` or your deployed URL.

IMPORTANT: Never commit real secret values to Git. See Security Notes below.

## API overview (most important routes)
The backend mounts the following route groups in `backend/src/app.js`:

- `GET /health` — simple health check returning `{ ok: true }`.
- `POST /api/auth/*` — authentication endpoints (signup/login/token flow).
- `GET/POST /api/conversations/*` — create and list conversation logs.
- `GET/POST /api/energy/*` — track social energy entries.
- `GET/POST /api/overthinking/*` — record overthinking entries.
- `POST /api/simulate/*` — run conversation simulations (AI-driven).
- `GET/POST /api/profile/*` — user profile actions.
- `GET/POST /api/scripts/*` — script templates and generated scripts.
- `GET/POST /api/goals/*` — goal creation and tracking.

For specific parameter formats and request/response shapes, check the controller files in `backend/src/controllers/`.

## Security notes (action required)
- I found an example `.env` and a `backend/.env` in the repository with real-looking secrets (Mongo URI and API keys). If these credentials are real, rotate them immediately and remove the `.env` file from the repository.
- Add `backend/.env` to `.gitignore` and remove secrets from history (use `git rm --cached backend/.env` and rotate credentials). Consider using environment secrets in hosting (Vercel, Netlify, Heroku) or a secret manager.

## Development notes and suggestions
- Linting: frontend includes ESLint configuration; run `npm run lint` in `frontend/` to check style.
- Tests: there are currently no automated tests in the repo — consider adding unit and integration tests for critical services.
- Error handling: backend has an `errorHandler` middleware — ensure all async routes forward errors to it with `next(err)`.
- AI keys: abstract usage behind a service (`backend/src/services/aiService.js` exists) and avoid logging keys.

## Next steps / Suggested improvements
- Remove committed secrets and add `.env` to `.gitignore`.
- Add a `CONTRIBUTING.md` with development workflow and code style.
- Add API documentation (OpenAPI or simple Markdown) for endpoints and request shapes.
- Add basic tests and a GitHub Actions workflow for CI.

## Contributing
Feel free to open issues or pull requests. For code changes, keep PRs small and focused. Run linters and basic smoke tests before submitting.

---
If you'd like, I can:
- produce a step-by-step `git` cleanup to remove the committed `.env` and rotate guidance,
- add a CONTRIBUTING.md and basic API docs,
- or start applying code-quality fixes across the backend and frontend.

