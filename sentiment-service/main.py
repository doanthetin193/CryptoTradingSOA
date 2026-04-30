"""
Sentiment Service — CryptoTrading SOA
Dùng FinBERT (ProsusAI/finbert) để phân tích cảm xúc tiêu đề tin tức tài chính.

FinBERT là BERT được fine-tune trên ~10,000 bài báo tài chính tiếng Anh.
Trả về: positive | negative | neutral với confidence score.
"""

import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List, Optional

import httpx
import uvicorn
from fastapi import FastAPI, HTTPException, Query
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
# Config
# ────────────────────────────────────────────────────────────────────────────
GATEWAY_URL = os.getenv("API_GATEWAY_URL", "http://localhost:3000")
INTERNAL_KEY = os.getenv("INTERNAL_SERVICE_KEY", "cryptotrading-internal-svc-key-2026")

# Mapping symbol → CoinGecko coinId (dùng để gọi market service)
SYMBOL_TO_ID = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "BNB": "binancecoin",
    "SOL": "solana",
    "XRP": "ripple",
    "ADA": "cardano",
    "DOGE": "dogecoin",
    "DOT": "polkadot",
}


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

class PriceInfo(BaseModel):
    current: float
    change24h: float

class SuggestionSignal(BaseModel):
    signal: str                     # BULLISH | BEARISH | NEUTRAL | CAUTION
    title: str
    reason: str
    detail: str

class SuggestionResponse(BaseModel):
    symbol: str
    coinId: str
    price: PriceInfo
    sentiment: dict                 # {label, score, articleCount, distribution}
    suggestion: SuggestionSignal
    disclaimer: str
    timestamp: str


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


@app.get("/sentiment/suggestion", response_model=SuggestionResponse)
async def get_suggestion(symbol: str = Query(..., description="Coin symbol, e.g. BTC, ETH")):
    """
    AI Trade Suggestion cho 1 coin.

    Kết hợp 2 nguồn:
    - Giá thực từ Market Service (giá hiện tại + % thay đổi 24h)
    - Sentiment từ 5 bài báo gần nhất của News Service (phân tích bằng FinBERT)

    Trả về nhận định tổng hợp: BULLISH / BEARISH / NEUTRAL / CAUTION + lý do.
    """
    symbol = symbol.upper()
    coin_id = SYMBOL_TO_ID.get(symbol)
    if not coin_id:
        raise HTTPException(
            status_code=400,
            detail=f"Symbol '{symbol}' không được hỗ trợ. Supported: {', '.join(SYMBOL_TO_ID.keys())}"
        )

    headers = {"X-Internal-Service-Key": INTERNAL_KEY}

    async with httpx.AsyncClient(timeout=10.0) as client:
        # ── 1. Lấy giá từ Market Service qua Gateway ──────────────────────────
        try:
            market_resp = await client.get(
                f"{GATEWAY_URL}/api/market/price/{coin_id}",
                headers=headers
            )
            market_data = market_resp.json()
            coin_price = float(market_data["data"]["price"])
            change_24h = float(market_data["data"].get("change24h", 0.0))
        except Exception as e:
            logger.warning(f"[suggestion] Market Service unavailable: {e}")
            raise HTTPException(status_code=503, detail="Market Service không khả dụng")

        # ── 2. Lấy tin tức từ News Service qua Gateway ────────────────────────
        news_titles: List[str] = []
        news_sentiments: List[str] = []
        try:
            news_resp = await client.get(
                f"{GATEWAY_URL}/api/news/coins/{symbol}",
                params={"limit": 5, "page": 1},
                headers=headers
            )
            if news_resp.status_code == 200:
                news_body = news_resp.json()
                articles = news_body.get("data", {}).get("news", [])
                for a in articles[:5]:
                    title = a.get("title", "")
                    if title:
                        news_titles.append(title)
                    # Dùng sentiment đã có từ News Service (tránh gọi FinBERT lại)
                    s = a.get("sentiment", "neutral")
                    news_sentiments.append(s if s else "neutral")
        except Exception as e:
            logger.warning(f"[suggestion] News Service unavailable: {e}")
            # Fallback: vẫn tiếp tục, chỉ thiếu news context

    # ── 3. Nếu news không có sentiment sẵn → chạy FinBERT ────────────────────
    if news_titles and not any(s != "neutral" for s in news_sentiments):
        # Tất cả đều neutral (chưa có) → tự phân tích
        news_sentiments = []
        for title in news_titles:
            try:
                r = _run_finbert(title)
                news_sentiments.append(r.label)
            except Exception:
                news_sentiments.append("neutral")

    # ── 4. Tổng hợp sentiment từ các bài báo ─────────────────────────────────
    article_count = len(news_sentiments)
    dist = {"positive": 0, "negative": 0, "neutral": 0}
    for s in news_sentiments:
        dist[s] = dist.get(s, 0) + 1

    if article_count == 0:
        agg_label = "neutral"
        agg_score = 0.5
    else:
        # Nhãn chiếm đa số
        agg_label = max(dist, key=lambda k: dist[k])
        agg_score = round(dist[agg_label] / article_count, 2)

    # ── 5. Rule-based: kết hợp sentiment + price movement → signal ───────────
    def _make_signal(sentiment: str, score: float, change: float) -> SuggestionSignal:
        pct = round(change, 2)
        score_pct = int(score * 100)
        dist_str = f"{dist['positive']} tích cực, {dist['neutral']} trung lập, {dist['negative']} tiêu cực"
        detail = f"{article_count} bài báo gần nhất: {dist_str}. Giá 24h: {'+' if pct >= 0 else ''}{pct}%."

        if sentiment == "positive":
            if change >= 2.0:
                return SuggestionSignal(
                    signal="BULLISH",
                    title=f"{symbol} đang có momentum tăng mạnh",
                    reason=f"Tâm lý thị trường tích cực ({score_pct}%) kết hợp giá tăng {pct}% trong 24h.",
                    detail=detail
                )
            elif change >= 0:
                return SuggestionSignal(
                    signal="BULLISH",
                    title=f"{symbol} có tâm lý tốt, giá ổn định",
                    reason=f"Tin tức tích cực ({score_pct}%), giá tăng nhẹ {pct}% — chưa có breakout.",
                    detail=detail
                )
            else:
                return SuggestionSignal(
                    signal="CAUTION",
                    title=f"{symbol}: tâm lý tốt nhưng giá đang điều chỉnh",
                    reason=f"Tin tức tích cực ({score_pct}%) nhưng giá giảm {abs(pct)}% — có thể là cơ hội mua.",
                    detail=detail
                )
        elif sentiment == "negative":
            if change <= -2.0:
                return SuggestionSignal(
                    signal="BEARISH",
                    title=f"{symbol} đang chịu áp lực bán lớn",
                    reason=f"Tâm lý tiêu cực ({score_pct}%) kết hợp giá giảm {abs(pct)}% trong 24h.",
                    detail=detail
                )
            elif change <= 0:
                return SuggestionSignal(
                    signal="BEARISH",
                    title=f"{symbol} có tín hiệu tiêu cực nhẹ",
                    reason=f"Tin tức tiêu cực ({score_pct}%), giá giảm nhẹ {abs(pct)}% — theo dõi thêm.",
                    detail=detail
                )
            else:
                return SuggestionSignal(
                    signal="CAUTION",
                    title=f"{symbol}: giá tăng nhưng tâm lý thị trường lo ngại",
                    reason=f"Giá tăng {pct}% nhưng tin tức tiêu cực ({score_pct}%) — cẩn thận bẫy tăng giá.",
                    detail=detail
                )
        else:  # neutral
            if abs(change) < 1.0:
                return SuggestionSignal(
                    signal="NEUTRAL",
                    title=f"{symbol} đang đi ngang, chưa có xu hướng rõ",
                    reason=f"Tâm lý trung lập, giá biến động thấp ({pct}%) — chờ tín hiệu mạnh hơn.",
                    detail=detail
                )
            elif change >= 1.0:
                return SuggestionSignal(
                    signal="NEUTRAL",
                    title=f"{symbol} tăng nhẹ trong bối cảnh tâm lý trung lập",
                    reason=f"Giá tăng {pct}% nhưng chưa có catalyst rõ ràng từ tin tức.",
                    detail=detail
                )
            else:
                return SuggestionSignal(
                    signal="NEUTRAL",
                    title=f"{symbol} giảm nhẹ, thị trường chưa có phương hướng",
                    reason=f"Giá giảm {abs(pct)}% nhưng tâm lý không đặc biệt tiêu cực.",
                    detail=detail
                )

    signal = _make_signal(agg_label, agg_score, change_24h)

    logger.info(
        f"[suggestion] {symbol} → {signal.signal} | sentiment={agg_label}({agg_score}) | price={coin_price} change={change_24h}%"
    )

    return SuggestionResponse(
        symbol=symbol,
        coinId=coin_id,
        price=PriceInfo(current=coin_price, change24h=round(change_24h, 2)),
        sentiment={
            "label": agg_label,
            "score": agg_score,
            "articleCount": article_count,
            "distribution": dist
        },
        suggestion=signal,
        disclaimer="Đây là thông tin tổng hợp tự động từ tin tức và giá thị trường, không phải lời khuyên đầu tư.",
        timestamp=datetime.now(timezone.utc).isoformat()
    )


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
