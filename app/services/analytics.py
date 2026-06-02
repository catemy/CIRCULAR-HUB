from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import User, Institution, WasteCategory, Article, EngagementLog, Post, Campaign, ImpactMetric


class AnalyticsService:
    @staticmethod
    async def _count(db: AsyncSession, model) -> int:
        result = await db.execute(select(func.count()).select_from(model))
        return result.scalar_one()

    @staticmethod
    async def _sum_metric(db: AsyncSession, metric_name: str) -> int:
        result = await db.execute(
            select(func.coalesce(func.sum(ImpactMetric.metric_value), 0)).where(
                ImpactMetric.metric_name == metric_name
            )
        )
        return result.scalar_one() or 0

    @staticmethod
    async def calculate_sustainability_score(
        users: int,
        institutions: int,
        waste_categories: int,
        innovation_posts: int,
        articles: int,
        campaigns: int,
        engagement_events: int,
    ) -> int:
        score = (
            min(waste_categories * 4, 32)
            + min(institutions * 3, 18)
            + min(innovation_posts * 2, 20)
            + min(articles * 2, 12)
            + min(campaigns * 5, 15)
            + min(engagement_events, 20)
            + min(users, 10)
        )
        return min(score, 100)

    @staticmethod
    async def overview(db: AsyncSession):
        users = await AnalyticsService._count(db, User)
        institutions = await AnalyticsService._count(db, Institution)
        waste_categories = await AnalyticsService._count(db, WasteCategory)
        innovation_posts = await AnalyticsService._count(db, Post)
        articles = await AnalyticsService._count(db, Article)
        campaigns = await AnalyticsService._count(db, Campaign)
        engagement_events = await AnalyticsService._count(db, EngagementLog)
        sustainability_score = await AnalyticsService.calculate_sustainability_score(
            users,
            institutions,
            waste_categories,
            innovation_posts,
            articles,
            campaigns,
            engagement_events,
        )
        return {
            "users": users,
            "institutions": institutions,
            "waste_categories": waste_categories,
            "innovation_posts": innovation_posts,
            "articles": articles,
            "campaigns": campaigns,
            "engagement_events": engagement_events,
            "sustainability_score": sustainability_score,
        }

    @staticmethod
    async def dashboard(db: AsyncSession):
        institutions = await AnalyticsService._count(db, Institution)
        tons_tracked = await AnalyticsService._sum_metric(db, "tons_tracked")
        communities = await AnalyticsService._sum_metric(db, "communities")
        education_hours = await AnalyticsService._sum_metric(db, "education_hours")

        users = await AnalyticsService._count(db, User)
        waste_categories = await AnalyticsService._count(db, WasteCategory)
        innovation_posts = await AnalyticsService._count(db, Post)
        articles = await AnalyticsService._count(db, Article)
        campaigns = await AnalyticsService._count(db, Campaign)
        engagement_events = await AnalyticsService._count(db, EngagementLog)

        sustainability_score = await AnalyticsService.calculate_sustainability_score(
            users,
            institutions,
            waste_categories,
            innovation_posts,
            articles,
            campaigns,
            engagement_events,
        )

        return {
            "tons_tracked": tons_tracked,
            "institutions": institutions,
            "communities": communities,
            "education_hours": education_hours,
            "sustainability_score": sustainability_score,
        }
