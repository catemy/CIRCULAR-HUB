from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from app.models.waste_category import WasteCategory
from app.schemas.waste import WasteCategoryCreate
from fastapi import HTTPException
from typing import List

class WasteService:
    @staticmethod
    async def list_categories(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        hazard_level: str | None = None,
        classification: str | None = None,
    ):
        filters = []
        if hazard_level:
            filters.append(WasteCategory.hazard_level.ilike(hazard_level))
        if classification:
            filters.append(WasteCategory.classification.ilike(classification))
        if search:
            pattern = f"%{search}%"
            filters.append(
                or_(
                    WasteCategory.name.ilike(pattern),
                    WasteCategory.description.ilike(pattern),
                    WasteCategory.environmental_impact.ilike(pattern),
                )
            )

        query = select(WasteCategory)
        count_query = select(func.count()).select_from(WasteCategory)
        if filters:
            query = query.where(*filters)
            count_query = count_query.where(*filters)

        total_result = await db.execute(count_query)
        result = await db.execute(query.order_by(WasteCategory.name).offset(skip).limit(limit))
        return {
            "items": result.scalars().all(),
            "total": total_result.scalar_one(),
            "skip": skip,
            "limit": limit,
        }

    @staticmethod
    async def get_category(db: AsyncSession, category_id):
        result = await db.execute(select(WasteCategory).where(WasteCategory.id == category_id))
        return result.scalars().first()

    @staticmethod
    async def create_category(db: AsyncSession, category_data: WasteCategoryCreate):
        # Check if category with same name exists
        result = await db.execute(select(WasteCategory).where(WasteCategory.name == category_data.name))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Waste category with this name already exists")
        category = WasteCategory(**category_data.model_dump())
        db.add(category)
        await db.commit()
        await db.refresh(category)
        return category

    @staticmethod
    async def update_category(db: AsyncSession, category_id, category_data: WasteCategoryCreate):
        result = await db.execute(select(WasteCategory).where(WasteCategory.id == category_id))
        category = result.scalars().first()
        if not category:
            raise HTTPException(status_code=404, detail="Waste category not found")
        for key, value in category_data.model_dump().items():
            setattr(category, key, value)
        await db.commit()
        await db.refresh(category)
        return category

    @staticmethod
    async def delete_category(db: AsyncSession, category_id):
        result = await db.execute(select(WasteCategory).where(WasteCategory.id == category_id))
        category = result.scalars().first()
        if not category:
            raise HTTPException(status_code=404, detail="Waste category not found")
        await db.delete(category)
        await db.commit()
        return {"message": "Waste category deleted successfully"}

    @staticmethod
    async def identify_waste(db: AsyncSession, description: str) -> List[WasteCategory]:
        # Simple keyword matching - in production, use NLP or ML
        keywords = description.lower().split()
        matching_categories = []
        all_categories = (await WasteService.list_categories(db, limit=100))["items"]
        for category in all_categories:
            category_text = " ".join(
                [
                    category.name or "",
                    category.classification or "",
                    category.description or "",
                    category.environmental_impact or "",
                ]
            ).lower()
            if any(keyword in category_text for keyword in keywords):
                matching_categories.append(category)
        return matching_categories
