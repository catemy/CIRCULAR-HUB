from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.campaign import CampaignCreate, CampaignResponse, CampaignListResponse
from app.services.campaign import CampaignService

router = APIRouter()


@router.get("/", response_model=CampaignListResponse)
async def list_campaigns(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = None,
    campaign_type: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await CampaignService.list_campaigns(
        db,
        skip=skip,
        limit=limit,
        status=status,
        campaign_type=campaign_type,
    )


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: UUID, db: AsyncSession = Depends(get_db)):
    campaign = await CampaignService.get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.post("/", response_model=CampaignResponse)
async def create_campaign(
    payload: CampaignCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await CampaignService.create_campaign(db, payload, current_user.id)


@router.put("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: UUID,
    payload: CampaignCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await CampaignService.update_campaign(db, campaign_id, payload, current_user.id)
