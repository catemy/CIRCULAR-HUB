from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.schemas.article import ArticleCreate, ArticleResponse
from app.services.article import ArticleService

router = APIRouter()

@router.post("/", response_model=ArticleResponse)
async def create_article(payload: ArticleCreate, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await ArticleService.create_article(db, payload, current_user.id)

@router.get("/", response_model=list)
async def list_articles(db: AsyncSession = Depends(get_db)):
    return await ArticleService.list_articles(db)

@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: UUID, db: AsyncSession = Depends(get_db)):
    article = await ArticleService.get_article(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article
