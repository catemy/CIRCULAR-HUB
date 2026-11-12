from fastapi import APIRouter, Depends, File, UploadFile

from app.core.dependencies import get_current_user
from app.schemas.ai import AssistantChatRequest, AssistantChatResponse, WasteScanResponse
from app.services.ai_assistant import AIAssistantService
from app.services.ai_scanner import AIScannerService

router = APIRouter()


@router.post("/assistant/chat", response_model=AssistantChatResponse)
async def chat_with_assistant(
    payload: AssistantChatRequest,
    current_user=Depends(get_current_user),
):
    return await AIAssistantService.answer(
        payload.question,
        user_role=current_user.role,
        country=current_user.country,
    )


@router.post("/scanner/analyze", response_model=WasteScanResponse)
async def analyze_waste_image(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    return await AIScannerService.analyze_image(file)
