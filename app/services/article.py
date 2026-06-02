from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.article import Article
from app.schemas.article import ArticleCreate

class ArticleService:
    @staticmethod
    async def create_article(db: AsyncSession, payload: ArticleCreate, author_id):
        article = Article(
            title=payload.title,
            content=payload.content,
            category=payload.category,
            target_audience=payload.target_audience.value,
            author_id=author_id,
        )
        db.add(article)
        await db.commit()
        await db.refresh(article)
        return article

    @staticmethod
    async def list_articles(db: AsyncSession):
        result = await db.execute(select(Article).order_by(Article.created_at.desc()))
        return result.scalars().all()

    @staticmethod
    async def get_article(db: AsyncSession, article_id):
        result = await db.execute(select(Article).where(Article.id == article_id))
        return result.scalars().first()
