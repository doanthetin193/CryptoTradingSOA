"""Trade-suggestion logic based on market price and news sentiment."""

import logging
from collections import Counter
from datetime import datetime, timezone
from typing import Any, Dict, List

import httpx
from fastapi import HTTPException

from config import (
    GATEWAY_URL,
    HTTP_TIMEOUT_SECONDS,
    INTERNAL_KEY,
    SENTIMENT_LABELS,
    SUPPORTED_COINS,
)
from finbert_service import analyze_text, normalize_text
from models import PriceInfo, SuggestionResponse, SuggestionSignal


logger = logging.getLogger("sentiment-service.suggestion")


def aggregate_sentiments(sentiments: List[str]) -> Dict[str, Any]:
    valid = [label if label in SENTIMENT_LABELS else "neutral" for label in sentiments]
    total = len(valid)
    distribution = {label: 0 for label in SENTIMENT_LABELS}
    distribution.update(Counter(valid))

    if total == 0:
        return {
            "label": "neutral",
            "score": 0.5,
            "articleCount": 0,
            "distribution": distribution,
        }

    label = max(distribution, key=lambda key: distribution[key])
    return {
        "label": label,
        "score": round(distribution[label] / total, 2),
        "articleCount": total,
        "distribution": distribution,
    }


def build_signal(symbol: str, sentiment: Dict[str, Any], change_24h: float) -> SuggestionSignal:
    label = sentiment["label"]
    score = float(sentiment["score"])
    distribution = sentiment["distribution"]
    article_count = int(sentiment["articleCount"])
    pct = round(change_24h, 2)
    score_pct = int(score * 100)
    direction = "+" if pct >= 0 else ""
    detail = (
        f"{article_count} bài báo gần nhất: "
        f"{distribution['positive']} tích cực, "
        f"{distribution['neutral']} trung lập, "
        f"{distribution['negative']} tiêu cực. "
        f"Giá 24h: {direction}{pct}%."
    )

    if label == "positive":
        if change_24h >= 2.0:
            return SuggestionSignal(
                signal="BULLISH",
                title=f"{symbol} đang có động lượng tăng mạnh",
                reason=f"Tâm lý thị trường tích cực ({score_pct}%) và giá tăng {pct}% trong 24h.",
                detail=detail,
            )
        if change_24h >= 0:
            return SuggestionSignal(
                signal="BULLISH",
                title=f"{symbol} có tâm lý tốt, giá ổn định",
                reason=f"Tin tức tích cực ({score_pct}%), giá tăng nhẹ {pct}% nhưng chưa bứt phá.",
                detail=detail,
            )
        return SuggestionSignal(
            signal="CAUTION",
            title=f"{symbol}: tâm lý tốt nhưng giá đang điều chỉnh",
            reason=f"Tin tức tích cực ({score_pct}%) nhưng giá giảm {abs(pct)}%.",
            detail=detail,
        )

    if label == "negative":
        if change_24h <= -2.0:
            return SuggestionSignal(
                signal="BEARISH",
                title=f"{symbol} đang chịu áp lực bán lớn",
                reason=f"Tâm lý tiêu cực ({score_pct}%) và giá giảm {abs(pct)}% trong 24h.",
                detail=detail,
            )
        if change_24h <= 0:
            return SuggestionSignal(
                signal="BEARISH",
                title=f"{symbol} có tín hiệu tiêu cực nhẹ",
                reason=f"Tin tức tiêu cực ({score_pct}%), giá giảm nhẹ {abs(pct)}%.",
                detail=detail,
            )
        return SuggestionSignal(
            signal="CAUTION",
            title=f"{symbol}: giá tăng nhưng tin tức đáng lo ngại",
            reason=f"Giá tăng {pct}% nhưng tin tức tiêu cực ({score_pct}%).",
            detail=detail,
        )

    if abs(change_24h) < 1.0:
        return SuggestionSignal(
            signal="NEUTRAL",
            title=f"{symbol} đang đi ngang, chưa có xu hướng rõ",
            reason=f"Tâm lý trung lập, giá biến động thấp ({pct}%).",
            detail=detail,
        )
    if change_24h >= 1.0:
        return SuggestionSignal(
            signal="NEUTRAL",
            title=f"{symbol} tăng nhẹ trong bối cảnh tâm lý trung lập",
            reason=f"Giá tăng {pct}% nhưng chưa có tin tức tác động (catalyst) rõ ràng.",
            detail=detail,
        )
    return SuggestionSignal(
        signal="NEUTRAL",
        title=f"{symbol} giảm nhẹ, thị trường chưa có phương hướng",
        reason=f"Giá giảm {abs(pct)}% nhưng tâm lý không quá tiêu cực.",
        detail=detail,
    )


async def fetch_market_price(client: httpx.AsyncClient, coin_id: str) -> PriceInfo:
    response = await client.get(
        f"{GATEWAY_URL}/api/market/price/{coin_id}",
        headers={"X-Internal-Service-Key": INTERNAL_KEY},
    )
    response.raise_for_status()
    data = (response.json().get("data") or {})

    return PriceInfo(
        current=float(data["price"]),
        change24h=round(float(data.get("change24h", 0.0)), 2),
    )


async def fetch_news_sentiments(client: httpx.AsyncClient, symbol: str) -> List[str]:
    response = await client.get(
        f"{GATEWAY_URL}/api/news/coins/{symbol}",
        params={"limit": 5, "page": 1},
        headers={"X-Internal-Service-Key": INTERNAL_KEY},
    )
    response.raise_for_status()
    articles = response.json().get("data", {}).get("news", [])

    sentiments: List[str] = []
    titles_to_analyze: List[str] = []

    for article in articles[:5]:
        sentiment = article.get("sentiment")
        title = normalize_text(article.get("title"))

        if sentiment:
            sentiments.append(sentiment)
        elif title:
            titles_to_analyze.append(title)

    for title in titles_to_analyze:
        try:
            sentiments.append(analyze_text(title).label)
        except HTTPException:
            sentiments.append("neutral")

    return sentiments


async def build_suggestion(symbol: str) -> SuggestionResponse:
    symbol = symbol.upper().strip()
    coin_id = SUPPORTED_COINS.get(symbol)

    if not coin_id:
        supported = ", ".join(SUPPORTED_COINS.keys())
        raise HTTPException(status_code=400, detail=f"Symbol '{symbol}' is not supported. Supported: {supported}")

    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT_SECONDS) as client:
        try:
            price = await fetch_market_price(client, coin_id)
        except Exception as exc:
            logger.warning("Market Service unavailable for %s: %s", symbol, exc)
            raise HTTPException(status_code=503, detail="Market Service is unavailable") from exc

        try:
            news_sentiments = await fetch_news_sentiments(client, symbol)
        except Exception as exc:
            logger.warning("News Service unavailable for %s: %s", symbol, exc)
            news_sentiments = []

    sentiment = aggregate_sentiments(news_sentiments)
    signal = build_signal(symbol, sentiment, price.change24h)

    logger.info(
        "suggestion %s -> %s | sentiment=%s score=%.2f | price=%s change=%s%%",
        symbol,
        signal.signal,
        sentiment["label"],
        sentiment["score"],
        price.current,
        price.change24h,
    )

    return SuggestionResponse(
        symbol=symbol,
        coinId=coin_id,
        price=price,
        sentiment=sentiment,
        suggestion=signal,
        disclaimer=(
            "Đây là thông tin tổng hợp tự động từ tin tức và giá thị trường, "
            "không phải lời khuyên đầu tư."
        ),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
