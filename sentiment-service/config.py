"""Runtime configuration for the sentiment service."""

import os


MODEL_NAME = os.getenv("SENTIMENT_MODEL", "ProsusAI/finbert")
GATEWAY_URL = os.getenv("API_GATEWAY_URL", "http://localhost:3000").rstrip("/")
INTERNAL_KEY = os.getenv("INTERNAL_SERVICE_KEY", "cryptotrading-internal-svc-key-2026")
MAX_TEXT_CHARS = int(os.getenv("MAX_TEXT_CHARS", "512"))
HTTP_TIMEOUT_SECONDS = float(os.getenv("HTTP_TIMEOUT_SECONDS", "10"))
PORT = int(os.getenv("PORT", "3008"))
UVICORN_LOG_LEVEL = os.getenv("UVICORN_LOG_LEVEL", "info")

SUPPORTED_COINS = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "BNB": "binancecoin",
    "SOL": "solana",
    "XRP": "ripple",
    "ADA": "cardano",
    "DOGE": "dogecoin",
    "DOT": "polkadot",
}

SENTIMENT_LABELS = ("positive", "negative", "neutral")
NEUTRAL_SCORES = {"positive": 0.0, "negative": 0.0, "neutral": 1.0}
