# MoviePlix Application

Full‑stack OTT application built with React (Vite), Node.js (Express), MongoDB, and TMDB integration. The frontend never calls TMDB directly; all TMDB requests go through the backend proxy with server‑side caching.

Demo: [Open demo-link](https://movie-plix.netlify.app/)

## Tech Stack
- Frontend: React 18, Vite, Redux Toolkit, React Router, Axios, Sass, Nginx (container)
- Backend: Node.js, Express, Mongoose, JWT, CORS, dotenv
- Caching: Redis (preferred) with NodeCache fallback
- Data: MongoDB (Atlas or local)
- Third‑party API: TMDB v3/v4 (proxied by backend)
- Containerization: Docker, Docker Compose

## New Architecture Overview
- TMDB API calls are handled entirely in the Node.js backend; the React frontend never communicates with TMDB directly.
- A TMDB Proxy API layer exists at `/api/tmdb/*` that forwards requests to TMDB with server‑side authentication.
- The backend includes a caching layer using Redis (e.g., Upstash) with fallback to in‑memory Node‑Cache.
- API keys and secrets are not exposed to the frontend.
- The system follows a cleaner separation of concerns: UI in frontend, data access and integration in backend.

## Project Structure
```
movie_app/
  frontend/
    src/
      components/ ...
      pages/ ...
      services/ ...
      store/ ...
      utils/api.js
    Dockerfile
    nginx/default.conf
    package.json
  server/
    routes/
      authRoutes.js
      recommendationRoutes.js
      tmdbRoutes.js
    services/
      cache.js
      tmdbService.js
    models/
      User.js
    middleware/
      authMiddleware.js
    utils/
      generateToken.js
    Dockerfile
    server.js
    package.json
  docker-compose.yml
```

## Environment Configuration

### Backend (`server/.env`)
```
APP_PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/movieplix

# JWT
JWT_SECRET=change-me
JWT_EXPIRE=7d

# Optional email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=app-password
EMAIL_FROM="MoviePlix <you@example.com>"

# CORS
CORS_ORIGIN=http://localhost:8080

# TMDB (use ONE of these)
TMDB_TOKEN=<tmdb_v4_bearer_token>
# or
TMDB_API_KEY=<tmdb_v3_api_key>

# Redis (optional; falls back to memory if absent)
REDIS_URL=redis://localhost:6379
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:5000/api
```

## Running Locally
### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend dev server runs on `5173`; ensure `VITE_API_URL` points at the backend.

## Docker
Build and run both services (plus MongoDB) with Compose:
```bash
docker compose up -d --build
```
- Web (Nginx + built frontend): `http://localhost:8080`
- API (Express): `http://localhost:5000`
- Compose proxies `/api/*` from the web container to the API container.

## Backend Features
- Authentication: `register`, `login`, `verify`, `me`
- TMDB proxy: `GET /api/tmdb/*` forwards to TMDB with server credentials (Bearer token or API key)
- Caching: Redis with memory fallback; automatic TTL by endpoint type
  - Trending: 6h
  - Popular: 6h
  - Details (`/movie/:id`, `/tv/:id`): 24h
  - Credits: 24h
  - Search: 15m
  - Default: 1h
- Environment variables: requires TMDB credentials (`TMDB_TOKEN` or `TMDB_API_KEY`), database config, and optional `REDIS_URL`.
- If Redis is not available, caching automatically falls back to in‑memory Node‑Cache.

## API Endpoints (Selected)
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `POST /api/auth/verify` — Verify token
- `GET /api/auth/me` — Current user
- `GET /api/health` — Health check
- `GET /api/tmdb/*` — TMDB proxy (e.g., `/trending/movie/day`, `/movie/top_rated`, `/genre/tv/list`)

### TMDB Proxy Examples
```http
# Configuration
GET /api/tmdb/configuration

# Trending
GET /api/tmdb/trending/all/day
GET /api/tmdb/trending/movie/day

# Popular and Top Rated
GET /api/tmdb/movie/popular
GET /api/tmdb/movie/top_rated

# Details and Credits
GET /api/tmdb/movie/278
GET /api/tmdb/movie/278/credits
GET /api/tmdb/tv/66732
GET /api/tmdb/tv/66732/similar

# Search
GET /api/tmdb/search/movie?query=Inception
```

## Frontend Integration
- All data requests go through `frontend/src/utils/api.js` to the backend (`/api/tmdb/...`).
- On app init, frontend fetches TMDB configuration and genres; guards prevent UI errors if a response fails.
- Frontend no longer communicates with TMDB directly; performance improves via cached responses.
- Better security because no TMDB keys exist in the frontend.

## Troubleshooting
- 401/500 from TMDB proxy: ensure `TMDB_TOKEN` or `TMDB_API_KEY` are set (use one, not both)
- CORS: `CORS_ORIGIN` must match the frontend origin (e.g., `http://localhost:8080` for Docker web)
- Ports in use: backend defaults to `5000`; ensure no other process is bound
- Redis optional: if not reachable, cache falls back to in‑memory

## Scripts
- Backend: `npm run dev`, `npm start`
- Frontend: `npm run dev`, `npm run build`, `npm run preview`

## Redis Setup Instructions
- Upstash: create a new Redis database and copy the `UPSTASH_REDIS_URL` (usually `rediss://...`).
- Set `REDIS_URL` in `server/.env` to your Upstash URL.
- Test connection:
  - Start the backend and call the same TMDB endpoint twice (e.g., `/api/tmdb/movie/top_rated`). The second call should be faster and served from cache.
  - If Redis is unreachable, the backend logs continue normally and caching will use in‑memory Node‑Cache.
- Fallback behavior: when Redis is not available, caching automatically falls back to Node‑Cache without code changes.

For a deeper dive (architecture, routes, caching flow), see `architecture.md`.

