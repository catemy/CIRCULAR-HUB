from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.waste import WasteCategoryResponse, WasteCategoryCreate
from app.services.waste import WasteService

router = APIRouter()

@router.get("/", response_model=list[WasteCategoryResponse])
async def list_waste_categories(db: AsyncSession = Depends(get_db)):
    return await WasteService.list_categories(db)

@router.get("/{category_id}", response_model=WasteCategoryResponse)
async def get_waste_category(category_id: UUID, db: AsyncSession = Depends(get_db)):
    category = await WasteService.get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Waste category not found")
    return category

@router.post("/", response_model=WasteCategoryResponse)
async def create_waste_category(category: WasteCategoryCreate, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await WasteService.create_category(db, category)

@router.put("/{category_id}", response_model=WasteCategoryResponse)
async def update_waste_category(category_id: UUID, category: WasteCategoryCreate, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await WasteService.update_category(db, category_id, category)

@router.delete("/{category_id}")
async def delete_waste_category(category_id: UUID, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await WasteService.delete_category(db, category_id)
