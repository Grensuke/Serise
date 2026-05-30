# Launch & Pre-Push Checklist

Use this before **committing and pushing** to GitHub.

---

## Pre-push checklist

### Secrets & Git hygiene

- [ ] `git ls-files backend/.env` returns **nothing**
- [ ] `git ls-files frontend/.env.local` returns **nothing**
- [ ] No API keys, MongoDB URIs, or JWT secrets in staged files (`git diff --cached`)
- [ ] If `.env` was ever pushed: credentials **rotated** and history **purged** ([GIT_CLEANUP_STEPS.md](./GIT_CLEANUP_STEPS.md))

### Build & smoke test

- [ ] Backend: `cd backend && npm install && npm run dev` → server on port 4000
- [ ] `GET http://localhost:4000/health` → `{ "ok": true }`
- [ ] Frontend: `cd frontend && npm install && npm run dev` → Vite on http://localhost:5173
- [ ] Frontend build: `cd frontend && npm run build` → succeeds
- [ ] Sign up → land on Dashboard
- [ ] Log out from navbar or Profile → returned to Home
- [ ] Memory Vault: add → refresh → entry persists
- [ ] Profile: save name/bio → refresh → changes persist

### Documentation

- [ ] [README.md](./README.md) reflects current features and API
- [ ] [frontend/README.md](./frontend/README.md) and [backend/README.md](./backend/README.md) updated
- [ ] No real secrets in markdown files

---

## Commit & push (suggested)

```powershell
# From repo root
git status
git add .
git diff --cached --stat

# Commit (adjust message to your changes)
git commit -m "feat: revamp frontend UI, complete profile and memory vault, update docs"

git push origin arisetime
```

Use your actual branch name if different. Review `git diff` before `git add` — never stage `.env` files.

---

## What this release includes

### Frontend
- Unified design system (`index.css`, shared buttons/forms/cards)
- Global NavBar with logout (desktop + mobile)
- `PageHeader` with Back to Dashboard on all tool pages
- **Profile** — edit name/bio, activity stats, logout
- **Memory Vault** — full CRUD, search, AI insights, persistence
- **Dashboard** — check-in, stats, recent conversations → vault deep links
- `apiJson()` / `auth.js` helpers with 401 handling

### Backend
- **Profile** — GET/PUT with User join and activity counts; Profile on signup
- **Conversations** — participants/title fields; GET/PUT/DELETE; analyze caches insights
- **Energy** — validates level 0–100
- Improved AI stub responses when no Gemini key

### Docs
- README (root, frontend, backend)
- SECURITY.md, GIT_CLEANUP_STEPS.md (sanitized, no embedded secrets)

---

## Still in progress (post-push)

| Page | Remaining work |
|------|----------------|
| Energy Tracker | Error handling polish |
| Goals | Progress update UI (PUT) |
| Scripts | Edit/delete UI |
| Overthinking | Polish |
| Simulator | Session polish, real AI when key set |

See [README.md](./README.md) → Project status.

---

## Production deployment (later)

1. Host backend (Render, Railway, Fly.io, etc.) with env vars in dashboard
2. Host frontend (Vercel, Netlify, etc.) with `VITE_API_BASE` pointing to API
3. MongoDB Atlas with IP allowlist / VPC
4. CORS: restrict to production frontend URL
5. Enable HTTPS only

---

## Documentation index

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Overview, setup, API, routes |
| [frontend/README.md](./frontend/README.md) | React app structure |
| [backend/README.md](./backend/README.md) | Express API reference |
| [SECURITY.md](./SECURITY.md) | Secret handling |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Dev workflow |
| [GIT_CLEANUP_STEPS.md](./GIT_CLEANUP_STEPS.md) | Remove secrets from Git history |
| `backend/.env.example` | Backend env template |
| `frontend/.env.local.example` | Frontend env template |
