"""Pydantic request and response models."""

from typing import Any, Dict, List

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    text: str = Field(..., description="Text to analyze")


class BatchAnalyzeRequest(BaseModel):
    texts: List[str] = Field(default_factory=list, description="Texts to analyze")


class SentimentResult(BaseModel):
    label: str
    score: float
    scores: Dict[str, float]


class PriceInfo(BaseModel):
    current: float
    change24h: float


class SuggestionSignal(BaseModel):
    signal: str
    title: str
    reason: str
    detail: str


class SuggestionResponse(BaseModel):
    symbol: str
    coinId: str
    price: PriceInfo
    sentiment: Dict[str, Any]
    suggestion: SuggestionSignal
    disclaimer: str
    timestamp: str
