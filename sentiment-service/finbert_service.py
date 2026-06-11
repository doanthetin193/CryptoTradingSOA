"""FinBERT model loading and inference helpers."""

import logging
from typing import Optional

from fastapi import HTTPException

from config import MAX_TEXT_CHARS, MODEL_NAME, NEUTRAL_SCORES
from models import SentimentResult


logger = logging.getLogger("sentiment-service.finbert")
analyzer = None


def load_model() -> bool:
    """Load FinBERT once and keep it in process memory."""
    global analyzer

    logger.info("Loading FinBERT model: %s", MODEL_NAME)
    try:
        from transformers import pipeline

        analyzer = pipeline(
            "text-classification",
            model=MODEL_NAME,
            top_k=None,
            device=-1,
        )
        logger.info("FinBERT loaded successfully")
        return True
    except Exception as exc:
        analyzer = None
        logger.error("Failed to load FinBERT: %s", exc)
        logger.warning("Service remains online, but analyze endpoints will return 503")
        return False


def is_model_loaded() -> bool:
    return analyzer is not None


def normalize_text(text: Optional[str]) -> str:
    return (text or "").strip()


def neutral_result() -> SentimentResult:
    return SentimentResult(label="neutral", score=1.0, scores=NEUTRAL_SCORES)


def analyze_text(text: str) -> SentimentResult:
    clean_text = normalize_text(text)
    if not clean_text:
        return neutral_result()

    if analyzer is None:
        raise HTTPException(status_code=503, detail="FinBERT model not loaded yet")

    raw_results = analyzer(clean_text[:MAX_TEXT_CHARS])
    all_scores = raw_results[0]
    scores = {item["label"]: round(float(item["score"]), 4) for item in all_scores}
    best = max(all_scores, key=lambda item: item["score"])

    return SentimentResult(
        label=best["label"],
        score=round(float(best["score"]), 4),
        scores=scores,
    )
