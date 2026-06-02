import base64
import json

import httpx
from fastapi import HTTPException, UploadFile
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.ai import WasteScanReport, WasteScanResponse


SCAN_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "waste_category": {"type": "string"},
        "detected_items": {"type": "array", "items": {"type": "string"}},
        "hazard_level": {"type": "string", "enum": ["low", "medium", "high", "critical", "unknown"]},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        "environmental_impact": {"type": "string"},
        "disposal_recommendations": {"type": "array", "items": {"type": "string"}},
        "recycling_methods": {"type": "array", "items": {"type": "string"}},
        "reuse_opportunities": {"type": "array", "items": {"type": "string"}},
        "sustainability_suggestions": {"type": "array", "items": {"type": "string"}},
        "safety_precautions": {"type": "array", "items": {"type": "string"}},
        "decomposition_timeline": {"type": "string"},
        "sorting_guidance": {"type": "string"},
        "global_context": {"type": "string"},
        "recommended_campaign_types": {"type": "array", "items": {"type": "string"}},
        "limitations": {"type": ["string", "null"]},
    },
    "required": [
        "waste_category",
        "detected_items",
        "hazard_level",
        "confidence",
        "environmental_impact",
        "disposal_recommendations",
        "recycling_methods",
        "reuse_opportunities",
        "sustainability_suggestions",
        "safety_precautions",
        "decomposition_timeline",
        "sorting_guidance",
        "global_context",
        "recommended_campaign_types",
        "limitations",
    ],
}


class AIScannerService:
    @staticmethod
    async def analyze_image(file: UploadFile) -> WasteScanResponse:
        if not settings.OPENAI_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="AI scanner is not configured. Set OPENAI_API_KEY on the FastAPI server.",
            )

        if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
            raise HTTPException(status_code=400, detail="Upload a JPEG, PNG, or WebP image.")

        raw = await file.read()
        if len(raw) > 8 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Image must be smaller than 8MB.")

        data_url = f"data:{file.content_type};base64,{base64.b64encode(raw).decode('utf-8')}"
        payload = {
            "model": settings.OPENAI_VISION_MODEL,
            "input": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                "Analyze this waste image for CircularHub. Return JSON only. "
                                "Identify visible waste items, classify supported categories including plastic, paper, metal, electronic waste, batteries, glass, organic, medical, and industrial waste. "
                                "Give practical global sustainability guidance, safe handling warnings, disposal guidance, recycling methods, reuse ideas, and limitations if the image is ambiguous."
                            ),
                        },
                        {"type": "input_image", "image_url": data_url, "detail": "high"},
                    ],
                }
            ],
            "text": {
                "format": {
                    "type": "json_schema",
                    "name": "circularhub_waste_scan",
                    "strict": True,
                    "schema": SCAN_SCHEMA,
                }
            },
        }

        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY.get_secret_value()}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post("https://api.openai.com/v1/responses", headers=headers, json=payload)

        if response.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"OpenAI vision analysis failed: {response.text}")

        data = response.json()
        output_text = data.get("output_text")
        if not output_text:
            for item in data.get("output", []):
                for content in item.get("content", []):
                    if content.get("type") == "output_text":
                        output_text = content.get("text")
                        break

        try:
            report = WasteScanReport.model_validate(json.loads(output_text or "{}"))
        except (json.JSONDecodeError, ValidationError) as exc:
            raise HTTPException(status_code=502, detail=f"AI scanner returned an invalid structured report: {exc}")

        return WasteScanResponse(provider="openai", model=settings.OPENAI_VISION_MODEL, report=report)
