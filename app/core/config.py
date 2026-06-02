import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field, SecretStr

class Settings(BaseSettings):
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

settings = Settings()
