## Overview

This repository implements a small Pokemon team manager with a FastAPI backend and a React + Vite frontend. The backend lives in `backend/` and exposes a simple REST API under `/api/*`. The frontend lives in `frontend/` and uses `axios` with a base URL of `http://localhost:9000/api` (see `frontend/src/services/api.js`).

## Big-picture architecture

- Backend: FastAPI app in `backend/main.py`. Key routes:
  - `/api/pokemon` and `/api/pokemon/{name}` — proxies to PokeAPI and return minimal fields (id, name, image, stats).
  - `/api/team` — team management implemented in `backend/routes/team.py`. Endpoints include:
    - `GET /api/team/` — returns the single Team (creates one if missing)
    - `POST /api/team/{team_id}/add` — adds a pokemon to a team (max 6)
    - `DELETE /api/team/remove/{name}` — removes a pokemon by name

- Data models: `backend/models.py` defines `User`, `Team`, `Pokemon` with SQLAlchemy and uses a local SQLite DB `pokemoncrew.db` configured in `backend/database.py`.

- Frontend: Vite + React. Entry is `frontend/src/main.jsx` and `App.jsx` currently mounts `Pokedex` page. Components of interest:
  - `frontend/src/pages/Pokedex.jsx` — search and list pokemon; opens `PokemonDetail` modal.
  - `frontend/src/components/PokemonCard.jsx` — shows a pokemon with a favorite star; it toggles team membership by calling `POST /team/add` and `DELETE /team/remove/{name}`.
  - `frontend/src/pages/MyTeam.jsx` — lightweight team UI (incomplete / inconsistent with backend routes; see notes below).

## Project-specific conventions and gotchas

- Single-team assumption: Backend `team` routes use the first `Team` row (no auth). Frontend components often assume a single team object rather than multiple teams.
- API base URL: `frontend/src/services/api.js` uses `http://localhost:9000/api`. FastAPI runs by default on port 8000; the project likely expects a proxy or different run command. Verify how backend is started (script or manual uvicorn call) and match ports.
- Route mismatches: Frontend's `MyTeam.jsx` expects endpoints like `POST /team/` (to create a team) while backend routes define `POST /team/{team_id}/add`. Adjust frontend or add backend routes to reconcile these.
- PokeAPI proxy: Backend fetches PokeAPI and transforms results; frontend expects `name` capitalized and an `image` field.

## Helpful files to open when making changes

- `backend/routes/team.py` — team endpoints and behavior (max 6 pokemon, uniqueness by name).
- `backend/main.py` — CORS origin (currently `http://localhost:5173`) and included routers.
- `frontend/src/services/api.js` — axios baseURL used in all frontend requests.
- `frontend/src/components/PokemonCard.jsx` — example of toggling a pokemon in/out of team using `api.post('/team/add', ...)` and `api.delete('/team/remove/${name}')`.

## Examples of patterns to follow when editing code

- When calling backend endpoints from the frontend, use `api` (axios instance) from `frontend/src/services/api.js` so requests respect the configured baseURL.
- Team mutation semantics:
  - Add: backend expects `POST /api/team/{team_id}/add` with body `{ name, image }` (see `schemas.PokemonCreate`).
  - Remove: `DELETE /api/team/remove/{name}`.
  - Read: `GET /api/team/` returns `Team` with `pokemons` array.

## Small tasks & fixes commonly needed

- Fix port mismatch: ensure frontend `api.baseURL` matches the backend port used when running FastAPI (common run: `uvicorn backend.main:app --reload --port 9000`).
- Align `MyTeam.jsx` with backend routes: either change frontend to call the `add` route with a `team_id` (the `GET /api/team/` response includes `id`) or add a `POST /api/team/` route in backend if multiple teams are desired.

## Quick reproduction steps (developer workflows)

1. Start backend (from repository root):

```pwsh
# from repo root (ensure python env installed with FastAPI, httpx, sqlalchemy)
uvicorn backend.main:app --reload --port 9000
```

2. Start frontend (from `frontend/`):

```pwsh
cd frontend
npm install
npm run dev
```

If ports differ, update `frontend/src/services/api.js` or the uvicorn port.

## What to look for when adding features

- Check `backend/schemas.py` and `backend/models.py` for the data shapes.
- Be aware that `Team` creation is implicit in `GET /api/team/` — callers rely on a team existing.
- `PokemonCard.jsx` toggles favorite by assuming `POST /team/add` and `DELETE /team/remove/{name}` return a 200 status and updated team; error handling is minimal and logged to console.

## Where tests and linting live

No automated tests were found in the repository. Linting likely follows frontend default (ESLint). Add tests to `backend/` using pytest and `frontend/` using your preferred React testing setup when adding behavior-critical code.

---
If any parts above look wrong or you want the instructions to focus on a different area (e.g., deployment, adding auth), tell me and I will update the file.
