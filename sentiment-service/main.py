"""FastAPI entrypoint for the sentiment service."""

import logging
import os
from contextlib import asynccontextmanager
from typing import List

import uvicorn
from fastapi import FastAPI, Query

from consul_registry import deregister_service, register_service
import finbert_service
from config import MODEL_NAME, PORT, UVICORN_LOG_LEVEL
from finbert_service import analyze_text
from models import AnalyzeRequest, BatchAnalyzeRequest, SentimentResult, SuggestionResponse
from suggestion_service import build_suggestion


logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("sentiment-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    finbert_service.load_model()
    await register_service()
    try:
        yield
    finally:
        await deregister_service()
        logger.info("Sentiment service shutting down")


app = FastAPI(
    title="Sentiment Service",
    description="FinBERT financial-news sentiment analysis for CryptoTrading SOA",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/sentiment/health")
async def health():
    return {
        "status": "UP",
        "service": "sentiment-service",
        "model": MODEL_NAME,
        "modelLoaded": finbert_service.is_model_loaded(),
        "version": "1.0.0",
    }


@app.post("/sentiment/analyze", response_model=SentimentResult)
async def analyze(request: AnalyzeRequest):
    result = analyze_text(request.text)
    logger.debug("analyze -> %s (%.2f)", result.label, result.score)
    return result


@app.post("/sentiment/analyze-batch", response_model=List[SentimentResult])
async def analyze_batch(request: BatchAnalyzeRequest):
    results = [analyze_text(text) for text in request.texts]
    logger.info("analyze-batch processed %d texts", len(results))
    return results


@app.get("/sentiment/suggestion", response_model=SuggestionResponse)
async def get_suggestion(symbol: str = Query(..., description="Coin symbol, e.g. BTC, ETH")):
    return await build_suggestion(symbol)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=False,
        log_level=UVICORN_LOG_LEVEL,
    )
