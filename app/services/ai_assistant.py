import httpx
from fastapi import HTTPException

from app.core.config import settings


class AIAssistantService:
    @staticmethod
    async def answer(question: str, user_role: str, country: str | None) -> dict[str, str]:
        if not settings.OPENAI_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="AI assistant is not configured. Set OPENAI_API_KEY on the FastAPI server.",
            )

        payload = {
            "model": settings.OPENAI_ASSISTANT_MODEL,
            "instructions": (
                "You are CircularHub's sustainability guide. Give concise, practical guidance about waste prevention,"
                " reuse, recycling, and environmental programs. Adapt suggestions to the user's role and location when"
                " relevant. Do not invent local collection rules, certifications, impact measurements, or legal advice."
                " For hazardous, medical, chemical, battery, or unknown waste, prioritize safety and recommend local"
                " qualified authorities or licensed handlers. State uncertainty and ask a clarifying question when needed."
            ),
            "input": (
                f"User role: {user_role}. Location: {country or 'unspecified'}.\n"
                f"Question: {question.strip()}"
            ),
            "max_output_tokens": 500,
        }
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY.get_secret_value()}",
            "Content-Type": "application/json",
        }
        try:
            async with httpx.AsyncClient(timeout=40) as client:
                response = await client.post(
                    "https://api.openai.com/v1/responses",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
        except httpx.TimeoutException as exc:
            raise HTTPException(status_code=504, detail="The AI assistant timed out. Please try again.") from exc
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=502, detail="The AI provider could not answer right now.") from exc
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail="Could not reach the AI provider.") from exc

        data = response.json()
        answer = data.get("output_text")
        if not answer:
            answer = "\n".join(
                content.get("text", "")
                for item in data.get("output", [])
                for content in item.get("content", [])
                if content.get("type") == "output_text"
            ).strip()
        if not answer:
            raise HTTPException(status_code=502, detail="The AI provider returned an empty answer.")

        return {"answer": answer, "provider": "openai", "model": settings.OPENAI_ASSISTANT_MODEL}
