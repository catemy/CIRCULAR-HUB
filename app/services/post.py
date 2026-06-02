from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.post import Post
from app.schemas.post import PostCreate
from app.services.engagement import EngagementService

class PostService:
    @staticmethod
    async def create_post(db: AsyncSession, payload: PostCreate, author_id):
        post = Post(
            title=payload.title,
            description=payload.description,
            media_url=payload.media_url,
            tags=payload.tags,
            waste_categories_used=payload.waste_categories_used,
            environmental_value=payload.environmental_value,
            materials_used=payload.materials_used,
            project_steps=payload.project_steps,
            before_media_url=payload.before_media_url,
            after_media_url=payload.after_media_url,
            educational_references=payload.educational_references,
            collaboration_tags=payload.collaboration_tags,
            author_id=author_id,
        )
        db.add(post)
        await db.commit()
        await db.refresh(post)
        await EngagementService.log_activity(db, author_id, "post_created", 10, "Created a community innovation post")
        return post

    @staticmethod
    async def list_posts(db: AsyncSession, skip: int = 0, limit: int = 20):
        result = await db.execute(select(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit))
        return result.scalars().all()

    @staticmethod
    async def get_post(db: AsyncSession, post_id):
        result = await db.execute(select(Post).where(Post.id == post_id))
        return result.scalars().first()
