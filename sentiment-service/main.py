"""
Sentiment Service — CryptoTrading SOA
Dùng FinBERT (ProsusAI/finbert) để phân tích cảm xúc tiêu đề tin tức tài chính.

FinBERT là BERT được fine-tune trên ~10,000 bài báo tài chính tiếng Anh.
Trả về: positive | negative | neutral với confidence score.
"""

import logging
import os
from contextlib import asynccontextmanager
from typing import List, Optional

import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("sentiment-service")

# ────────────────────────────────────────────────────────────────────────────
# Model global (load 1 lần khi startup, dùng lại cho mọi request)
# ────────────────────────────────────────────────────────────────────────────
analyzer = None
MODEL_NAME = "ProsusAI/finbert"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load FinBERT khi service khởi động, unload khi shutdown."""
    global analyzer
    logger.info("=" * 60)
    logger.info("[SentimentService] Loading FinBERT model...")
    logger.info(f"[SentimentService] Model: {MODEL_NAME}")
    logger.info("[SentimentService] First run will download ~440MB (cached after that)")
    logger.info("=" * 60)

    try:
        from transformers import pipeline
        analyzer = pipeline(
            "text-classification",
            model=MODEL_NAME,
            top_k=None,        # Trả về tất cả 3 scores (positive/negative/neutral)
            device=-1          # -1 = CPU (không cần GPU)
        )
        logger.info("[SentimentService] FinBERT loaded successfully. Ready to serve!")
    except Exception as e:
        logger.error(f"[SentimentService] Failed to load FinBERT: {e}")
        logger.warning("[SentimentService] Service will start but /sentiment/analyze will return 503")

    yield

    logger.info("[SentimentService] Shutting down.")


# ────────────────────────────────────────────────────────────────────────────
# FastAPI app
# ────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Sentiment Service",
    description="FinBERT-based financial news sentiment analysis for CryptoTrading SOA",
    version="1.0.0",
    lifespan=lifespan
)


# ────────────────────────────────────────────────────────────────────────────
# Request / Response Models
# ────────────────────────────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    text: str                       # Tiêu đề + tóm tắt bài báo

class BatchAnalyzeRequest(BaseModel):
    texts: List[str]                # Nhiều bài cùng lúc

class SentimentResult(BaseModel):
    label: str                      # "positive" | "negative" | "neutral"
    score: float                    # Confidence: 0.0 → 1.0
    scores: dict                    # {"positive": 0.97, "negative": 0.02, "neutral": 0.01}


# ────────────────────────────────────────────────────────────────────────────
# Helper
# ────────────────────────────────────────────────────────────────────────────
def _run_finbert(text: str) -> SentimentResult:
    """Chạy FinBERT inference trên 1 đoạn text (max 512 tokens)."""
    if analyzer is None:
        raise HTTPException(status_code=503, detail="FinBERT model not loaded yet")

    # FinBERT max 512 tokens — truncate text nếu dài quá
    truncated = text[:512]

    # analyzer trả về [[{label: "positive", score: 0.97}, {label: "negative", score: 0.02}, ...]]
    raw_results = analyzer(truncated)
    all_scores = raw_results[0]  # List[{label, score}]

    # Build scores dict: {positive: 0.97, negative: 0.02, neutral: 0.01}
    scores_dict = {r["label"]: round(r["score"], 4) for r in all_scores}

    # Nhãn với score cao nhất
    best = max(all_scores, key=lambda x: x["score"])

    return SentimentResult(
        label=best["label"],
        score=round(best["score"], 4),
        scores=scores_dict
    )


# ────────────────────────────────────────────────────────────────────────────
# Endpoints
# ────────────────────────────────────────────────────────────────────────────
@app.get("/sentiment/health")
async def health():
    """Health check cho Consul."""
    return {
        "status": "UP",
        "service": "sentiment-service",
        "model": MODEL_NAME,
        "modelLoaded": analyzer is not None,
        "version": "1.0.0"
    }


@app.post("/sentiment/analyze", response_model=SentimentResult)
async def analyze(req: AnalyzeRequest):
    """
    Phân tích sentiment 1 đoạn text.

    Ví dụ request:
        {"text": "Bitcoin surges to new all-time high amid institutional buying"}

    Ví dụ response:
        {"label": "positive", "score": 0.97, "scores": {"positive": 0.97, "negative": 0.01, "neutral": 0.02}}
    """
    if not req.text or not req.text.strip():
        return SentimentResult(label="neutral", score=1.0, scores={"positive": 0.0, "negative": 0.0, "neutral": 1.0})

    result = _run_finbert(req.text.strip())
    logger.debug(f"[analyze] '{req.text[:80]}...' → {result.label} ({result.score:.2%})")
    return result


@app.post("/sentiment/analyze-batch", response_model=List[SentimentResult])
async def analyze_batch(req: BatchAnalyzeRequest):
    """
    Phân tích sentiment nhiều đoạn text cùng lúc (hiệu quả hơn gọi riêng từng cái).

    Dùng khi News Service refresh cache ~50 bài báo cùng lúc.
    """
    if not req.texts:
        return []

    results = []
    for text in req.texts:
        if not text or not text.strip():
            results.append(SentimentResult(
                label="neutral", score=1.0,
                scores={"positive": 0.0, "negative": 0.0, "neutral": 1.0}
            ))
        else:
            results.append(_run_finbert(text.strip()))

    logger.info(f"[analyze-batch] Processed {len(results)} texts")
    return results


# ────────────────────────────────────────────────────────────────────────────
# Entry point
# ────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=3008,
        reload=False,
        log_level="info"
    )
