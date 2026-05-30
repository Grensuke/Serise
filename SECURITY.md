# Security Guidelines

Security practices for the Serise project.

## Environment secrets

### Do not commit secrets

- **Never commit** `backend/.env`, `frontend/.env.local`, or any file containing API keys, database URIs, or JWT secrets.
- Use **`backend/.env.example`** and **`frontend/.env.local.example`** as templates only (placeholders, no real values).
- Root **`.gitignore`** excludes env files. Backend and frontend also have local `.gitignore` rules.

### Before pushing to GitHub

```powershell
# From repo root — should print nothing (file not tracked)
git ls-files backend/.env frontend/.env.local

# Should show ignore rules
git check-ignore -v backend/.env
```

If `backend/.env` appears in `git ls-files`, remove it from tracking **without deleting your local file**:

```powershell
git rm --cached backend/.env
git commit -m "chore: stop tracking backend .env"
```

### If secrets were ever committed

Treat them as **compromised**:

1. **Rotate** MongoDB password, JWT secret, and any API keys (Gemini, OpenAI).
2. Update **`backend/.env`** locally with new values only.
3. **Purge from Git history** — see [GIT_CLEANUP_STEPS.md](./GIT_CLEANUP_STEPS.md) (use BFG or `git filter-branch`).
4. **Force-push** only if you understand the impact on collaborators.

Do **not** paste real credentials into issues, PRs, or documentation.

## Application security (implemented)

| Area | Status |
|------|--------|
| Password storage | bcrypt hashing (async) |
| Auth | JWT in `Authorization: Bearer` header |
| Email | Normalized (lowercase, trim) on signup/login |
| Ownership | User-scoped queries on conversations, goals, scripts, etc. |
| Energy validation | Level must be 0–100 |
| Frontend token | Stored as `serise_token`; cleared on logout |
| API errors | `apiJson()` handles non-OK responses; 401 clears session |

## Recommended improvements

- **Rate limiting** on `/api/auth/login` and signup
- **Refresh tokens** or shorter JWT expiry with renewal
- **Input validation** (e.g. express-validator on backend)
- **CORS allowlist** in production (restrict to your frontend origin)
- **Structured logging** without sensitive fields in production
- **Dependency audits**: `npm audit` in `backend/` and `frontend/`

## Production deployment

- Set env vars in the host dashboard (Render, Railway, Vercel, etc.) — not in committed files.
- Use separate MongoDB users and databases for prod vs dev.
- Rotate `JWT_SECRET` if it was ever exposed.

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
