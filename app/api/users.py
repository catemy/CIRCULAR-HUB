from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.dependencies import get_current_user
from app.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.services.user import UserService

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_me(current_user = Depends(get_current_user)):
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
async def read_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    user = await UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/me", response_model=UserResponse)
async def update_me(payload: UserUpdate, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await UserService.update_profile(db, current_user.id, payload)

@router.get("/me/points")
async def get_my_points(current_user = Depends(get_current_user)):
    return {"user_id": current_user.id, "points": current_user.points}
