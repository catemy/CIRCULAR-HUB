from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserUpdate

class UserService:
    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id):
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    @staticmethod
    async def update_profile(db: AsyncSession, user_id, payload: UserUpdate):
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        if payload.location is not None:
            user.location = payload.location
        if payload.bio is not None:
            user.bio = payload.bio
        if payload.waste_profile is not None:
            user.waste_profile = payload.waste_profile
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
