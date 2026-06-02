from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.analytics import AnalyticsOverview, DashboardMetrics
from app.services.analytics import AnalyticsService

router = APIRouter()


@router.get("/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(db: AsyncSession = Depends(get_db)):
    return await AnalyticsService.overview(db)


@router.get("/dashboard", response_model=DashboardMetrics)
async def get_analytics_dashboard(db: AsyncSession = Depends(get_db)):
    return await AnalyticsService.dashboard(db)
