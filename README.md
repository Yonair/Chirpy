# Chirpy

Chirpy is a small TypeScript and Express service for creating and managing short posts ("chirps"). It serves a basic web page, exposes a JSON API, and stores users, chirps, and refresh tokens in PostgreSQL.

## Features

- Create accounts, log in, and update account credentials
- Create, list, retrieve, and delete chirps
- Filter chirps by author, sort them by creation time, and replace selected banned words
- Issue short-lived JWT access tokens and longer-lived refresh tokens
- Revoke refresh tokens
- Upgrade users through an API-key-protected webhook
- Serve the static app and report request metrics

## Requirements

- Node.js 22.14.0 (the repository's `.nvmrc` specifies this version)
- npm
- A PostgreSQL database

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a `.env` file in the repository root:

   ```dotenv
   PORT=8080
   DB_URL=postgres://USER:PASSWORD@localhost:5432/chirpy?sslmode=disable
   SECRET=replace-with-a-long-random-secret
   POLKA_KEY=replace-with-your-webhook-api-key
   # Optional: set to "dev" to enable POST /admin/reset
   PLATFORM=dev
   ```

   `PORT`, `DB_URL`, `SECRET`, and `POLKA_KEY` are required. `PLATFORM` is optional; the reset endpoint is available only when it is set to `dev`. Keep real credentials out of source control.

3. Start the service:

   ```sh
   npm run dev
   ```

   The application runs database migrations during startup and listens at `http://localhost:<PORT>`. The static page is available at `/app`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Compile TypeScript and start the service |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm start` | Start the compiled service from `dist/` |
| `npm test` | Run the Vitest test suite |
| `npm run generate` | Generate a Drizzle migration from the schema |
| `npm run migrate` | Apply migrations using the Drizzle Kit configuration |

## API

Most API endpoints use JSON. The readiness endpoint returns plain text, metrics return HTML, and successful deletion, revocation, and webhook requests return an empty `204` response.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/healthz` | Readiness check; returns `OK` |
| `POST` | `/api/users` | Create a user with `email` and `password` |
| `PUT` | `/api/users` | Update the authenticated user's `email` and `password` |
| `POST` | `/api/login` | Log in with `email` and `password`; returns user data, a JWT, and a refresh token |
| `GET` | `/api/chirps` | List chirps; accepts optional `authorId` and `sort=asc\|desc` query parameters |
| `GET` | `/api/chirps/:chirpId` | Retrieve one chirp |
| `POST` | `/api/chirps` | Create a chirp (JWT required); request body: `{"body":"..."}` |
| `DELETE` | `/api/chirps/:chirpId` | Delete the authenticated user's chirp (JWT required) |
| `POST` | `/api/refresh` | Exchange a valid refresh token for a new JWT |
| `POST` | `/api/revoke` | Revoke a refresh token |
| `POST` | `/api/polka/webhooks` | Handle the `user.upgraded` event (API key required) |
| `GET` | `/admin/metrics` | Return the static app request count as HTML |
| `POST` | `/admin/reset` | Reset the request count and delete users; enabled only with `PLATFORM=dev` |

### Authentication

Send access tokens in the `Authorization` header as `Bearer <token>` for protected user and chirp operations. The refresh and revoke endpoints also accept a refresh token using the `Bearer` scheme. The webhook uses `Authorization: ApiKey <key>`, where the key must match `POLKA_KEY`.

Chirp bodies are limited to 140 characters. The words `kerfuffle`, `sharbert`, and `fornax` are replaced with `****` when a chirp is created.

## Data and migrations

Drizzle ORM maps the PostgreSQL tables defined in `src/db/schema.ts`:

- `users`: email, password hash, timestamps, and Chirpy Red membership
- `chirps`: body, owning user, and timestamps
- `refresh_tokens`: token, owning user, expiration, and revocation timestamps

Migration files are kept in `src/db/migrations`. The application applies pending migrations when it starts.

## Project layout

```text
src/
  api/             Express handlers, authentication, errors, and middleware
  app/             Static app page and assets
  db/
    migrations/    PostgreSQL migration history
    queries/       Database query functions
    schema.ts      Drizzle table definitions
  auth.test.ts     Authentication unit tests
  config.ts        Environment-based configuration
  index.ts         Migration startup and Express route registration
```
