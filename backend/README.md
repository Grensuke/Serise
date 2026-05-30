# Serise Backend

Node.js + Express REST API for the Serise social companion app. Persists user data in MongoDB and provides optional AI-powered features.

## Quick start

```bash
npm install
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET (see below)
npm run dev
```

Server runs at `http://localhost:4000` by default.

Verify:

```bash
curl http://localhost:4000/health
# {"ok":true}
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start production server |

## Environment variables

Create `backend/.env` from `.env.example`:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default `4000`) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `GEMINI_API_KEY` | No | Google Gemini — enables live AI |
| `GEMINI_ENDPOINT` | No | Custom Gemini API URL |
| `OPENAI_API_KEY` | No | Reserved for future use |

**Never commit `.env` to Git.**

## Project structure

```
src/
├── server.js              HTTP server entry
├── app.js                 Express app + route mounting
├── config/
│   └── env.js             Environment loading
├── middleware/
│   └── authMiddleware.js  JWT verification → req.user
├── models/
│   ├── User.js
│   ├── Profile.js
│   ├── Conversation.js
│   ├── EnergyLog.js
│   ├── OverthinkingEntry.js
│   ├── ScriptTemplate.js
│   └── Goal.js
├── controllers/           Route handlers
├── routes/                Express routers
├── services/
│   └── aiService.js       AI analyze + simulate (Gemini or stub)
└── utils/
    ├── generateToken.js
    └── hashPassword.js    bcrypt hash/compare
```

## Authentication

JWT-based auth. Protected routes use `authMiddleware`:

```
Authorization: Bearer <token>
```

Token payload: `{ id: userId }`. Issued on signup/login.

### Auth routes — `/api/auth`

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/signup` | `{ email, password, name }` | `{ token, user }` |
| POST | `/login` | `{ email, password }` | `{ token, user }` |

Signup creates a **User** and an empty **Profile**.

## API routes

All routes below require auth unless noted.

### Profile — `/api/profile`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | User name, email, bio, counts |
| PUT | `/` | Update `{ name?, bio? }` |

`GET` joins User data and aggregates `conversationCount` / `goalCount`.

### Conversations — `/api/conversations`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List conversations (newest first) |
| POST | `/` | Create — requires `summary` |
| GET | `/:id` | Get one |
| PUT | `/:id` | Update |
| DELETE | `/:id` | Delete |
| GET | `/:id/analyze` | AI insights (saved on document) |

**Conversation fields:** `summary`, `participants`, `title`, `mood`, `tags`, `transcript`, `actionItems`, `analysis`, `createdAt`

### Energy — `/api/energy`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List energy logs |
| POST | `/` | Log entry — `level` must be 0–100 |

### Overthinking — `/api/overthinking`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List entries |
| POST | `/` | `{ thought }` → AI response in `aiResponse` |

### Simulate — `/api/simulate`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | `{ prompt, scenario?, ... }` → simulated reply |

### Scripts — `/api/scripts`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List scripts |
| POST | `/` | Create |
| PUT | `/:id` | Update |
| DELETE | `/:id` | Delete |

### Goals — `/api/goals`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List goals |
| POST | `/` | Create `{ title, cadence }` |
| PUT | `/:id` | Update (e.g. progress) |
| DELETE | `/:id` | Delete |

## Models (summary)

| Model | Key fields |
|-------|------------|
| **User** | `email`, `passwordHash`, `name` |
| **Profile** | `user`, `bio`, `strengths[]`, `triggers[]` |
| **Conversation** | `user`, `summary`, `participants`, `mood`, `transcript`, `analysis`, … |
| **EnergyLog** | `user`, `level`, `note`, `createdAt` |
| **OverthinkingEntry** | `user`, `thought`, `aiResponse` |
| **ScriptTemplate** | `user`, `title`, `content` |
| **Goal** | `user`, `title`, `cadence`, `progress` |

All user-owned documents include a `user` ObjectId reference. Controllers scope queries by `req.user.id`.

## AI service

`src/services/aiService.js` provides:

- **`analyze(text, opts)`** — conversation/thought analysis
- **`simulate(prompt, opts)`** — conversation simulation replies

If `GEMINI_API_KEY` is set, requests go to the configured Gemini endpoint. Otherwise, structured **stub responses** are returned so the app remains usable without AI keys.

## Security notes

- Passwords hashed with bcrypt (async)
- Emails normalized (lowercase, trim) on auth
- Resource ownership verified on update/delete
- See root [SECURITY.md](../SECURITY.md) for secret handling

## Frontend

The React frontend consumes this API. See [frontend/README.md](../frontend/README.md) and the root [README.md](../README.md).
