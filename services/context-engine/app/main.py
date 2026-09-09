from datetime import datetime, timezone
import logging
import time
from typing import Any, Dict
from fastapi import FastAPI
from pydantic import BaseModel

from app.config import settings

logging.basicConfig(
    level=logging.INFO if settings.knovra_log_level.lower() == "info" else logging.DEBUG,
    format='{"timestamp":"%(asctime)s","level":"%(levelname)s","service":"knovra-context-engine","message":"%(message)s"}',
)
logger = logging.getLogger("knovra.context-engine")

start_time = time.time()

app = FastAPI(
    title="Knovra Context Engine",
    version="0.1.0",
    description="Universal AI Project Intelligence and Context Planner",
)


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str
    uptime_seconds: float
    details: Dict[str, Any]


@app.get("/")
async def root():
    return {
        "service": "knovra-context-engine",
        "version": "0.1.0",
        "description": "AI Context Engine and Planner",
    }


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="ok",
        service="knovra-context-engine",
        version="0.1.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
        uptime_seconds=round(time.time() - start_time, 2),
        details={
            "environment": settings.knovra_env,
            "semantic_retrieval": "ready",
            "context_planner": "ready",
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.port_context_engine)
