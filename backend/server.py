from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="Inga — Erabu to...")
api_router = APIRouter(prefix="/api")


class SceneImageRequest(BaseModel):
    scene_id: str
    prompt: str
    force: bool = False
    style: str = "scene"  # scene | scroll


class SceneImageResponse(BaseModel):
    scene_id: str
    image_data: str  # base64 png
    mime_type: str = "image/png"
    cached: bool = False


BASE_STYLE = (
    "traditional Japanese sumi-e ink wash painting on aged washi parchment, "
    "muted indigo and vermilion accents, subtle mist, cinematic mood, "
    "first-person composition, atmospheric horror, anime-inspired but restrained, "
    "no visible text, no captions, no watermarks, dark folkloric tone"
)

SCROLL_STYLE = (
    "one continuous panel of a traditional Japanese emakimono handscroll in yamato-e style, "
    "sumi ink with mineral pigments on aged washi, gold leaf cloud bands, richly detailed "
    "continuous landscape seen from slightly above, wide horizontal composition, "
    "no text, no captions, no borders, no watermarks"
)


@api_router.get("/")
async def root():
    return {"message": "因果 — the thread of cause and effect."}


async def _generate_and_cache(scene_id: str, prompt: str, style: str) -> dict:
    style_text = SCROLL_STYLE if style == "scroll" else BASE_STYLE
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"inga-{scene_id}",
        system_message="You are a master sumi-e ink artist creating atmospheric Japanese folklore horror illustrations.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])
    _text, images = await chat.send_message_multimodal_response(UserMessage(text=f"{prompt}. Style: {style_text}."))
    if not images:
        raise RuntimeError("No image returned")
    img = images[0]
    doc = {
        "scene_id": scene_id,
        "image_data": img["data"],
        "mime_type": img.get("mime_type", "image/png"),
        "prompt": prompt,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.scene_images.update_one({"scene_id": scene_id}, {"$set": doc}, upsert=True)
    return doc


@api_router.post("/scene/image", response_model=SceneImageResponse)
async def generate_scene_image(req: SceneImageRequest):
    """Generate (or fetch cached) sumi-e horror scene art via Gemini Nano Banana."""
    if not req.force:
        cached = await db.scene_images.find_one({"scene_id": req.scene_id}, {"_id": 0})
        if cached:
            return SceneImageResponse(
                scene_id=req.scene_id,
                image_data=cached["image_data"],
                mime_type=cached.get("mime_type", "image/png"),
                cached=True,
            )

    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")

    try:
        doc = await _generate_and_cache(req.scene_id, req.prompt, req.style)
    except Exception as e:
        logging.exception("Image generation failed")
        raise HTTPException(status_code=502, detail=f"Generation error: {type(e).__name__}")

    return SceneImageResponse(
        scene_id=req.scene_id,
        image_data=doc["image_data"],
        mime_type=doc["mime_type"],
        cached=False,
    )


class PregenerateItem(BaseModel):
    scene_id: str
    prompt: str
    style: str = "scene"


class PregenerateRequest(BaseModel):
    items: list[PregenerateItem]


PREGEN = {"running": False, "total": 0, "done": 0, "skipped": 0, "failed": [], "last_error": None}


async def _pregenerate(items: list[PregenerateItem]):
    PREGEN.update(running=True, total=len(items), done=0, skipped=0, failed=[], last_error=None)
    for it in items:
        if await db.scene_images.find_one({"scene_id": it.scene_id}, {"_id": 1}):
            PREGEN["skipped"] += 1
            continue
        try:
            await _generate_and_cache(it.scene_id, it.prompt, it.style)
            PREGEN["done"] += 1
        except Exception as e:
            logging.exception("Pregenerate failed for %s", it.scene_id)
            PREGEN["failed"].append(it.scene_id)
            PREGEN["last_error"] = str(e)[:300]
            if "budget" in str(e).lower():
                break
    PREGEN["running"] = False


@api_router.post("/scene/pregenerate")
async def pregenerate(req: PregenerateRequest, background: BackgroundTasks):
    """Generate every missing scene/scroll image in the background; poll /scene/pregenerate/status."""
    if PREGEN["running"]:
        raise HTTPException(status_code=409, detail="Pregeneration already running")
    background.add_task(_pregenerate, req.items)
    return {"queued": len(req.items)}


@api_router.get("/scene/pregenerate/status")
async def pregenerate_status():
    cached = await db.scene_images.distinct("scene_id")
    return {**PREGEN, "cached_ids": sorted(cached)}


@api_router.get("/scene/image/{scene_id}")
async def get_cached_scene_image(scene_id: str):
    cached = await db.scene_images.find_one({"scene_id": scene_id}, {"_id": 0})
    if not cached:
        raise HTTPException(status_code=404, detail="Not generated yet")
    return {
        "scene_id": scene_id,
        "image_data": cached["image_data"],
        "mime_type": cached.get("mime_type", "image/png"),
        "cached": True,
    }


class TelemetryEvent(BaseModel):
    event: str
    payload: dict = Field(default_factory=dict)


@api_router.post("/telemetry")
async def telemetry(evt: TelemetryEvent):
    """Anonymous telemetry — records which endings/paths players reach."""
    await db.telemetry.insert_one({
        "event": evt.event,
        "payload": evt.payload,
        "at": datetime.now(timezone.utc).isoformat(),
    })
    return {"ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
