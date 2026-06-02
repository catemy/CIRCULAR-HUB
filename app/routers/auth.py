from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.user import UserCreate, User
from app.schemas.auth import UserLogin, Token
from app.services.auth import AuthService
from app.models.user import User as UserModel
from app.core.security import get_password_hash
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr
from fastapi import HTTPException

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.post("/register", response_model=User)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    return await AuthService.register_user(db, user_data)

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    return await AuthService.authenticate_user(db, login_data)

@router.get("/me", response_model=User)
async def get_me(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    return await AuthService.get_current_user(db, token)


class PasswordReset(BaseModel):
    email: EmailStr
    new_password: str


@router.post("/reset-password")
async def reset_password(payload: PasswordReset, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.email == payload.email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="No user found for this email")
    user.password_hash = get_password_hash(payload.new_password)
    await db.commit()
    return {"message": "Password updated successfully"}
