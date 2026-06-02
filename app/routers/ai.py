from fastapi import APIRouter, File, UploadFile

from app.schemas.ai import WasteScanResponse
from app.services.ai_scanner import AIScannerService

router = APIRouter()


@router.post("/scanner/analyze", response_model=WasteScanResponse)
async def analyze_waste_image(file: UploadFile = File(...)):
    return await AIScannerService.analyze_image(file)
