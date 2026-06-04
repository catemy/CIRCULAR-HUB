from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, ensure_sqlite_dev_schema
from app.core.config import settings
from app.models import *
from app.routers import (
    auth_router,
    videos_router,
    articles_router,
    waste_router,
    institution_router,
    posts_router,
    campaigns_router,
    analytics_router,
    marketplace_router,
)
from app.routers.users import router as users_router
from app.routers.ai import router as ai_router

app = FastAPI(
    title="CircularHub API",
    version="1.0.0",
    description="CircularHub brings sustainable waste education, reuse campaigns, marketplace listings, and analytics together in one platform.",
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["root"])
async def read_root():
    return {
        "message": "Welcome to CircularHub API.",
        "documentation": "/docs",
        "openapi": "/openapi.json",
        "endpoints": [
            "/auth",
            "/videos",
            "/articles",
            "/waste",
            "/institutions",
            "/posts",
            "/campaigns",
            "/analytics",
            "/marketplace",
            "/users",
        ]
    }

@app.on_event("startup")
async def startup():
    if not settings.is_production:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        await ensure_sqlite_dev_schema()

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(videos_router, prefix="/videos", tags=["videos"])
app.include_router(articles_router, prefix="/articles", tags=["articles"])
app.include_router(waste_router, prefix="/waste", tags=["waste"])
app.include_router(institution_router, prefix="/institutions", tags=["institutions"])
app.include_router(posts_router, prefix="/posts", tags=["posts"])
app.include_router(campaigns_router, prefix="/campaigns", tags=["campaigns"])
app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(ai_router, prefix="/ai", tags=["ai"])
app.include_router(marketplace_router, prefix="/marketplace", tags=["marketplace"])
