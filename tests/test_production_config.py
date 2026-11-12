import unittest

from pydantic import ValidationError

from app.core.config import Settings
from app.database import async_database_url


class ProductionConfigTests(unittest.TestCase):
    def make_settings(self, **overrides):
        values = {
            "ENVIRONMENT": "production",
            "DATABASE_URL": "postgresql://user:password@db.example.com/circularhub",
            "SECRET_KEY": "a" * 48,
            "ALLOWED_ORIGINS": "https://circularhub.example.com",
            "SQL_ECHO": False,
        }
        values.update(overrides)
        return Settings(**values)

    def test_accepts_exact_https_origin_and_strong_database_settings(self):
        settings = self.make_settings(ALLOWED_ORIGINS="https://circularhub.example.com/")
        self.assertEqual(settings.allowed_origins_list, ["https://circularhub.example.com"])

    def test_staging_requires_production_grade_origins_and_database(self):
        settings = self.make_settings(ENVIRONMENT="staging")
        self.assertEqual(settings.ENVIRONMENT, "staging")
        with self.assertRaises(ValidationError):
            self.make_settings(ENVIRONMENT="staging", ALLOWED_ORIGINS="*")

    def test_rejects_wildcard_cors_origin(self):
        with self.assertRaises(ValidationError):
            self.make_settings(ALLOWED_ORIGINS="*")

    def test_rejects_non_postgresql_production_database(self):
        with self.assertRaises(ValidationError):
            self.make_settings(DATABASE_URL="sqlite+aiosqlite:///./local.db")

    def test_rejects_short_production_secret(self):
        with self.assertRaises(ValidationError):
            self.make_settings(SECRET_KEY="too-short")

    def test_rejects_sql_logging_in_production(self):
        with self.assertRaises(ValidationError):
            self.make_settings(SQL_ECHO=True)

    def test_normalizes_render_postgres_url_for_async_driver(self):
        url = async_database_url("postgres://user:password@db.example.com/circularhub")
        self.assertEqual(url.drivername, "postgresql+asyncpg")
        self.assertEqual(url.password, "password")


if __name__ == "__main__":
    unittest.main()
