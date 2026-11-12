import asyncio
from app.core.config import settings
from app.database import async_session, engine, Base, ensure_sqlite_dev_schema
from app.models import User, Video, Article, WasteCategory, ImpactMetric
from app.core.security import get_password_hash

async def seed_data():
    if settings.ENVIRONMENT != "development":
        raise RuntimeError("Demo seed data is only allowed when ENVIRONMENT=development.")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await ensure_sqlite_dev_schema()

    async with async_session() as session:
        # Create users
        user1 = User(
            username="eco_warrior",
            email="eco@example.com",
            password_hash=get_password_hash("password123"),
            bio="Love recycling",
            role="Admin",
            country="Global",
            onboarding_complete=True,
            points=20,
            badge_level=2
        )
        user2 = User(
            username="craft_master",
            email="craft@example.com",
            password_hash=get_password_hash("password123"),
            bio="DIY expert",
            role="Individual",
            country="Nigeria",
            onboarding_complete=False,
            points=15,
            badge_level=1
        )
        session.add(user1)
        session.add(user2)
        await session.commit()

        # Create videos
        video1 = Video(
            title="How to recycle plastic",
            caption="Step by step guide",
            tags=["recycle", "plastic"],
            video_url="http://example.com/video1.mp4",
            user_id=user1.id
        )
        video2 = Video(
            title="Turn waste into art",
            caption="Creative ideas",
            tags=["art", "waste"],
            video_url="http://example.com/video2.mp4",
            user_id=user2.id
        )
        session.add(video1)
        session.add(video2)
        await session.commit()

        # Create articles
        article1 = Article(
            title="Waste Management Basics",
            content="Learn the basics of waste management...",
            category="Education"
        )
        article2 = Article(
            title="DIY from Trash",
            content="Ideas for reusing trash...",
            category="DIY"
        )
        session.add(article1)
        session.add(article2)
        await session.commit()

        # Create waste categories
        waste1 = WasteCategory(
            name="Plastic Bottles",
            hazard_level="Low",
            description="PET plastic bottles used for beverages",
            proper_disposal_method="Rinse and recycle at designated bins",
            recycling_potential="High - can be remade into new bottles or textiles",
            creative_reuse_ideas=["Make planters", "Create bird feeders", "Craft jewelry"]
        )
        waste2 = WasteCategory(
            name="Organic Waste",
            hazard_level="Low",
            description="Food scraps and biodegradable materials",
            proper_disposal_method="Compost or use in biogas production",
            recycling_potential="Medium - converts to compost or energy",
            creative_reuse_ideas=["Make compost for gardening", "Feed to animals", "Create natural dyes"]
        )
        waste3 = WasteCategory(
            name="Electronic Waste",
            hazard_level="High",
            description="Old electronics containing hazardous materials",
            proper_disposal_method="Take to certified e-waste recycling centers",
            recycling_potential="High - metals and components can be recovered",
            creative_reuse_ideas=["Repurpose components for art", "Donate working parts", "Upcycle into new devices"]
        )
        session.add(waste1)
        session.add(waste2)
        session.add(waste3)
        await session.commit()

        # Create dashboard progress metrics
        metric_tons = ImpactMetric(
            subject_type="system",
            metric_name="tons_tracked",
            metric_value=12400000,
        )
        metric_communities = ImpactMetric(
            subject_type="system",
            metric_name="communities",
            metric_value=94,
        )
        metric_education = ImpactMetric(
            subject_type="system",
            metric_name="education_hours",
            metric_value=186000,
        )
        session.add(metric_tons)
        session.add(metric_communities)
        session.add(metric_education)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(seed_data())