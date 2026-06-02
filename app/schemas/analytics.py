from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    users: int
    institutions: int
    waste_categories: int
    innovation_posts: int
    articles: int
    campaigns: int
    engagement_events: int
    sustainability_score: int


class DashboardMetrics(BaseModel):
    tons_tracked: int
    institutions: int
    communities: int
    education_hours: int
    sustainability_score: int
