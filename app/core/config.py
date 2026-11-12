from typing import Optional
from urllib.parse import urlsplit

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, SecretStr, field_validator, model_validator

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    ENVIRONMENT: str = Field(
        default="development",
        env="ENVIRONMENT",
        description="Runtime environment: development, staging, or production."
    )
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./circularhub.db",
        env="DATABASE_URL",
        description="Async database connection string. Set PostgreSQL in production."
    )
    SECRET_KEY: SecretStr = Field(
        default="supersecretkey",
        env="SECRET_KEY",
        description="JWT signing secret."
    )
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    OPENAI_API_KEY: Optional[SecretStr] = Field(
        default=None,
        env="OPENAI_API_KEY",
        description="OpenAI API key used by AI scanner and assistant integrations."
    )
    OPENAI_VISION_MODEL: str = Field(default="gpt-4o-mini")
    OPENAI_ASSISTANT_MODEL: str = Field(default="gpt-4o-mini")
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        env="ALLOWED_ORIGINS",
        description="Comma-separated CORS origins."
    )
    SQL_ECHO: bool = Field(default=False, env="SQL_ECHO")

    @field_validator("ENVIRONMENT", mode="before")
    @classmethod
    def normalize_environment(cls, value: str) -> str:
        return value.strip().lower()

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip().rstrip("/") for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @model_validator(mode="after")
    def validate_production_settings(self):
        if self.ENVIRONMENT not in {"development", "staging", "production"}:
            raise ValueError("ENVIRONMENT must be development, staging, or production.")

        if self.ENVIRONMENT == "development":
            return self

        if len(self.SECRET_KEY.get_secret_value()) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters outside development.")
        if urlsplit(self.DATABASE_URL).scheme not in {"postgres", "postgresql", "postgresql+asyncpg"}:
            raise ValueError("DATABASE_URL must use PostgreSQL outside development.")
        if not self.allowed_origins_list:
            raise ValueError("ALLOWED_ORIGINS must include the public frontend origin outside development.")
        for origin in self.allowed_origins_list:
            parsed_origin = urlsplit(origin)
            if (
                parsed_origin.scheme != "https"
                or not parsed_origin.hostname
                or parsed_origin.path
                or parsed_origin.query
                or parsed_origin.fragment
                or parsed_origin.username
                or parsed_origin.password
                or "*" in origin
            ):
                raise ValueError("ALLOWED_ORIGINS must contain exact HTTPS origins outside development.")
            try:
                parsed_origin.port
            except ValueError as exc:
                raise ValueError("ALLOWED_ORIGINS contains an invalid port.") from exc
        if self.SQL_ECHO:
            raise ValueError("SQL_ECHO must be disabled outside development.")
        return self

settings = Settings()
