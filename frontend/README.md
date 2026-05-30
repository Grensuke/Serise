# Serise Frontend

React + Vite single-page application for the Serise social companion platform.

## Tech stack

- **React 19** with functional components and hooks
- **Vite** for dev server and production builds
- **React Router** for client-side routing
- **CSS Modules** per page/component + global design system in `src/index.css`

## Quick start

```bash
npm install
cp .env.local.example .env.local
# Set VITE_API_BASE=http://localhost:4000
npm run dev
```

Open http://localhost:5173. The backend must be running on the URL configured in `VITE_API_BASE`.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (HMR) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Environment

Create `frontend/.env.local`:

```env
VITE_API_BASE=http://localhost:4000
```

All API calls use this base URL via `src/utils/api.js`.

## Project structure

```
src/
├── main.jsx                 App entry
├── App.jsx                  Root component → AppRouter
├── index.css                Global design system (tokens, buttons, forms)
├── router/
│   ├── AppRouter.jsx        Routes + global NavBar
│   └── ProtectedRoute.jsx   Redirects to /auth/login if no token
├── utils/
│   ├── api.js               apiFetch, apiJson, authHeaders
│   ├── auth.js              login, logout, token helpers
│   └── display.js           conversationTitle, energyLevelLabel
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx       Logo, menu, logout
│   │   ├── PageHeader.jsx   Back to Dashboard + title + actions
│   │   ├── AppLayout.jsx    Page wrapper
│   │   └── Footer.jsx
│   ├── UI/                  Hero, etc.
│   └── Sections/            Home page sections
└── pages/
    ├── Home/
    ├── Auth/                Login, Signup
    ├── Dashboard/
    ├── MemoryVault/
    ├── EnergyTracker/
    ├── Overthinking/
    ├── Simulator/
    ├── Scripts/
    ├── Goals/
    └── Profile/
```

## Routes

| Path | Component | Auth |
|------|-----------|------|
| `/` | Home | No |
| `/auth/login` | Login | No |
| `/auth/signup` | Signup | No |
| `/dashboard` | Dashboard | Yes |
| `/vault` | Memory Vault | Yes |
| `/energy` | Energy Tracker | Yes |
| `/overthinking` | Anti-Overthinking | Yes |
| `/simulate` | Simulator | Yes |
| `/scripts` | Scripts | Yes |
| `/goals` | Goals | Yes |
| `/profile` | Profile | Yes |

NavBar is hidden on `/auth/*` routes. All other pages use a fixed header with `.app-content` padding for layout.

## Authentication

Token storage and session helpers live in `src/utils/auth.js`:

```javascript
import { login, logout, isAuthenticated } from './utils/auth'

// After successful login/signup
login(data.token)

// Logout (navbar or profile)
logout()
```

- Token key: `serise_token` in `localStorage`
- `auth-changed` event keeps NavBar in sync after login/logout
- `ProtectedRoute` guards authenticated pages

### API helpers

```javascript
import { apiJson, authHeaders } from './utils/api'

// GET with auth
const profile = await apiJson('/api/profile', { headers: authHeaders() })

// POST with JSON body
await apiJson('/api/energy', {
  method: 'POST',
  headers: authHeaders({ 'Content-Type': 'application/json' }),
  body: JSON.stringify({ level: 75, note: 'Good day' }),
})
```

`apiJson` throws on non-OK responses and auto-logouts on 401.

## UI & design system

Global styles in `src/index.css` define:

- CSS variables: `--accent`, `--surface`, `--header-height`, etc.
- `.page-shell` — max-width content container
- `.ui-card` — card surfaces
- `.btn`, `.btn-primary`, `.btn-danger` — buttons
- `.form-input`, `.form-textarea`, `.form-select` — form controls
- `.loading-state`, `.empty-state` — feedback states

Each page uses CSS Modules (`*.module.css`) for layout-specific styles.

### Shared components

- **PageHeader** — “Back to Dashboard” link, title, subtitle, optional stats chips and action buttons. Used on all tool pages.
- **NavBar** — Serise logo, hamburger menu, logout (desktop + mobile).
- **AppLayout** — optional footer wrapper for page content.

## Page notes

### Dashboard
- Loads profile, conversations, energy, and goal counts
- Daily check-in saves mood + energy via `POST /api/energy`
- Recent conversations link to Memory Vault with `state.selectedId`

### Memory Vault
- Full CRUD for conversations
- Search and sort client-side
- AI insights via `GET /api/conversations/:id/analyze`
- Accepts deep-link selection from Dashboard

### Profile
- Editable name and bio (`PUT /api/profile`)
- Activity stats link to Vault and Goals
- Session logout button

## Fonts

The app uses **Inter** (Google Fonts) and **Fleur De Leah** for the Serise wordmark. Optional local font files can be placed in `public/fonts/` — see `public/fonts/README.txt`.

## Backend dependency

This frontend expects the Serise backend API. See the root [README.md](../README.md) and [backend/README.md](../backend/README.md) for API documentation and setup.
