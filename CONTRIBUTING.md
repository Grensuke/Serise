# Contributing to Serise

Thank you for your interest in contributing to Serise! This document outlines development practices and contribution guidelines.

## Getting Started

### Prerequisites
- Node.js v16+ and npm
- MongoDB instance (local or Atlas)
- Git

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Grensuke/Serise.git
   cd Serise
   ```

2. **Backend setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and fill in MongoDB URI, JWT_SECRET, and any API keys
   npm install
   npm run dev
   ```
   Backend runs on `http://localhost:4000`.

3. **Frontend setup (in a new terminal):**
   ```bash
   cd frontend
   cp .env.local.example .env.local
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:5173` (Vite default).

### Verify everything works
- Open http://localhost:5173 in your browser
- Try signing up or logging in
- Ensure you see no console errors

## Development Guidelines

### Code Style
- **Backend**: Use consistent indentation (2 spaces), place braces on same line.
- **Frontend**: ESLint is configured; run `npm run lint` to check style.
- **File naming**: Controllers/models use PascalCase (`UserController.js`), utilities use camelCase (`hashPassword.js`).

### Branching & Commits
- Create a feature branch from `main`: `git checkout -b feature/my-feature`
- Keep commits atomic and focused (one feature/fix per commit).
- Use descriptive commit messages: `"Add password reset endpoint"` instead of `"fix stuff"`.
- Prefix commits with type if using Conventional Commits:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `refactor:` for code restructuring
  - `test:` for tests

### Async/Await & Error Handling
- Always use `async/await` for asynchronous operations (avoid callback hell).
- Forward errors to middleware using `next(err)` in route handlers; do not send direct `res.status(500)` responses.
- Example:
  ```javascript
  exports.getUser = async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ msg: 'not found' });
      return res.json(user);
    } catch (e) {
      console.error('getUser error:', e.message);
      return next(e);  // Pass to centralized error handler
    }
  };
  ```

### Ownership & Authorization
- All CRUD operations that modify user data must verify the requesting user owns the resource.
- Pattern: `Model.findOneAndUpdate({ _id: id, user: userId }, ...)`
- Always return `404` if resource not found or user unauthorized.

### Database Queries
- Use `.lean()` if you only need plain objects (faster for read-only).
- Use `.limit()` and `.sort()` to avoid fetching entire collections.
- Index frequently-queried fields (e.g., `{ user: 1 }` on conversation, goal collections).

### Security Practices
- **Never log secrets** (passwords, tokens, API keys).
- **Normalize and validate** all inputs (emails lowercased, trim whitespace).
- **Hash passwords** using bcrypt (async); never store plaintext.
- **Add rate limiting** to sensitive endpoints (e.g., login).
- See [SECURITY.md](./SECURITY.md) for full guidelines.

## Testing

Currently, the project lacks automated tests. Adding them is a high-priority contribution:

- **Unit tests**: Test individual functions (hashing, validation, utilities).
- **Integration tests**: Test API endpoints end-to-end.
- **Use Jest or Mocha** for testing framework.

Example:
```bash
npm install --save-dev jest supertest
# Add test scripts to package.json
```

## Pull Requests

1. **Before submitting:**
   - Run `npm run lint` (frontend) and fix any style issues.
   - Test your changes locally (backend + frontend).
   - Update README or docs if you add new features.

2. **Submit a PR:**
   - Provide a clear title and description of your changes.
   - Link to any related issues.
   - Keep PRs small and focused (easier to review).

3. **Code review:**
   - Be open to feedback.
   - Respond to review comments promptly.
   - Push updates to the same branch; the PR will auto-update.

## Reporting Issues

- Use GitHub Issues to report bugs or request features.
- Include reproduction steps, expected behavior, and actual behavior.
- Attach screenshots or error logs if applicable.

## Documentation

- Update README or CONTRIBUTING if you add new setup steps or features.
- Document complex logic with inline comments.
- Keep inline comments brief and focus on the "why," not the "what" (the code shows the what).

## Questions?

Feel free to open an issue or reach out. Happy coding! 🎉

---

**Thank you for contributing to Serise!**
