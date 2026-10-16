# GupShup Server — Social + Realtime Messaging

Express + Socket.IO + Prisma (PostgreSQL). Replaces the legacy anonymous `ws` rooms
(`server.js` is kept for reference) with authenticated social DMs. The landing-page
guest rooms still work in the client via `/guest`.

## 1. Environment

```bash
cp .env.example .env
# edit DATABASE_URL, JWT_SECRET, CLIENT_ORIGIN
```

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection, e.g. `postgresql://gupshup:gupshup@localhost:5432/gupshup?schema=public` |
| `JWT_SECRET` | signing key (required in production) |
| `JWT_EXPIRES_IN` | default `7d` |
| `PORT` | default `8080` |
| `CLIENT_ORIGIN` | comma-separated allowed origins, e.g. `https://gup-shup-six.vercel.app` |
| `NODE_ENV` | `production` enables Secure cookies |

No Postgres locally here (no `psql`/`docker` on this machine), so migrations were
generated offline and not applied. Apply where a database exists.

## 2. Database setup

```bash
# Postgres 15+ somewhere reachable, then:
npm install
npx prisma migrate deploy   # or: npm run prisma:deploy
# dev loop:
npm run prisma:migrate
```

Optional with Docker elsewhere:

```yaml
# docker-compose.yml (create at repo root if needed)
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: gupshup
      POSTGRES_PASSWORD: gupshup
      POSTGRES_DB: gupshup
    ports: ["5432:5432"]
```

Migration `prisma/migrations/0001_init/migration.sql` creates:
`User`, `FollowRequest` (1 row per sender→receiver pair; re-request after
REJECTED/CANCELLED flips the same row back to PENDING),
`Follow` (mutual pair created in one transaction on accept),
`Conversation` (`pairKey = sortedIds.join(':')` unique for DIRECT),
`ConversationMember` (composite PK), `Message` (`clientMessageId` unique for
idempotent socket retries).

## 3. Run

```bash
npm install
npm test            # 7 unit tests (validation, pairKey, sanitize)
npm start           # node src/index.js
# health:
curl http://localhost:8080/api/health
```

Auth uses HttpOnly cookie `gupshup_token` + `Authorization: Bearer` fallback
for Socket.IO `auth.token` and non-cookie clients.

## 4. REST API

Auth: `POST /api/auth/register|login|logout`, `GET /api/auth/me`
Users: `GET /api/users/search?q=`, `GET /api/users/:username`, `PATCH /api/users/me`
Requests: `POST /api/follow-requests/:userId`, `GET /api/follow-requests/received|sent`,
`PATCH /api/follow-requests/:id {action: accept|reject}`, `DELETE /api/follow-requests/:id`
Follows: `GET /api/follows`, `DELETE /api/follows/:userId`
Conversations: `GET /api/conversations`, `POST /api/conversations/direct/:userId`,
`GET /api/conversations/:id/messages?cursor=&limit=`, `POST /api/conversations/:id/messages`

Messaging requires a mutual `Follow` pair (created transactionally on accept).
No password hashes are ever returned (`publicUser`).

## 5. Socket.IO

Connect with cookie or `io(URL, { auth: { token } })`.

Client → server: `conversation:join`, `conversation:leave`, `message:send`,
`typing:start`, `typing:stop`, `message:read`
Server → client: `message:new`, `message:ack` (via ack callback), `message:error`,
`typing:update`, `presence:update`, `notification:new`

Rules: room `conversation:<id>` joined only after `assertConversationMember`;
`message:send` validates length ≤2000, checks membership, dedupes by
`clientMessageId`, persists via Prisma **before** emitting, then emits with saved
id/sender/timestamp. Offline users get history via paginated REST on reconnect.

Multi-instance: add a shared adapter, e.g. `@socket.io/redis-adapter`, and move
`onlineCounts` presence to Redis. Single-instance in-memory presence is used now.

## 6. Security

Helmet, CORS allowlist, 100kb JSON limit, rate limits (global 300/min,
auth 50/15min, follow-send 60/15min, socket 1 msg/400ms), bcrypt-12, zod
validation, Prisma parameterized queries, no stack traces in prod responses.
