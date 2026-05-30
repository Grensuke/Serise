# Git Cleanup & Secret Removal Steps

Run these commands from your repository root (`C:\Users\STARK\Documents\Serise\Serise`).

## Step 1: Stop tracking `.env` immediately (local only)

```powershell
git rm --cached backend/.env
git commit -m "Remove committed .env file from tracking"
```

This removes the file from Git's index without deleting it locally. **Do this first to prevent accidental re-commits.**

## Step 2: Purge from Git history (removes from all past commits)

### Option A: Using `git filter-branch` (standard Git)

```powershell
# Purge backend/.env from ALL commits
git filter-branch --tree-filter 'Remove-Item -Path "backend\.env" -Force -ErrorAction SilentlyContinue' -- --all

# Clean up refs
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push to remote (only if you have permission)
git push origin main --force-with-lease
git push origin arisetime --force-with-lease
```

**⚠️ WARNING**: Force-push rewrites history. Only do this if:
- You are the only developer OR
- All team members are aware and can re-clone
- You have backups

### Option B: Using BFG Repo-Cleaner (safer, faster)

```powershell
# Download BFG (or use if already installed)
# https://rtyley.github.io/bfg-repo-cleaner/

# Create a list of files to remove
"backend\.env" | Out-File sensitive-files.txt

# Run BFG to remove sensitive files
bfg --delete-files sensitive-files.txt

# Cleanup
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Push
git push origin main --force-with-lease
git push origin arisetime --force-with-lease
```

**Safer because**: BFG specifically targets files and is less aggressive than filter-branch.

## Step 3: Verify removal

```powershell
# Confirm backend/.env is no longer in the most recent commit
git ls-tree -r HEAD | grep "backend/.env"
# Should return: (no output)

# Check git log to ensure history is clean
git log --all --full-history -- backend/.env
# Should return: (no output)
```

## Step 4: Rotate credentials IMMEDIATELY

### MongoDB
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign in with `grensuke_db_user` account
3. Navigate to **Database Access** → **Username and Password**
4. Click **Edit** on the `grensuke_db_user` entry
5. Click **Generate New Password** → copy the new password
6. Update your `.env` file with the new connection string

### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Delete the compromised key `AIzaSyAj2ltZ0nwGa2xTLJbLT4Fv4Dy_YH5foo0`
3. Click **Create API Key** → **Create new secret key**
4. Copy the new key and update your `.env`

### OpenAI (if used)
1. Go to [OpenAI API Keys](https://platform.openai.com/account/api-keys)
2. Delete any compromised keys
3. Generate new keys and update `.env`

## Step 5: Update `.env` locally with new credentials

```powershell
# Edit backend/.env
notepad backend\.env

# Replace with new credentials from step 4
# File should look like:
# PORT=4000
# MONGO_URI=mongodb+srv://grensuke_db_user:NEW_PASSWORD@cluster0.w0zctzv.mongodb.net/
# JWT_SECRET=your_secure_secret_here
# GEMINI_API_KEY=your_new_gemini_key
# GEMINI_ENDPOINT=
```

## Step 6: Verify backend starts successfully

```powershell
cd backend
npm install
npm run dev
```

Should see: `Server running on 4000` (or similar) without errors.

## Step 7: Final verification

```powershell
# Ensure .env is in .gitignore
git status
# Should show: nothing to commit (or untracked files, but NOT backend/.env)
```

---

## Summary

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `git rm --cached backend/.env` | Stop tracking the file |
| 2a | `git filter-branch ...` | Purge from history (standard) |
| 2b | `bfg --delete-files ...` | Purge from history (safer) |
| 3 | `git ls-tree -r HEAD ...` | Verify removal |
| 4 | Manual rotation in MongoDB/Gemini | Invalidate old credentials |
| 5 | Edit `.env` locally | Add new credentials |
| 6 | `npm run dev` | Test with new credentials |
| 7 | `git status` | Final check |

## Questions?

- **Q**: What if I can't force-push to main?  
  **A**: That's actually good (protects against accidental rewrites). Work with your team or contact repository admin.

- **Q**: Will this break clones for other developers?  
  **A**: Yes, if you force-push. They'll need to re-clone or do `git fetch -f` followed by `git reset --hard origin/main`.

- **Q**: Is the Gemini key I saw actually real?  
  **A**: The format looks real. Treat it as compromised and rotate immediately (the above API key is now known to be published in a public repo).

Good luck! 🎉
