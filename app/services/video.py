from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.video import Video
from app.models.like import Like
from app.models.comment import Comment
from app.models.user import User
from app.schemas.video import VideoCreate, LikeCreate, CommentCreate
from fastapi import HTTPException

class VideoService:
    @staticmethod
    async def create_video(db: AsyncSession, video_data: VideoCreate, user_id: str):
        video = Video(
            title=video_data.title,
            caption=video_data.caption,
            tags=video_data.tags,
            video_url=video_data.video_url,
            user_id=user_id
        )
        db.add(video)
        await db.commit()
        await db.refresh(video)
        # Award points
        user = await db.get(User, user_id)
        user.points += 10
        await db.commit()
        return video

    @staticmethod
    async def get_feed(db: AsyncSession, limit: int = 20, offset: int = 0):
        result = await db.execute(
            select(Video).order_by(Video.created_at.desc()).offset(offset).limit(limit)
        )
        return result.scalars().all()

    @staticmethod
    async def like_video(db: AsyncSession, like_data: LikeCreate, user_id: str):
        # Check if already liked
        result = await db.execute(
            select(Like).where(Like.user_id == user_id, Like.video_id == like_data.video_id)
        )
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Already liked")
        like = Like(user_id=user_id, video_id=like_data.video_id)
        db.add(like)
        # Increment likes_count
        video = await db.get(Video, like_data.video_id)
        video.likes_count += 1
        # Award points to liker
        user = await db.get(User, user_id)
        user.points += 1
        await db.commit()
        return like

    @staticmethod
    async def comment_on_video(db: AsyncSession, comment_data: CommentCreate, user_id: str):
        comment = Comment(
            content=comment_data.content,
            user_id=user_id,
            video_id=comment_data.video_id
        )
        db.add(comment)
        # Increment comments_count
        video = await db.get(Video, comment_data.video_id)
        video.comments_count += 1
        await db.commit()
        await db.refresh(comment)
        return comment