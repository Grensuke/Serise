# Security Guidelines

This document outlines critical security practices for the Serise project.

## Environment Secrets (Action Required)

The repository currently contains a `backend/.env` file with real credentials (Mongo URI, API keys). **This must be removed immediately.**

### Steps to remove secrets from Git history:

```bash
# Remove the file from tracking
git rm --cached backend/.env

# (Optional) If needed, purge from all history:
git filter-branch --tree-filter 'rm -f backend/.env' -- --all
git push origin main --force-with-lease  # Only if you have permission and it's safe to force-push

# Or use BFG Repo-Cleaner for safer removal:
# https://rtyley.github.io/bfg-repo-cleaner/
```

### Next steps:

1. **Rotate all credentials immediately** — assume the committed secrets are compromised.
   - MongoDB: reset credentials in MongoDB Atlas
   - API Keys: regenerate keys from Gemini/OpenAI dashboards
2. **Update `.env` locally** with new credentials.
3. **Add `.env` to `.gitignore`** — ensure `backend/.env` is never tracked.
4. **Use environment secrets in production** — set secrets via your hosting platform (Vercel, Netlify, Heroku, Docker, etc.), not in `.env` files.

## Best Practices

- **Never commit `.env` files** or any files containing secrets (API keys, database credentials, tokens).
- **Use `.env.example`** as a template for developers (see `backend/.env.example`). It should contain placeholder values, not real secrets.
- **Validate environment variables at startup** — the app now validates required env vars (`MONGO_URI`, `JWT_SECRET`) and exits with a clear message if missing.
- **Use hashed passwords** — all password hashing is now async (bcrypt with salt=10).
- **Ownership checks** — update/delete operations now verify the requesting user owns the resource before modifying or deleting (fixed in Goal and Script controllers).
- **Error handling** — all controllers now forward errors to middleware using `next(err)` for centralized error handling.
- **Normalize email addresses** — emails are lowercased and trimmed on signup/login to prevent case-sensitivity issues.

## API Security

- **Token expiry**: JWT tokens expire after 7 days. Consider implementing refresh tokens for longer sessions.
- **CORS**: Backend applies CORS middleware. Ensure frontend origin is configured properly in production.
- **Rate limiting**: Consider adding rate limiting middleware to prevent brute-force attacks on `/api/auth/login`.
- **Input validation**: Backends should validate all request inputs (currently minimal validation; consider adding express-validator).

## Logging and Monitoring

- Avoid logging sensitive data (passwords, tokens, full error messages with secrets).
- Use structured logging (pino/winston) in production instead of `console.log`.
- Monitor error rates and unusual API usage patterns.

## Testing

- Add unit tests for authentication, ownership checks, and password hashing.
- Add integration tests for critical endpoints.
- Use pre-commit hooks to lint and run security checks (e.g., `npm audit`, `snyk`).

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [bcrypt.js Documentation](https://github.com/kelektiv/node.bcrypt.js)
