from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.institution import Institution
from app.schemas.institution import InstitutionCreate
from fastapi import HTTPException

class InstitutionService:
    @staticmethod
    async def list_institutions(db: AsyncSession):
        result = await db.execute(select(Institution).order_by(Institution.name))
        return result.scalars().all()

    @staticmethod
    async def get_institution(db: AsyncSession, institution_id):
        result = await db.execute(select(Institution).where(Institution.id == institution_id))
        return result.scalars().first()

    @staticmethod
    async def create_institution(db: AsyncSession, institution_data: InstitutionCreate, created_by):
        # Check if institution with same name exists
        result = await db.execute(select(Institution).where(Institution.name == institution_data.name))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Institution with this name already exists")
        institution = Institution(**institution_data.model_dump(), created_by=created_by)
        db.add(institution)
        await db.commit()
        await db.refresh(institution)
        return institution

    @staticmethod
    async def update_institution(db: AsyncSession, institution_id, institution_data: InstitutionCreate, user_id):
        result = await db.execute(select(Institution).where(Institution.id == institution_id))
        institution = result.scalars().first()
        if not institution:
            raise HTTPException(status_code=404, detail="Institution not found")
        if institution.created_by != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this institution")
        for key, value in institution_data.model_dump().items():
            setattr(institution, key, value)
        await db.commit()
        await db.refresh(institution)
        return institution

    @staticmethod
    async def delete_institution(db: AsyncSession, institution_id, user_id):
        result = await db.execute(select(Institution).where(Institution.id == institution_id))
        institution = result.scalars().first()
        if not institution:
            raise HTTPException(status_code=404, detail="Institution not found")
        if institution.created_by != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this institution")
        await db.delete(institution)
        await db.commit()
        return {"message": "Institution deleted successfully"}