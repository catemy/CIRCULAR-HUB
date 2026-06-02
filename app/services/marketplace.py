from sqlalchemy import func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.marketplace import MarketplaceListing
from app.schemas.marketplace import MarketplaceListingCreate


class MarketplaceService:
    @staticmethod
    async def create_listing(db: AsyncSession, payload: MarketplaceListingCreate, seller_id):
        listing = MarketplaceListing(**payload.model_dump(), seller_id=seller_id)
        db.add(listing)
        await db.commit()
        await db.refresh(listing)
        return listing

    @staticmethod
    async def list_listings(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        category: str | None = None,
        listing_type: str | None = None,
        search: str | None = None,
    ):
        query = select(MarketplaceListing)
        count_query = select(func.count(MarketplaceListing.id))
        filters = []
        if category:
            filters.append(MarketplaceListing.category == category)
        if listing_type:
            filters.append(MarketplaceListing.listing_type == listing_type)
        if search:
            filters.append(or_(
                MarketplaceListing.title.ilike(f"%{search}%"),
                MarketplaceListing.description.ilike(f"%{search}%"),
            ))
        for condition in filters:
            query = query.where(condition)
            count_query = count_query.where(condition)
        total_result = await db.execute(count_query)
        result = await db.execute(query.order_by(MarketplaceListing.created_at.desc()).offset(skip).limit(limit))
        return {"items": result.scalars().all(), "total": total_result.scalar_one(), "skip": skip, "limit": limit}

    @staticmethod
    async def get_listing(db: AsyncSession, listing_id):
        result = await db.execute(select(MarketplaceListing).where(MarketplaceListing.id == listing_id))
        return result.scalars().first()
