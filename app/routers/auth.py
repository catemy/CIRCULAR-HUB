from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.user import UserCreate, User
from app.schemas.auth import UserLogin, Token
from app.services.auth import AuthService
from app.core.security import get_password_hash, verify_password
from app.core.dependencies import get_current_user
from pydantic import BaseModel, Field
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
    current_password: str
    new_password: str = Field(min_length=8)


@router.post("/reset-password")
async def reset_password(
    payload: PasswordReset,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.password_hash = get_password_hash(payload.new_password)
    await db.commit()
    return {"message": "Password updated successfully"}
