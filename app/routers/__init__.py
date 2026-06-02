from .auth import router as auth_router
from .videos import router as videos_router
from .articles import router as articles_router
from .waste import router as waste_router
from .institution import router as institution_router
from .posts import router as posts_router
from .campaigns import router as campaigns_router
from .analytics import router as analytics_router
from .marketplace import router as marketplace_router

__all__ = [
    "auth_router",
    "videos_router",
    "articles_router",
    "waste_router",
    "institution_router",
    "posts_router",
    "campaigns_router",
    "analytics_router",
    "marketplace_router",
]
