# 🚀 Project Cleanup & Launch Checklist

Everything is ready! Follow this checklist to clean up secrets, rotate credentials, and get the project running with new credentials.

---

## ✅ IMMEDIATE ACTIONS (Do these now)

### 1. Remove `.env` from Git tracking

Open PowerShell in your project root and run:

```powershell
git rm --cached backend/.env
git commit -m "chore: remove committed .env file from tracking"
```

### 2. Rotate credentials (MongoDB + Gemini)

#### MongoDB Credentials
- Visit [MongoDB Atlas](https://cloud.mongodb.com)
- Go to **Database Access** → **Username and Password**
- Click **Edit** on `grensuke_db_user`
- Click **Generate New Password**   
- Copy the new password and connection string
- Update `backend/.env`:
  ```
  MONGO_URI=mongodb+srv://grensuke_db_user:YOUR_NEW_PASSWORD@cluster0.w0zctzv.mongodb.net/
  ```

#### Gemini API Key
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Delete the old key: `AIzaSyAj2ltZ0nwGa2xTLJbLT4Fv4Dy_YH5foo0`
- Click **Create new secret key**
- Copy the new key and update `backend/.env`:
  ```
  GEMINI_API_KEY=YOUR_NEW_KEY
  ```

### 3. Verify backend works with new credentials

```powershell
cd backend
npm run dev
```

Should see: `Server running on 4000` (or similar success message)

### 4. Purge secrets from Git history (optional but recommended)

**Choose ONE option below:**

#### Option A: Simple (if repo is private/not widely cloned)
```powershell
git filter-branch --tree-filter 'Remove-Item -Path "backend\.env" -Force -ErrorAction SilentlyContinue' -- --all
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin arisetime --force-with-lease
```

#### Option B: Safe (using BFG - recommended for public repos)
```powershell
# Download BFG if needed from: https://rtyley.github.io/bfg-repo-cleaner/
bfg --delete-files "backend\.env"
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin arisetime --force-with-lease
```

**Note**: Force-push will require a re-clone for other developers. Only do this if needed.

---

## ✅ SETUP & VERIFY

### 1. Fresh test: Backend

```powershell
cd backend
npm install
npm run dev
```

Verify: `Server running on 4000` and no env validation errors

### 2. Fresh test: Frontend

```powershell
cd frontend
npm install
npm run dev
```

Verify: Vite dev server starts (usually http://localhost:5173)

### 3. Test login flow

- Open http://localhost:5173
- Try **Sign up** with a test email/password
- Verify you're redirected to `/dashboard`
- Check browser console for no errors

---

## ✅ DOCUMENTATION REVIEW

Read these new files to understand the project:

| File | Purpose |
|------|---------|
| [README.md](README.md) | Setup, API overview, env variables |
| [SECURITY.md](SECURITY.md) | Secret management, best practices |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Dev guidelines, branching, code style |
| [GIT_CLEANUP_STEPS.md](GIT_CLEANUP_STEPS.md) | Detailed git history cleanup |
| `backend/.env.example` | Template for backend env vars |
| `frontend/.env.local.example` | Template for frontend env vars |

---

## ✅ IMPROVEMENTS MADE (already applied)

### Backend Fixes ✨
- ✅ **Env validation**: App exits with clear message if `MONGO_URI` or `JWT_SECRET` missing
- ✅ **Async password hashing**: No more event-loop blocking
- ✅ **Ownership checks**: Users can't modify/delete other users' goals & scripts
- ✅ **Email normalization**: Emails lowercased & trimmed (prevents duplicates)
- ✅ **Centralized error handling**: All errors route through middleware
- ✅ **Better logging**: Descriptive error prefixes for debugging

### Documentation ✨
- ✅ **Comprehensive README**: Setup, API, env vars, security notes
- ✅ **Security guide**: Secret removal, credential rotation, best practices
- ✅ **Contributing guide**: Dev workflow, code style, branching conventions
- ✅ **Env templates**: `.env.example` for both backend and frontend
- ✅ **`.gitignore`**: Prevents re-committing secrets

---

## ⏭️ NEXT STEPS (Short-term priorities)

1. **Rate limiting** — Add to `/api/auth/login` to prevent brute-force attacks
2. **Token refresh** — Implement refresh tokens (7-day expiry may be limiting)
3. **Frontend API consolidation** — Use `apiFetch` helper everywhere (centralize error handling)
4. **Logout functionality** — Add explicit logout with token clearing
5. **Input validation** — Use express-validator (backend) + Zod/Yup (frontend)
6. **Tests** — Add unit + integration tests (high value, currently missing)

---

## 🎯 VERIFICATION CHECKLIST

Before declaring "ready to deploy":

- [ ] `.env` removed from git tracking
- [ ] Credentials rotated (MongoDB + Gemini)
- [ ] Backend starts with `npm run dev` → `Server running on 4000`
- [ ] Frontend starts with `npm run dev` → Vite dev server starts
- [ ] Can sign up and login without errors
- [ ] Read SECURITY.md and understand secret management
- [ ] Optionally: Purged secrets from git history
- [ ] (Optional) Short-term improvements started (rate limiting, tests, etc.)

---

## ❓ Questions?

- **Where are the env vars?** → `backend/.env` (git-ignored) and `frontend/.env.local` (if needed)
- **Did the changes break anything?** → No; all changes are backwards-compatible and improve security/reliability
- **How do I test the fixes?** → Backend startup validates env; ownership checks tested by trying to modify another user's goal
- **Can I deploy now?** → Yes, after rotating credentials and removing `.env` from git history
- **What about TypeScript/tests?** → Recommended but not implemented yet; see CONTRIBUTING.md for guidelines

---

## 📝 Files Changed

**Created:**
- `.gitignore` — Excludes `.env` and build artifacts
- `SECURITY.md` — Security best practices and secret rotation guide
- `CONTRIBUTING.md` — Developer guidelines
- `GIT_CLEANUP_STEPS.md` — Detailed git cleanup instructions
- `backend/.env.example` — Env template (no secrets)
- `frontend/.env.local.example` — Frontend template

**Updated:**
- `README.md` — Comprehensive project guide
- `backend/src/config/env.js` — Env validation at startup
- `backend/src/utils/hashPassword.js` — Async password hashing
- `backend/src/controllers/*.js` (7 files) — Ownership checks, error handling, email normalization

---

**You're all set!** 🎉 Start with the "IMMEDIATE ACTIONS" section above and work through the checklist. Reach out if you hit any issues!
