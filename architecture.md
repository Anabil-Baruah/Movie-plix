# MoviePlix Architecture

## Introduction
MoviePlix is a full‑stack OTT application for discovering and managing movies and TV shows. The system integrates with TMDB for content, provides user authentication and profiles, and exposes a clean separation between the frontend and backend. All TMDB requests are proxied through the backend with an aggressive caching layer to reduce latency and external API usage.

## Architecture Diagram
```
+------------------+           +----------------+           +------------------+
|     Frontend     |  /api/*   |     Backend    |  TMDB API |      TMDB        |
|  React + Vite    +---------->+  Express       +---------->+  v3/v4 endpoints |
|  (Nginx in prod) |           |  Cache Layer   |           +------------------+
|                  |           |  Redis/Memory  |                 ^
| Calls /api/tmdb  |           |                |                 |
| Never uses TMDB  |           | Auth, Profiles |        +------------------+
| creds directly   |           | MongoDB        |        |     MongoDB      |
+------------------+           +----------------+        +------------------+
```

## Components
- Frontend: React (Vite), Redux Toolkit, React Router; served by Nginx in production
- Backend: Node.js (Express), JWT auth, CORS; TMDB proxy and caching services
- Cache: Redis preferred, NodeCache fallback
- Data: MongoDB (Atlas or local) for user/auth/profile data
- Third‑party: TMDB v3/v4 API (proxied by backend)

## Data Flow (TMDB Proxy)
1. Frontend calls `GET /api/tmdb/<path>` (e.g., `/trending/movie/day`).
2. Backend determines cache key by path + sorted query.
3. Backend checks Redis (or memory) for cached payload.
4. On cache miss, backend attaches TMDB auth and fetches from TMDB.
5. Result stored with TTL based on endpoint type; response returned to client.
6. For daily trending errors, backend retries weekly trending as a safe fallback.

## Routes and Endpoints
### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `POST /api/auth/verify` — Verify JWT
- `GET /api/auth/me` — Current user

### Health
- `GET /api/health` — API health check

### TMDB Proxy (examples)
- `GET /api/tmdb/configuration`
- `GET /api/tmdb/trending/all/day`
- `GET /api/tmdb/trending/movie/day`
- `GET /api/tmdb/movie/top_rated`
- `GET /api/tmdb/movie/popular`
- `GET /api/tmdb/genre/tv/list`
- `GET /api/tmdb/tv/:id`
- `GET /api/tmdb/tv/:id/similar`
- `GET /api/tmdb/movie/:id`
- `GET /api/tmdb/movie/:id/credits`
- `GET /api/tmdb/search/:type` (with `query` parameter)

## Caching Strategy
Caching is applied to all TMDB GET requests.

### TTL Matrix
- Trending: 6 hours
- Popular: 6 hours
- Details (`/movie/:id`, `/tv/:id`): 24 hours
- Credits: 24 hours
- Search: 15 minutes
- Default: 1 hour

### Implementation
- Helper: `fetchAndCache(cacheKey, fetchFn, ttl)`
  - Checks cache
  - Calls `fetchFn` on miss
  - Stores response with TTL
- Cache key: path + sorted query params
- Auth: prefers TMDB v4 Bearer token; if absent, falls back to v3 api key

Locations:
- `server/services/cache.js` — Redis client and NodeCache fallback
- `server/services/tmdbService.js` — TTL selection, cache key build, proxy fetch
- `server/routes/tmdbRoutes.js` — Route wiring and trending fallback

## Deployment (Docker Compose)
- `web` service: builds frontend, serves via Nginx on `8080`
- `api` service: Express backend on `5000`
- `mongo` service: MongoDB on `27017`
- Optional `redis` service: Redis on `6379`

### Ports
- Frontend (Nginx): `http://localhost:8080`
- Backend (API): `http://localhost:5000`

## Configuration Keys
### Backend (`server/.env`)
- `APP_PORT` — API port (default 5000)
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET`, `JWT_EXPIRE` — JWT configuration
- `CORS_ORIGIN` — Allowed frontend origin
- `TMDB_TOKEN` — TMDB v4 Bearer token (preferred)
- `TMDB_API_KEY` — TMDB v3 API key (fallback)
- `REDIS_URL` — Redis connection URL (optional)

### Frontend (`frontend/.env`)
- `VITE_API_URL` — API base URL (e.g., `http://localhost:5000/api`)

## Notes
- Frontend never stores TMDB credentials; all requests go through `/api/tmdb/*`.
- If Redis is unavailable, caching automatically falls back to in‑memory.
- Ensure CORS origin matches the frontend domain (e.g., `http://localhost:8080` in Docker).