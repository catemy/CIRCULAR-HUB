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
3. Optionally configure environment variables:
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `ALLOWED_ORIGINS` (comma-separated CORS origins)
4. Start the backend:
   ```bash
   uvicorn app.main:app --reload
   ```
5. Seed demo data:
   ```bash
   python seed.py
   ```
6. Start the frontend:
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

## Improvements added

- environment-aware CORS in `app/main.py`
- admin user listing endpoint in `app/routers/users.py`
- consistent user role defaults and onboarding fields in `app/models/user.py`
- backend auth token path fix in `app/routers/auth.py`
- enhanced frontend auth flow in `src/main.jsx`
- richer project metadata and docs guidance

## Notes

- The frontend reads `VITE_API_BASE_URL` and defaults to `http://localhost:8000`.
- API docs are available at `/docs` and OpenAPI schema at `/openapi.json`.
- The seeded admin account is configured with role `Admin`."}