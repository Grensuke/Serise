# Git Cleanup & Secret Removal

Use this guide if `backend/.env` or other secrets were **committed or pushed** to Git. Run commands from the repository root.

## Step 1: Stop tracking `.env` (keep local file)

```powershell
git rm --cached backend/.env
git commit -m "chore: stop tracking backend .env"
```

This removes the file from Git index only — your local `backend/.env` stays on disk.

## Step 2: Purge from Git history

Only needed if secrets were **pushed to a remote**. Rewriting history affects all clones.

### Option A: BFG Repo-Cleaner (recommended)

```powershell
# Download: https://rtyley.github.io/bfg-repo-cleaner/
bfg --delete-files ".env"
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin YOUR_BRANCH --force-with-lease
```

### Option B: git filter-branch

```powershell
git filter-branch --tree-filter "rm -f backend/.env" -- --all
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin YOUR_BRANCH --force-with-lease
```

Replace `YOUR_BRANCH` with your branch name (e.g. `main`, `arisetime`).

## Step 3: Verify

```powershell
git ls-files backend/.env
# (no output = good)

git log --all --full-history -- backend/.env
# (no output = purged from history)
```

## Step 4: Rotate all credentials

Assume old values are public if they were in Git:

| Secret | Action |
|--------|--------|
| **MongoDB** | Atlas → Database Access → reset user password → update `MONGO_URI` |
| **JWT_SECRET** | Generate new random string → update `.env` → users must log in again |
| **GEMINI_API_KEY** | Google AI Studio → revoke old key → create new key |
| **OPENAI_API_KEY** | OpenAI dashboard → revoke and recreate if used |

Generate a JWT secret (example):

```powershell
# PowerShell — random base64 string
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Step 5: Update local `.env`

```powershell
notepad backend\.env
```

Use placeholders from `backend/.env.example` as a guide. Never commit this file.

## Step 6: Verify app still runs

```powershell
cd backend
npm install
npm run dev
# Expect server on port 4000

cd ..\frontend
npm install
npm run dev
# Expect Vite on http://localhost:5173
```

## Step 7: Pre-push check

```powershell
git status
git ls-files | Select-String "\.env"
# Must not list backend/.env or frontend/.env.local
```

---

## FAQ

**Can I push without purging history?**  
You can stop future leaks with Step 1, but old commits may still contain secrets. Rotate credentials and purge before making the repo public.

**Will force-push break teammates' clones?**  
Yes. They should re-clone or reset to the new remote history after you notify them.

**Is `.env` ignored now?**  
Root `.gitignore` includes `backend/.env` and `frontend/.env.local`. Confirm with `git check-ignore -v backend/.env`.
