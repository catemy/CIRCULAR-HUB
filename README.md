# CircularHub

CircularHub is a multi-tier sustainability platform for waste education, reuse collaboration, and environmental impact tracking.

## What this project includes

- FastAPI backend with token-based authentication, role-aware routing, and API docs.
- React + Vite frontend with user onboarding, campaign dashboards, marketplace previews, and an admin console.
- Seeded demo content for users, videos, articles, waste categories, campaigns, and impact metrics.
- Support for institutions, community posts, and AI-assisted waste guidance.

## Local setup

1. Create and activate your Python environment.
2. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment variables:
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `ALLOWED_ORIGINS` (comma-separated CORS origins)
   - `ENVIRONMENT` (`development`, `staging`, or `production`)
   - `OPENAI_API_KEY` for AI scanner and sustainability assistant support
   - `OPENAI_ASSISTANT_MODEL` (optional; defaults to `gpt-4o-mini`)
4. Start the backend:
   ```bash
   uvicorn app.main:app --reload
   ```
5. Seed demo data:
   ```bash
   python seed.py
   ```
6. Validate the API auth flow locally (the smoke test creates a uniquely named test account):
   ```bash
   python auth_test.py
   ```
   To target another environment, set `CIRCULARHUB_API_URL` explicitly.
7. Start the frontend:
   ```bash
   npm install
   npm run dev
   ```

## API highlights

- Auth: `/auth/register`, `/auth/login`, `/auth/me`, `/auth/reset-password`
- Users: `/users/` (admin only), `/users/me`
- Articles: `/articles/`, `/articles/{id}`
- Marketplace: `/marketplace/listings`, `/marketplace/listings/{id}`
- Waste, campaigns, posts, analytics, AI, and more are available under dedicated router prefixes.
- Authenticated sustainability assistant: `POST /ai/assistant/chat` with a `{ "question": "..." }` body.

## Recent product improvements

- Global search across waste guides, courses, campaigns, community posts, and marketplace listings.
- Compact mobile navigation with access to every app section.
- Campaign organizers can define milestones; participants can record updates and optional evidence links. Campaign evidence is currently stored in the browser, not synchronized between devices.
- The sustainability assistant uses the configured backend AI provider for signed-in users and clearly labels its local fallback guidance.

## Improvements added

- environment-aware CORS in `app/main.py`
- admin user listing endpoint in `app/routers/users.py`
- consistent user role defaults and onboarding fields in `app/models/user.py`
- backend auth token path fix in `app/routers/auth.py`
- enhanced frontend auth flow in `src/main.jsx`
- richer project metadata and docs guidance

## Permanent deployment (Render)

This repository now includes deployment-ready files for a permanent hosted setup:

- `render.yaml` for the backend API, PostgreSQL database, and static frontend
- `Procfile` for the backend web process

The checked-in Render blueprint is configured for **free-tier staging/demo**, not production availability. It uses generated secrets and strict staging configuration. The frontend origin is set to `https://circularhub-web.onrender.com`; update `ALLOWED_ORIGINS` if Render assigns a different URL or you attach a custom domain.

Staging deployment flow:

1. Create a Render account and connect this GitHub repository.
2. Render will read `render.yaml` and provision:
   - a Python web service for the API
   - a PostgreSQL database
   - a static site for the frontend
3. Keep this free-tier deployment for staging/demo only; confirm its database lifetime and data-retention limits in Render.
4. Deploy. The API applies Alembic migrations before starting, exposes `/health` for database-aware health checks, and receives the static site's exact URL for CORS. The frontend receives the API URL at build time.
5. If using a custom frontend domain, update the API's `ALLOWED_ORIGINS` to that exact HTTPS origin in Render.

## Production launch notes

- Set `ENVIRONMENT=production`.
- Use PostgreSQL through `DATABASE_URL`; SQLite is for local development only.
- Set a unique random `SECRET_KEY` of at least 32 characters. Non-development environments reject short keys, wildcard/non-HTTPS CORS origins, SQLite, and SQL statement logging.
- Set `ALLOWED_ORIGINS` to exact HTTPS frontend origins. The Render blueprint uses the named static-site URL; verify it after provisioning and add any custom domain explicitly.
- Schema changes are tracked under `alembic/versions`. Render runs `alembic upgrade head` before starting the API. Review and test each migration against a staging database and back up production before applying changes. Existing databases that were created outside Alembic need a reviewed baseline/stamp plan before the first migration deploy.
- Set `VITE_API_BASE_URL` for the frontend build if the API is not served from the same origin.
- Do not seed demo accounts or demo passwords in production.
- Run `python -m unittest discover -s tests -v` and `python auth_test.py` against staging before public launch. The auth smoke test creates a unique account; use it only where test registrations are acceptable.
- The checked-in free-tier deployment is suitable for evaluation, not a production availability or data-retention commitment. For production, select paid service/database plans, set exact allowed frontend origins, and confirm uptime, retention/backups, monitoring, and restore procedures against your operational requirements.

## Notes

- The frontend reads `VITE_API_BASE_URL` and defaults to same-origin in production or `http://localhost:8000` in development.
- API docs are available at `/docs` and OpenAPI schema at `/openapi.json` outside production. `/health` performs a database connectivity check and is used by Render health checks.
- The seeded admin account is for local/demo use only.
