from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.marketplace import MarketplaceListingCreate, MarketplaceListingResponse, MarketplaceListingListResponse
from app.services.marketplace import MarketplaceService

router = APIRouter()


@router.get("/listings", response_model=MarketplaceListingListResponse)
async def list_marketplace_listings(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: str | None = None,
    listing_type: str | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await MarketplaceService.list_listings(db, skip, limit, category, listing_type, search)


@router.get("/listings/{listing_id}", response_model=MarketplaceListingResponse)
async def get_marketplace_listing(listing_id: UUID, db: AsyncSession = Depends(get_db)):
    listing = await MarketplaceService.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Marketplace listing not found")
    return listing


@router.post("/listings", response_model=MarketplaceListingResponse)
async def create_marketplace_listing(
    payload: MarketplaceListingCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MarketplaceService.create_listing(db, payload, current_user.id)
