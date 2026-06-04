from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field, SecretStr, model_validator

class Settings(BaseSettings):
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
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        env="ALLOWED_ORIGINS",
        description="Comma-separated CORS origins."
    )
    SQL_ECHO: bool = Field(default=False, env="SQL_ECHO")

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @model_validator(mode="after")
    def validate_production_settings(self):
        if not self.is_production:
            return self

        if self.SECRET_KEY.get_secret_value() == "supersecretkey":
            raise ValueError("SECRET_KEY must be set to a strong unique value in production.")
        if self.DATABASE_URL.startswith("sqlite"):
            raise ValueError("DATABASE_URL must use a production database in production.")
        if any("localhost" in origin or "127.0.0.1" in origin for origin in self.allowed_origins_list):
            raise ValueError("ALLOWED_ORIGINS must contain only production origins in production.")
        return self

settings = Settings()
