import os
import tempfile
import unittest
from pathlib import Path
from uuid import uuid4

import httpx


_test_database = Path(tempfile.gettempdir()) / f"circularhub-api-test-{uuid4().hex}.db"
os.environ["ENVIRONMENT"] = "development"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_test_database.as_posix()}"
os.environ["SECRET_KEY"] = "test-only-secret-key-that-is-at-least-32-characters"

from app.main import app


class AuthenticationApiTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.lifespan = app.router.lifespan_context(app)
        await self.lifespan.__aenter__()
        self.client_context = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://test",
        )
        self.client = await self.client_context.__aenter__()

    async def asyncTearDown(self):
        await self.client_context.__aexit__(None, None, None)
        await self.lifespan.__aexit__(None, None, None)
        for suffix in ("", "-shm", "-wal"):
            _test_database.with_name(_test_database.name + suffix).unlink(missing_ok=True)

    async def test_health_register_login_and_authenticated_profile(self):
        health = await self.client.get("/health")
        self.assertEqual(health.status_code, 200)
        self.assertEqual(health.json(), {"status": "ok"})

        username = f"api-test-{uuid4().hex[:12]}"
        password = f"Test-{uuid4().hex}-Aa1!"
        registration = await self.client.post(
            "/auth/register",
            json={
                "username": username,
                "email": f"{username}@example.com",
                "password": password,
                "country": "Global",
            },
        )
        self.assertEqual(registration.status_code, 200, registration.text)
        self.assertNotIn("password", registration.json())

        login = await self.client.post(
            "/auth/login",
            json={"username": username, "password": password},
        )
        self.assertEqual(login.status_code, 200, login.text)
        token = login.json()["access_token"]

        profile = await self.client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(profile.status_code, 200, profile.text)
        self.assertEqual(profile.json()["username"], username)

    async def test_profile_requires_a_valid_token(self):
        response = await self.client.get("/auth/me")
        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
