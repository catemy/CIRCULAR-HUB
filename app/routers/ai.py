from fastapi import APIRouter, Depends, File, UploadFile

from app.core.dependencies import get_current_user
from app.schemas.ai import WasteScanResponse
from app.services.ai_scanner import AIScannerService

router = APIRouter()


@router.post("/scanner/analyze", response_model=WasteScanResponse)
async def analyze_waste_image(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    return await AIScannerService.analyze_image(file)
