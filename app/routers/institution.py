from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.institution import InstitutionResponse, InstitutionCreate
from app.services.institution import InstitutionService

router = APIRouter()

@router.get("/", response_model=list[InstitutionResponse])
async def list_institutions(db: AsyncSession = Depends(get_db)):
    return await InstitutionService.list_institutions(db)

@router.get("/{institution_id}", response_model=InstitutionResponse)
async def get_institution(institution_id: UUID, db: AsyncSession = Depends(get_db)):
    institution = await InstitutionService.get_institution(db, institution_id)
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    return institution

@router.post("/", response_model=InstitutionResponse)
async def create_institution(institution: InstitutionCreate, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await InstitutionService.create_institution(db, institution, current_user.id)

@router.put("/{institution_id}", response_model=InstitutionResponse)
async def update_institution(institution_id: UUID, institution: InstitutionCreate, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await InstitutionService.update_institution(db, institution_id, institution, current_user.id)

@router.delete("/{institution_id}")
async def delete_institution(institution_id: UUID, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await InstitutionService.delete_institution(db, institution_id, current_user.id)