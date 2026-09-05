# VELOOP Rewards Giveaway Platform

VELOOP Rewards is a secure, extensible rewards-giveaway monorepo. It pairs a premium React experience with an Express/MongoDB authority layer. The browser displays a giveaway, but it does not decide balances, entry cost, status, winners, or claims.

> Seeded records and development credentials are explicitly demo-only. They do not represent live VELOOP activity or policy.

## Highlights

- Premium responsive giveaway home, prize detail pages, countdowns, public masked winner history, FAQs, rules, trust content, profile wallet, and protected admin workspace.
- Configurable prizes and entry currencies (`VE`, `SVE`, `TOKEN`) stored in database models—not component conditionals.
- Secure registration/login, short-lived access token, HTTP-only refresh cookie, protected routes, and admin authorization.
- One participation per user/giveaway enforced with a MongoDB compound unique index.
- Server-owned join flow: effective lifecycle, eligibility, giveaway configuration, wallet, amount, and currency are resolved server-side.
- Atomic MongoDB transaction for wallet deduction, entry transaction, participation, and audit logs.
- `Idempotency-Key` handling, atomic conditional balance update, and duplicate-index protections prevent repeat charging.
- Privacy-conscious hashed device/IP signals, risk scoring, fraud-event records, rate limits, input validation, Helmet, restrictive CORS, payload limits, and centralized safe errors.
- Deterministic (HMAC-ranked) admin-only winner selection for auditability, masked public winners, and winner-only claims.

## Repository layout

```text
velop-rewards/
├── frontend/                 # Vite / React / Bootstrap / CSS Modules
│   └── src/
│       ├── components/       # Reusable UI, modals, loaders, states
│       ├── context/          # Auth context
│       ├── layouts/          # Application shell
│       ├── pages/            # Home, detail, auth, winner, profile, admin
│       └── services/         # Centralized API client and domain services
├── backend/
│   └── src/
│       ├── controllers/      # Request/response adapters
│       ├── services/         # Participation, fraud, winners, audit
│       ├── models/           # Mongoose schemas and indexes
│       ├── middleware/       # Security, auth, validation, errors
│       ├── routes/           # REST surfaces
│       ├── seeders/          # Development data
│       └── jobs/             # Lifecycle synchronization
└── README.md
```

## Technology

| Layer | Choice |
| --- | --- |
| Web UI | React 18, Vite, React Router, Bootstrap base, CSS Modules, Lucide, Framer Motion-ready |
| API | Node.js, Express, Mongoose |
| Security | bcryptjs, JWT, Helmet, CORS allowlist, express-rate-limit, express-validator |
| Database | MongoDB replica set / Atlas (transactions required) |
| Tests | Node test runner, Supertest, MongoDB Memory Server replica set |

## Local setup

Prerequisites: Node.js 20+ and MongoDB configured as a replica set. Transactions do **not** work on a standalone MongoDB server. MongoDB Atlas provides replica-set transactions by default.

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
npm run seed
npm run dev
```

The web app is served at `http://localhost:5173`; the API is served at `http://localhost:5000`.

Create distinct long random values for `JWT_SECRET`, `REFRESH_SECRET`, and `WINNER_SELECTION_SECRET` before any non-development use. Do not commit either `.env` file.

### Development seed accounts

All use password `DemoPass123` and are for local development only.

| Role | Email | Purpose |
| --- | --- | --- |
| Participant | `member@velop.demo` | Has sufficient VE, SVE, and Tokens |
| Historical winner | `winner@velop.demo` | Historical winner record |
| Non-winner | `nonwinner@velop.demo` | Historical participant record |
| Insufficient balance | `lowbalance@velop.demo` | Balance error testing |
| Admin | `admin@velop.demo` | Protected administration workspace |

The seed script deliberately clears its development database. Never run `npm run seed` against a production `MONGO_URI`.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB replica-set/Atlas connection string |
| `JWT_SECRET` | Yes | Access-token signing secret |
| `REFRESH_SECRET` | Yes | Refresh-token signing secret; different from JWT secret |
| `WINNER_SELECTION_SECRET` | Yes | Secret for reproducible HMAC winner ordering |
| `CLIENT_URL` | Yes | Comma-separated allowed browser origins |
| `PORT` | No | API port, defaults to `5000` |
| `NODE_ENV` | No | `development`, `test`, or `production` |

## API contract

Responses use a predictable envelope:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "error": { "code": "INSUFFICIENT_VE_BALANCE", "message": "You need 130 more VEs to join this giveaway." } }
```

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/health` | GET | No | Health response |
| `/api/auth/register` | POST | No | Create account and wallet |
| `/api/auth/login` | POST | No | Issue access token + refresh cookie |
| `/api/auth/refresh` | POST | Refresh cookie | Rotate/renew access session |
| `/api/auth/logout` | POST | Yes | Clear refresh session |
| `/api/auth/me` | GET | Yes | Current identity |
| `/api/wallet` | GET | Yes | Display-only balances |
| `/api/giveaways/current` | GET | No | Current/eligible giveaway display data + demo flag |
| `/api/giveaways/previous` | GET | No | Completed events |
| `/api/giveaways/:identifier` | GET | No | Giveaway by slug or ID |
| `/api/giveaways/:id/my-status` | GET | Yes | Signed-in participant/winner status |
| `/api/giveaways/:id/join` | POST | Yes | Secure entry; requires `Idempotency-Key` |
| `/api/giveaways/:id/winners` | GET | No | Masked winners only after selection |
| `/api/giveaways/previous/winners` | GET | No | Masked previous winner list |
| `/api/giveaways/:id/my-claim` | GET | Yes | Winner’s private claim state |
| `/api/giveaways/:id/claim` | POST | Yes | Winner-only claim submission |
| `/api/admin/*` | Various | Admin | Giveaway config, participants, winner draw, claims, fraud, audit logs |

`POST /api/giveaways/:id/join` accepts no price, currency, wallet, prize, or user authority. The server ignores unrelated body fields and derives its own configuration from the route and authenticated session. Send a UUID-like `Idempotency-Key` header; replaying it returns the same logical successful entry rather than a second deduction.

Common error codes include `LOGIN_REQUIRED`, `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `GIVEAWAY_NOT_FOUND`, `GIVEAWAY_NOT_ACTIVE`, `GIVEAWAY_ENDED`, `ALREADY_PARTICIPATING`, `INSUFFICIENT_VE_BALANCE`, `INSUFFICIENT_SVE_BALANCE`, `INSUFFICIENT_TOKEN_BALANCE`, `SUSPICIOUS_ACTIVITY`, `RATE_LIMITED`, `CLAIM_NOT_ALLOWED`, and `CLAIM_EXPIRED`.

## Data model and integrity

The system contains `User`, `Wallet`, `Giveaway`, `Prize`, `GiveawayPrize`, `GiveawayParticipation`, `GiveawayEntryTransaction`, `GiveawayWinner`, `PrizeClaim`, `FraudEvent`, `AuditLog`, and `IdempotencyKey` models.

`GiveawayParticipation` has a unique `{ userId, giveawayId }` index. `IdempotencyKey` has a unique `{ userId, key }` index. Entry transactions retain `balanceBefore` and `balanceAfter`; financial history is never deleted by application logic. A future reversal should create a compensating transaction rather than rewrite history.

The lifecycle job updates `UPCOMING → ACTIVE → ENDED`; the API additionally computes effective lifecycle from server time on sensitive requests. `ARCHIVED` and `WINNERS_SELECTED` records are preserved. Frontend countdowns are presentation only.

## Security and privacy notes

- Browser input is treated as hostile. There is no trusted `userId`, currency, amount, balance, prize type, or winner value in the join/claim flows.
- Sensitive endpoint rate limits are intentionally narrow for login, join, and claim paths.
- Device and IP signals are SHA-256 hashes. A shared IP alone does not block a user; only a high accumulated risk score blocks participation.
- Public winner APIs populate only masked public IDs, prize name/type, event name, and date. They never return email, address, phone, or claim fulfillment fields.
- Claim schema fulfillment data is only returned to authorized administrative claim workflows. Keep database encryption-at-rest enabled in deployment and restrict operations access.
- The frontend access token is stored per browser session for UX; backend validation remains the source of truth. The refresh token is HTTP-only.

## Winner and claim flow

Admins alone can finalize an ended giveaway. The service ranks eligible entries with a server-secret HMAC of the giveaway ID, immutable end time, and participant ID. This produces a reproducible ordering for audit while keeping the secret off the client. It respects the configurable prize winner count and prevents duplicate winners.

Claims derive the prize type from database configuration. Physical items require recipient and delivery fields; gift cards request an email only. The signed-in winner and claim deadline are independently verified by the API.

## Testing

```bash
npm run test
```

The integration suite uses an in-memory MongoDB **replica set** and verifies that modified client values cannot reduce an entry fee, replayed idempotency keys cannot double-charge, and insufficient/ended entries are rejected by server logic. The first test run downloads the MongoDB test binary if it is not cached.

## Build and deployment

```bash
npm run build
npm run start
```

Deploy `frontend/` to Vercel with `API_URI` set to the deployed API URL. Deploy `backend/` to Render, Railway, or another Node host with all server environment variables set. Use MongoDB Atlas (replica set), set `CLIENT_URL` to the exact deployed web origin(s), and set `NODE_ENV=production`.

Before a production launch, replace demo policy wording—including the marked refund placeholder—with VELOOP-approved legal copy, configure durable logging/monitoring, use a secure secrets manager, enable database backups and encryption, and conduct a focused security review.

## Screenshots / live demo

No live deployment or screenshots are committed by default. Run the local app after seeding to review the responsive giveaway, detail, profile, winners, and admin screens.
