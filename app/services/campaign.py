from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.models.campaign import Campaign
from app.schemas.campaign import CampaignCreate
from app.services.engagement import EngagementService


class CampaignService:
    @staticmethod
    async def list_campaigns(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        status: str | None = None,
        campaign_type: str | None = None,
    ):
        filters = []
        if status:
            filters.append(Campaign.status == status)
        if campaign_type:
            filters.append(Campaign.campaign_type == campaign_type)

        query = select(Campaign)
        count_query = select(func.count()).select_from(Campaign)
        if filters:
            query = query.where(*filters)
            count_query = count_query.where(*filters)

        total_result = await db.execute(count_query)
        result = await db.execute(query.order_by(Campaign.created_at.desc()).offset(skip).limit(limit))
        return {
            "items": result.scalars().all(),
            "total": total_result.scalar_one(),
            "skip": skip,
            "limit": limit,
        }

    @staticmethod
    async def get_campaign(db: AsyncSession, campaign_id):
        result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
        return result.scalars().first()

    @staticmethod
    async def create_campaign(db: AsyncSession, payload: CampaignCreate, created_by):
        campaign = Campaign(**payload.model_dump(), created_by=created_by)
        db.add(campaign)
        await db.commit()
        await db.refresh(campaign)
        await EngagementService.log_activity(
            db,
            created_by,
            "campaign_created",
            25,
            "Created a sustainability campaign",
        )
        return campaign

    @staticmethod
    async def update_campaign(db: AsyncSession, campaign_id, payload: CampaignCreate, user_id):
        campaign = await CampaignService.get_campaign(db, campaign_id)
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        if campaign.created_by != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this campaign")

        for key, value in payload.model_dump().items():
            setattr(campaign, key, value)
        await db.commit()
        await db.refresh(campaign)
        return campaign
