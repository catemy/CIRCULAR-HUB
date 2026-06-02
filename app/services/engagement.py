from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from app.models.engagement_log import EngagementLog
from app.models.user import User

class EngagementService:
    @staticmethod
    async def log_activity(db: AsyncSession, user_id, action: str, points: int, description: str):
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        user.points += points
        log = EngagementLog(user_id=user_id, action=action, points=points, description=description)
        db.add(log)
        db.add(user)
        await db.commit()
        await db.refresh(log)
        return log
