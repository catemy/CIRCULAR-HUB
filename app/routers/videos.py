from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.video import VideoCreate, Video, LikeCreate, CommentCreate, Comment
from app.services.video import VideoService
from app.services.auth import AuthService
from app.routers.auth import oauth2_scheme
from typing import List

router = APIRouter()

@router.post("/", response_model=Video)
async def create_video(video_data: VideoCreate, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    user = await AuthService.get_current_user(db, token)
    return await VideoService.create_video(db, video_data, user.id)

@router.get("/", response_model=List[Video])
async def get_feed(limit: int = 20, offset: int = 0, db: AsyncSession = Depends(get_db)):
    videos = await VideoService.get_feed(db, limit, offset)
    return videos

@router.post("/like", response_model=dict)
async def like_video(like_data: LikeCreate, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    user = await AuthService.get_current_user(db, token)
    await VideoService.like_video(db, like_data, user.id)
    return {"message": "Liked"}

@router.post("/comment", response_model=Comment)
async def comment_on_video(comment_data: CommentCreate, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    user = await AuthService.get_current_user(db, token)
    return await VideoService.comment_on_video(db, comment_data, user.id)