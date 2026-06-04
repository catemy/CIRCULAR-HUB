from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.schemas.auth import UserLogin
from fastapi import HTTPException

class AuthService:
    @staticmethod
    async def register_user(db: AsyncSession, user_data: UserCreate):
        # Check if user exists
        result = await db.execute(select(User).where(User.username == user_data.username))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Username already registered")
        result = await db.execute(select(User).where(User.email == user_data.email))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed_password = get_password_hash(user_data.password)
        user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password,
            bio=user_data.bio,
            profile_image_url=user_data.profile_image_url,
            role="Individual",
            country=user_data.country,
            interests=user_data.interests,
            goals=user_data.goals,
            onboarding_complete=user_data.onboarding_complete,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def authenticate_user(db: AsyncSession, login_data: UserLogin):
        result = await db.execute(
            select(User).where(
                (User.username == login_data.username) | (User.email == login_data.username)
            )
        )
        user = result.scalars().first()
        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        access_token = create_access_token(data={"sub": user.username})
        return {"access_token": access_token, "token_type": "bearer"}

    @staticmethod
    async def get_current_user(db: AsyncSession, token: str):
        token_data = decode_access_token(token)
        if not token_data or not token_data.username:
            raise HTTPException(status_code=401, detail="Invalid token")
        result = await db.execute(select(User).where(User.username == token_data.username))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
