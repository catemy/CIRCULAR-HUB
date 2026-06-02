from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy import text
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

engine = create_async_engine(DATABASE_URL, echo=True)

async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session() as session:
        yield session


async def ensure_sqlite_dev_schema():
    if not DATABASE_URL.startswith("sqlite"):
        return

    table_columns = {
        "waste_categories": {
            "classification": "VARCHAR(120)",
            "decomposition_timeline": "VARCHAR(255)",
            "disposal_methods": "JSON",
            "environmental_impact": "TEXT",
            "recycling_methods": "JSON",
            "reuse_opportunities": "JSON",
            "safety_precautions": "JSON",
            "industry_relevance": "JSON",
            "related_educational_resources": "JSON",
            "infographic_media": "JSON",
        },
        "posts": {
            "waste_categories_used": "JSON",
            "environmental_value": "TEXT",
            "materials_used": "JSON",
            "project_steps": "JSON",
            "before_media_url": "VARCHAR(500)",
            "after_media_url": "VARCHAR(500)",
            "educational_references": "JSON",
            "collaboration_tags": "JSON",
        },
        "users": {
            "role": "VARCHAR(20)",
            "profile_image_url": "VARCHAR(500)",
            "country": "VARCHAR(100)",
            "onboarding_complete": "BOOLEAN",
            "interests": "JSON",
            "goals": "JSON",
            "badges": "JSON",
            "points": "INTEGER",
            "badge_level": "INTEGER",
            "followers_count": "INTEGER",
            "following_count": "INTEGER",
        },
        "marketplace_listings": {
            "currency": "VARCHAR(12)",
            "carbon_insight": "TEXT",
            "availability": "VARCHAR(120)",
        },
    }

    async with engine.begin() as conn:
        for table_name, columns in table_columns.items():
            existing_result = await conn.execute(text(f"PRAGMA table_info({table_name})"))
            existing_columns = {row[1] for row in existing_result.fetchall()}
            for column_name, column_type in columns.items():
                if column_name not in existing_columns:
                    await conn.execute(
                        text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")
                    )
