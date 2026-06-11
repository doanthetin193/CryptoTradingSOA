# Sentiment Service Explained

File nÃ y mÃ´ táº£ Ä‘Ãºng tráº¡ng thÃ¡i hiá»‡n táº¡i cá»§a `sentiment-service` sau khi Ä‘Ã£ tÃ¡ch file, clean code vÃ  hoÃ n thiá»‡n logic AI/suggestion cho Ä‘á»“ Ã¡n 2.

## 1. Vai trÃ² cá»§a Sentiment Service

`sentiment-service` lÃ  service AI/NLP cá»§a há»‡ thá»‘ng.

Nhiá»‡m vá»¥ chÃ­nh:

- Nháº­n text vÃ  phÃ¢n loáº¡i sentiment: `positive`, `negative`, `neutral`.
- DÃ¹ng model FinBERT Ä‘á»ƒ hiá»ƒu ngá»¯ cáº£nh tÃ i chÃ­nh tá»‘t hÆ¡n keyword thá»§ cÃ´ng.
- Há»— trá»£ batch analyze nhiá»u text.
- Cung cáº¥p endpoint suggestion cho má»™t coin, káº¿t há»£p:
  - GiÃ¡ hiá»‡n táº¡i tá»« Market Service.
  - Tin tá»©c gáº§n nháº¥t tá»« News Service.
  - Sentiment tá»•ng há»£p tá»« cÃ¡c bÃ i viáº¿t.
- Tráº£ tÃ­n hiá»‡u tham kháº£o: `BULLISH`, `BEARISH`, `CAUTION`, `NEUTRAL`.

Service nÃ y viáº¿t báº±ng Python vÃ¬ há»‡ sinh thÃ¡i AI/ML cá»§a Python máº¡nh hÆ¡n Java/Node.js, Ä‘áº·c biá»‡t vá»›i HuggingFace Transformers vÃ  PyTorch.

## 2. CÃ´ng nghá»‡ sá»­ dá»¥ng

```text
Language: Python
Framework: FastAPI
Server: Uvicorn
Port: 3008
AI model: ProsusAI/finbert
ML library: HuggingFace Transformers + PyTorch CPU
Validation: Pydantic
HTTP client: httpx
```

## 3. FinBERT lÃ  gÃ¬?

FinBERT lÃ  BERT Ä‘Æ°á»£c fine-tune cho ngÃ´n ngá»¯ tÃ i chÃ­nh.

NÃ³ phÃ¹ há»£p hÆ¡n keyword matching vÃ¬ biáº¿t Ä‘á»c ngá»¯ cáº£nh.

VÃ­ dá»¥:

```text
"Bitcoin falls but analysts expect recovery"
```

Keyword cÃ³ thá»ƒ tháº¥y `falls` vÃ  cho lÃ  negative. FinBERT Ä‘á»c cáº£ cÃ¢u vÃ  cÃ³ thá»ƒ Ä‘Ã¡nh giÃ¡ cÃ¢n báº±ng hÆ¡n vÃ¬ cÃ³ ngá»¯ cáº£nh `expect recovery`.

Trong project nÃ y, mÃ¬nh khÃ´ng train model láº¡i. Ta dÃ¹ng model pretrained `ProsusAI/finbert` tá»« HuggingFace. Service chá»‰ load model vÃ  cháº¡y inference.

## 4. Cáº¥u trÃºc file hiá»‡n táº¡i

```text
sentiment-service/
  main.py
  config.py
  models.py
  finbert_service.py
  suggestion_service.py
  requirements.txt
  start.ps1
```

TrÆ°á»›c Ä‘Ã¢y service gom nhiá»u logic trong `main.py`. Hiá»‡n táº¡i Ä‘Ã£ tÃ¡ch ra Ä‘á»ƒ dá»… review:

| File | Vai trÃ² |
|---|---|
| `main.py` | FastAPI app, lifespan, routes |
| `config.py` | Cáº¥u hÃ¬nh env, model name, port, supported coins |
| `models.py` | Pydantic request/response models |
| `finbert_service.py` | Load model vÃ  analyze text |
| `suggestion_service.py` | Logic gá»£i Ã½ coin dá»±a trÃªn giÃ¡ vÃ  news sentiment |
| `requirements.txt` | Python dependencies |
| `start.ps1` | Script start service trÃªn Windows |

## 5. `config.py`

Chá»©a cáº¥u hÃ¬nh runtime:

```python
MODEL_NAME = os.getenv("SENTIMENT_MODEL", "ProsusAI/finbert")
GATEWAY_URL = os.getenv("API_GATEWAY_URL", "http://localhost:3000").rstrip("/")
INTERNAL_KEY = os.getenv("INTERNAL_SERVICE_KEY", "cryptotrading-internal-svc-key-2026")
MAX_TEXT_CHARS = int(os.getenv("MAX_TEXT_CHARS", "512"))
HTTP_TIMEOUT_SECONDS = float(os.getenv("HTTP_TIMEOUT_SECONDS", "10"))
PORT = int(os.getenv("PORT", "3008"))
```

`SUPPORTED_COINS` map symbol frontend sang coinId cá»§a Market Service:

```python
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
```

VÃ­ dá»¥ frontend chá»n `BTC`, suggestion service sáº½ gá»i Market API vá»›i `bitcoin`.

## 6. `models.py`

Chá»©a Pydantic models.

Request:

```python
class AnalyzeRequest(BaseModel):
    text: str

class BatchAnalyzeRequest(BaseModel):
    texts: List[str]
```

Response sentiment:

```python
class SentimentResult(BaseModel):
    label: str
    score: float
    scores: Dict[str, float]
```

VÃ­ dá»¥ response:

```json
{
  "label": "positive",
  "score": 0.9342,
  "scores": {
    "positive": 0.9342,
    "negative": 0.0123,
    "neutral": 0.0535
  }
}
```

Response suggestion:

```python
class SuggestionResponse(BaseModel):
    symbol: str
    coinId: str
    price: PriceInfo
    sentiment: Dict[str, Any]
    suggestion: SuggestionSignal
    disclaimer: str
    timestamp: str
```

## 7. `finbert_service.py`

ÄÃ¢y lÃ  pháº§n AI core.

### Load model

```python
def load_model() -> bool:
    from transformers import pipeline

    analyzer = pipeline(
        "text-classification",
        model=MODEL_NAME,
        top_k=None,
        device=-1,
    )
```

Ã nghÄ©a:

- `MODEL_NAME`: máº·c Ä‘á»‹nh `ProsusAI/finbert`.
- `top_k=None`: láº¥y Ä‘á»§ Ä‘iá»ƒm cá»§a cáº£ 3 nhÃ£n.
- `device=-1`: cháº¡y CPU, khÃ´ng cáº§n GPU.

Model Ä‘Æ°á»£c load má»™t láº§n khi FastAPI start, khÃ´ng load láº¡i má»—i request.

### Analyze text

```python
def analyze_text(text: str) -> SentimentResult:
    clean_text = normalize_text(text)
    if not clean_text:
        return neutral_result()

    if analyzer is None:
        raise HTTPException(status_code=503, detail="FinBERT model not loaded yet")

    raw_results = analyzer(clean_text[:MAX_TEXT_CHARS])
```

Äiá»ƒm quan trá»ng:

- Text rá»—ng tráº£ `neutral`.
- Náº¿u model chÆ°a load, tráº£ HTTP 503.
- Text bá»‹ cáº¯t á»Ÿ `MAX_TEXT_CHARS`, máº·c Ä‘á»‹nh 512 kÃ½ tá»± Ä‘á»ƒ trÃ¡nh input quÃ¡ dÃ i.
- Láº¥y nhÃ£n cÃ³ score cao nháº¥t lÃ m `label`.
- Váº«n tráº£ full `scores` Ä‘á»ƒ frontend/debug hiá»ƒu model tá»± tin bao nhiÃªu.

## 8. `suggestion_service.py`

ÄÃ¢y lÃ  logic gá»£i Ã½ xu hÆ°á»›ng coin.

Luá»“ng chÃ­nh:

```text
build_suggestion(symbol)
  -> map symbol sang coinId
  -> fetch_market_price()
  -> fetch_news_sentiments()
  -> aggregate_sentiments()
  -> build_signal()
  -> tráº£ SuggestionResponse
```

### `fetch_market_price()`

Gá»i Market Service qua Gateway:

```text
GET {GATEWAY_URL}/api/market/price/{coinId}
Header: X-Internal-Service-Key
```

Káº¿t quáº£ láº¥y:

- `current`: giÃ¡ hiá»‡n táº¡i.
- `change24h`: biáº¿n Ä‘á»™ng 24h.

### `fetch_news_sentiments()`

Gá»i News Service qua Gateway:

```text
GET {GATEWAY_URL}/api/news/coins/{symbol}?limit=5&page=1
Header: X-Internal-Service-Key
```

Service láº¥y tá»‘i Ä‘a 5 bÃ i gáº§n nháº¥t liÃªn quan coin Ä‘Ã³.

Náº¿u bÃ i Ä‘Ã£ cÃ³ `sentiment`, dÃ¹ng luÃ´n.

Náº¿u bÃ i chÆ°a cÃ³ `sentiment` nhÆ°ng cÃ³ title, gá»i `analyze_text(title)` Ä‘á»ƒ phÃ¢n tÃ­ch.

Náº¿u News Service lá»—i, suggestion váº«n cháº¡y vá»›i sentiment rá»—ng vÃ  coi lÃ  neutral.

### `aggregate_sentiments()`

Äáº¿m sá»‘ bÃ i:

```text
positive / negative / neutral
```

Sau Ä‘Ã³ chá»n nhÃ£n xuáº¥t hiá»‡n nhiá»u nháº¥t lÃ m sentiment tá»•ng.

VÃ­ dá»¥:

```json
{
  "label": "positive",
  "score": 0.6,
  "articleCount": 5,
  "distribution": {
    "positive": 3,
    "negative": 1,
    "neutral": 1
  }
}
```

### `build_signal()`

Káº¿t há»£p sentiment vÃ  `change24h` Ä‘á»ƒ táº¡o tÃ­n hiá»‡u.

Quy táº¯c hiá»‡n táº¡i:

- Sentiment positive + giÃ¡ tÄƒng máº¡nh: `BULLISH`.
- Sentiment negative + giÃ¡ giáº£m máº¡nh: `BEARISH`.
- Sentiment vÃ  giÃ¡ ngÆ°á»£c nhau: `CAUTION`.
- Sentiment neutral hoáº·c giÃ¡ Ä‘i ngang: `NEUTRAL`.

ÄÃ¢y lÃ  rule-based suggestion, khÃ´ng pháº£i model trading tá»± train.

Response luÃ´n cÃ³ disclaimer:

```text
ÄÃ¢y lÃ  thÃ´ng tin tá»•ng há»£p tá»± Ä‘á»™ng, khÃ´ng pháº£i lá»i khuyÃªn Ä‘áº§u tÆ°.
```

## 9. `main.py`

ÄÃ¢y lÃ  entrypoint FastAPI.

### Lifespan

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    finbert_service.load_model()
    yield
```

Khi service start, FinBERT Ä‘Æ°á»£c load vÃ o RAM.

### Endpoints

| Method | Path | Ã nghÄ©a |
|---|---|---|
| GET | `/sentiment/health` | Health check, cÃ³ `modelLoaded` |
| POST | `/sentiment/analyze` | Analyze má»™t text |
| POST | `/sentiment/analyze-batch` | Analyze nhiá»u text |
| GET | `/sentiment/suggestion?symbol=BTC` | Gá»£i Ã½ xu hÆ°á»›ng coin |

## 10. TÃ­ch há»£p vá»›i News Service

News Service Java gá»i Sentiment Service trong:

```text
news-service/src/main/java/com/cryptotrading/news/util/SentimentAnalyzer.java
```

Luá»“ng:

```text
CryptoCompareProvider parse bÃ i viáº¿t
  -> SentimentAnalyzer.analyze(title, summary)
  -> POST /sentiment/analyze
  -> nháº­n label
  -> set vÃ o News.sentiment
```

Náº¿u Python service down:

```text
SentimentAnalyzer fallback keyword matching
```

VÃ¬ váº­y News Service khÃ´ng bá»‹ cháº¿t theo Sentiment Service.

## 11. TÃ­ch há»£p vá»›i API Gateway

Trong Gateway:

```text
/api/sentiment/* -> /sentiment/*
target: http://localhost:3008
```

Gateway chá»‰ strip `/api`.

VÃ­ dá»¥:

```text
Frontend gá»i: /api/sentiment/suggestion?symbol=BTC
Gateway gá»­i:  /sentiment/suggestion?symbol=BTC
```

Sentiment Service hiá»‡n khÃ´ng dÃ¹ng Consul router trong Gateway, target máº·c Ä‘á»‹nh lÃ  `localhost:3008`.

## 12. Frontend liÃªn quan

File API helper:

```text
frontend/src/services/api.js
```

Hiá»‡n Ä‘ang cÃ³:

```javascript
export const sentimentAPI = {
  getSuggestion: (symbol) => api.get('/sentiment/suggestion', { params: { symbol } }),
};
```

Frontend dÃ¹ng endpoint nÃ y á»Ÿ pháº§n AI Suggestion Ä‘á»ƒ há»i xu hÆ°á»›ng coin.

## 13. Nhá»¯ng Ä‘iá»ƒm Ä‘Ã£ clean/cáº£i thiá»‡n

- TÃ¡ch service tá»« má»™t file lá»›n thÃ nh module nhá»:
  - config
  - models
  - finbert_service
  - suggestion_service
  - main
- `main.py` chá»‰ cÃ²n route vÃ  app setup.
- FinBERT logic náº±m riÃªng trong `finbert_service.py`.
- Suggestion logic náº±m riÃªng trong `suggestion_service.py`.
- Cáº¥u hÃ¬nh Ä‘á»c tá»« env trong `config.py`.
- Batch analyze dÃ¹ng láº¡i `analyze_text()`, khÃ´ng duplicate logic.
- Suggestion cÃ³ xá»­ lÃ½ lá»—i Market/News rÃµ rÃ ng.

## 14. Thá»© tá»± Ä‘á»c code Ä‘á» xuáº¥t

Náº¿u báº¡n muá»‘n hiá»ƒu Sentiment Service Ä‘á»ƒ trÃ¬nh bÃ y:

1. `models.py` - hiá»ƒu request/response service tráº£ vá».
2. `config.py` - hiá»ƒu model, port, coin mapping, internal key.
3. `finbert_service.py` - hiá»ƒu FinBERT load vÃ  inference.
4. `main.py` - hiá»ƒu endpoint FastAPI expose ra ngoÃ i.
5. `suggestion_service.py` - hiá»ƒu logic gá»£i Ã½ coin.
6. `news-service/.../SentimentAnalyzer.java` - hiá»ƒu News Service gá»i AI nhÆ° tháº¿ nÃ o.
7. `backend/api-gateway/server.js` - xem route `/api/sentiment`.
8. `frontend/src/services/api.js` vÃ  trang AI Suggestion - xem frontend gá»i API.

## 15. CÃ¢u nÃ³i ngáº¯n Ä‘á»ƒ trÃ¬nh bÃ y

Sentiment Service lÃ  má»™t Python FastAPI service chuyÃªn xá»­ lÃ½ AI/NLP trong há»‡ thá»‘ng SOA. Service load model FinBERT pretrained má»™t láº§n khi khá»Ÿi Ä‘á»™ng, cung cáº¥p API phÃ¢n tÃ­ch sentiment cho text/news, Ä‘á»“ng thá»i cÃ³ endpoint suggestion káº¿t há»£p sentiment tin tá»©c vÃ  biáº¿n Ä‘á»™ng giÃ¡ thá»‹ trÆ°á»ng Ä‘á»ƒ tráº£ tÃ­n hiá»‡u tham kháº£o cho tá»«ng coin.

## 16. Kiáº¿n Thá»©c Ná»n TrÆ°á»›c Khi Äá»c Sentiment Service

Sentiment Service cÃ³ 2 nhÃ³m chá»©c nÄƒng:

```text
1. Analyze sentiment:
   text -> FinBERT -> positive/negative/neutral

2. Suggestion:
   symbol -> láº¥y giÃ¡ + láº¥y tin -> tá»•ng há»£p sentiment -> tÃ­n hiá»‡u tham kháº£o
```

Náº¿u má»›i há»c, hÃ£y tÃ¡ch hai pháº§n nÃ y ra. Äá»«ng Ä‘á»c `suggestion_service.py` trÆ°á»›c, vÃ¬ nÃ³ phá»¥ thuá»™c vÃ o viá»‡c báº¡n hiá»ƒu `analyze_text()` rá»“i.

## 17. FastAPI LÃ  GÃ¬?

FastAPI lÃ  web framework Python dÃ¹ng Ä‘á»ƒ viáº¿t REST API.

Trong service nÃ y:

```python
app = FastAPI(...)
```

táº¡o má»™t web app.

CÃ¡c decorator nhÆ°:

```python
@app.get("/sentiment/health")
@app.post("/sentiment/analyze")
```

Ä‘á»‹nh nghÄ©a endpoint.

So sÃ¡nh vá»›i Spring Boot:

```text
FastAPI @app.get       ~ Spring @GetMapping
FastAPI @app.post      ~ Spring @PostMapping
Pydantic BaseModel     ~ Java DTO
uvicorn                ~ embedded server/Tomcat tÆ°Æ¡ng tá»± vai trÃ² cháº¡y app
```

## 18. Pydantic LÃ  GÃ¬?

Pydantic validate dá»¯ liá»‡u request/response.

VÃ­ dá»¥:

```python
class AnalyzeRequest(BaseModel):
    text: str
```

NghÄ©a lÃ  endpoint `/sentiment/analyze` báº¯t buá»™c nháº­n JSON cÃ³ field `text`.

Náº¿u client gá»­i sai:

```json
{
  "message": "hello"
}
```

FastAPI/Pydantic tá»± tráº£ lá»—i 422 vÃ¬ thiáº¿u `text`.

`response_model=SentimentResult` nghÄ©a lÃ  FastAPI sáº½ chuáº©n hÃ³a response theo model `SentimentResult`.

## 19. Lifespan LÃ  GÃ¬?

Trong `main.py`:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    finbert_service.load_model()
    yield
    logger.info("Sentiment service shutting down")
```

Lifespan lÃ  lifecycle cá»§a app:

```text
Service start
  -> load_model()
  -> app báº¯t Ä‘áº§u nháº­n request
Service shutdown
  -> cháº¡y pháº§n sau yield
```

VÃ¬ sao khÃ´ng load model trong tá»«ng request?

VÃ¬ FinBERT náº·ng. Náº¿u má»—i request load láº¡i model thÃ¬ request sáº½ ráº¥t cháº­m vÃ  tá»‘n RAM.

Thiáº¿t káº¿ Ä‘Ãºng:

```text
Load model má»™t láº§n khi service start.
Sau Ä‘Ã³ má»i request dÃ¹ng láº¡i model trong RAM.
```

## 20. FinBERT Inference Äi Qua Nhá»¯ng BÆ°á»›c NÃ o?

Luá»“ng trong `finbert_service.analyze_text()`:

```text
1. Nháº­n text.
2. Trim text.
3. Náº¿u text rá»—ng -> tráº£ neutral.
4. Náº¿u model chÆ°a load -> HTTP 503.
5. Cáº¯t text tá»‘i Ä‘a MAX_TEXT_CHARS.
6. ÄÆ°a text vÃ o HuggingFace pipeline.
7. Nháº­n score cho 3 nhÃ£n.
8. Chá»n nhÃ£n cÃ³ score cao nháº¥t.
9. Tráº£ SentimentResult.
```

VÃ­ dá»¥ input:

```json
{
  "text": "Bitcoin rallies as ETF inflows surge"
}
```

Response:

```json
{
  "label": "positive",
  "score": 0.91,
  "scores": {
    "positive": 0.91,
    "negative": 0.02,
    "neutral": 0.07
  }
}
```

`score` lÃ  Ä‘á»™ tá»± tin cá»§a nhÃ£n Ä‘Æ°á»£c chá»n.

## 21. VÃ¬ Sao KhÃ´ng Train Model?

Project nÃ y khÃ´ng train láº¡i model.

LÃ½ do:

- Training cáº§n dataset lá»›n.
- Training tá»‘n GPU/thá»i gian.
- Má»¥c tiÃªu Ä‘á»“ Ã¡n lÃ  tÃ­ch há»£p AI service vÃ o SOA, khÃ´ng pháº£i nghiÃªn cá»©u model má»›i.

Ta dÃ¹ng pretrained model:

```text
ProsusAI/finbert
```

Service chá»‰ lÃ m inference:

```text
text -> model cÃ³ sáºµn -> label
```

ÄÃ¢y lÃ  hÆ°á»›ng há»£p lÃ½ cho Ä‘á»“ Ã¡n á»©ng dá»¥ng.

## 22. `config.py` Äá»c NhÆ° Tháº¿ NÃ o?

`config.py` gom toÃ n bá»™ cáº¥u hÃ¬nh.

Äiá»ƒm quan trá»ng:

```python
MODEL_NAME = os.getenv("SENTIMENT_MODEL", "ProsusAI/finbert")
PORT = int(os.getenv("PORT", "3008"))
MAX_TEXT_CHARS = int(os.getenv("MAX_TEXT_CHARS", "512"))
GATEWAY_URL = os.getenv("API_GATEWAY_URL", "http://localhost:3000").rstrip("/")
```

Náº¿u khÃ´ng set env, service dÃ¹ng default.

VÃ­ dá»¥:

```text
KhÃ´ng set PORT -> cháº¡y 3008
KhÃ´ng set SENTIMENT_MODEL -> dÃ¹ng ProsusAI/finbert
KhÃ´ng set API_GATEWAY_URL -> gá»i gateway localhost:3000
```

`SUPPORTED_COINS` lÃ  mapping:

```text
BTC -> bitcoin
ETH -> ethereum
SOL -> solana
```

Mapping nÃ y cáº§n cho suggestion vÃ¬ frontend dÃ¹ng symbol, cÃ²n Market Service dÃ¹ng coinId.

## 23. `suggestion_service.py` SÃ¢u HÆ¡n

Suggestion khÃ´ng pháº£i AI model trading.

NÃ³ lÃ  rule-based decision dá»±a trÃªn:

```text
Market price 24h change
News sentiment distribution
```

Luá»“ng:

```text
build_suggestion("BTC")
  -> BTC -> bitcoin
  -> fetch_market_price("bitcoin")
  -> fetch_news_sentiments("BTC")
  -> aggregate_sentiments()
  -> build_signal()
```

### `aggregate_sentiments()`

Náº¿u 5 bÃ i gáº§n nháº¥t cÃ³:

```text
positive, positive, neutral, negative, positive
```

ThÃ¬ distribution:

```json
{
  "positive": 3,
  "negative": 1,
  "neutral": 1
}
```

Label tá»•ng lÃ  `positive`, score lÃ  `3/5 = 0.6`.

### `build_signal()`

Káº¿t há»£p sentiment vÃ  giÃ¡.

VÃ­ dá»¥:

```text
sentiment = positive
change24h = +3.2
-> BULLISH
```

VÃ­ dá»¥ khÃ¡c:

```text
sentiment = positive
change24h = -2.5
-> CAUTION
```

VÃ¬ tin tá»‘t nhÆ°ng giÃ¡ Ä‘ang giáº£m, há»‡ thá»‘ng tháº­n trá»ng.

## 24. API Response Máº«u

### `POST /api/sentiment/analyze`

Request:

```json
{
  "text": "Ethereum upgrade reduces fees"
}
```

Response:

```json
{
  "label": "positive",
  "score": 0.88,
  "scores": {
    "positive": 0.88,
    "negative": 0.03,
    "neutral": 0.09
  }
}
```

### `POST /api/sentiment/analyze-batch`

Request:

```json
{
  "texts": [
    "Bitcoin rallies strongly",
    "Exchange hacked, users lose funds"
  ]
}
```

Response:

```json
[
  {
    "label": "positive",
    "score": 0.9,
    "scores": {}
  },
  {
    "label": "negative",
    "score": 0.92,
    "scores": {}
  }
]
```

Thá»±c táº¿ `scores` sáº½ cÃ³ Ä‘á»§ 3 nhÃ£n.

### `GET /api/sentiment/suggestion?symbol=BTC`

Response:

```json
{
  "symbol": "BTC",
  "coinId": "bitcoin",
  "price": {
    "current": 68000,
    "change24h": 2.5
  },
  "sentiment": {
    "label": "positive",
    "score": 0.6,
    "articleCount": 5,
    "distribution": {
      "positive": 3,
      "negative": 1,
      "neutral": 1
    }
  },
  "suggestion": {
    "signal": "BULLISH",
    "title": "BTC dang co momentum tang manh",
    "reason": "Tam ly thi truong tich cuc...",
    "detail": "..."
  },
  "disclaimer": "Day la thong tin tong hop tu dong...",
  "timestamp": "2026-06-11T10:00:00Z"
}
```

LÆ°u Ã½: má»™t sá»‘ text trong suggestion hiá»‡n lÃ  ASCII khÃ´ng dáº¥u Ä‘á»ƒ trÃ¡nh lá»—i encoding runtime.

## 25. TÃ­ch Há»£p Service-To-Service

Sentiment Service gá»i cÃ¡c service khÃ¡c qua Gateway:

```text
Sentiment -> Gateway -> Market Service
Sentiment -> Gateway -> News Service
```

NÃ³ gá»­i header:

```text
X-Internal-Service-Key: ...
```

Ã nghÄ©a:

```text
ÄÃ¢y lÃ  request ná»™i bá»™ giá»¯a service vá»›i service.
KhÃ´ng pháº£i request trá»±c tiáº¿p tá»« user.
```

Vá»›i suggestion:

```text
Market Service cung cáº¥p giÃ¡.
News Service cung cáº¥p tin tá»©c/sentiment.
Sentiment Service tá»•ng há»£p thÃ nh tÃ­n hiá»‡u.
```

## 26. VÃ¬ Sao Sentiment Service KhÃ´ng DÃ¹ng Database?

VÃ¬ nÃ³ khÃ´ng cáº§n lÆ°u state lÃ¢u dÃ i.

NÃ³ nháº­n input vÃ  tráº£ output:

```text
text -> sentiment
symbol -> suggestion
```

Model náº±m trong RAM, khÃ´ng pháº£i dá»¯ liá»‡u business cáº§n lÆ°u vÃ o database.

Náº¿u cáº§n audit lá»‹ch sá»­ suggestion vá» sau thÃ¬ má»›i thÃªm DB. Vá»›i Ä‘á»“ Ã¡n hiá»‡n táº¡i, khÃ´ng cáº§n.

## 27. CÃ¢u Há»i Giáº£ng ViÃªn CÃ³ Thá»ƒ Há»i

### FinBERT cÃ³ pháº£i do mÃ¬nh tá»± train khÃ´ng?

KhÃ´ng. MÃ¬nh dÃ¹ng pretrained model `ProsusAI/finbert` vÃ  tÃ­ch há»£p vÃ o service Ä‘á»ƒ cháº¡y inference.

### VÃ¬ sao dÃ¹ng Python?

VÃ¬ Python cÃ³ há»‡ sinh thÃ¡i AI máº¡nh, HuggingFace Transformers há»— trá»£ trá»±c tiáº¿p FinBERT.

### Náº¿u model load lá»—i thÃ¬ sao?

Health endpoint váº«n bÃ¡o service UP nhÆ°ng `modelLoaded=false`. Analyze endpoint sáº½ tráº£ 503.

### Suggestion cÃ³ pháº£i lá»i khuyÃªn Ä‘áº§u tÆ° khÃ´ng?

KhÃ´ng. NÃ³ lÃ  tÃ­n hiá»‡u tham kháº£o tá»± Ä‘á»™ng tá»« sentiment tin tá»©c vÃ  biáº¿n Ä‘á»™ng giÃ¡. Response cÃ³ disclaimer.

### VÃ¬ sao News Service cÅ©ng cÃ³ fallback keyword?

Äá»ƒ News khÃ´ng bá»‹ cháº¿t khi Sentiment Service chÆ°a cháº¡y hoáº·c model chÆ°a load.

## 28. CÃ¡ch Tá»± Test

Health:

```powershell
Invoke-RestMethod http://localhost:3008/sentiment/health
```

Analyze:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:3008/sentiment/analyze `
  -ContentType "application/json" `
  -Body '{"text":"Bitcoin rallies as ETF demand grows"}'
```

Suggestion:

```powershell
Invoke-RestMethod "http://localhost:3008/sentiment/suggestion?symbol=BTC"
```

Qua Gateway:

```powershell
Invoke-RestMethod "http://localhost:3000/api/sentiment/suggestion?symbol=BTC"
```

## 29. CÃ¡ch Nhá»› Nhanh

```text
config.py = báº£ng cáº¥u hÃ¬nh
models.py = há»£p Ä‘á»“ng request/response
finbert_service.py = bá»™ nÃ£o phÃ¢n tÃ­ch sentiment
suggestion_service.py = ngÆ°á»i tá»•ng há»£p giÃ¡ + tin Ä‘á»ƒ gá»£i Ã½
main.py = cá»•ng API FastAPI
```

## Trạng Thái Sau Khi Rà Soát Mới Nhất

Mình đã đối chiếu lại tài liệu này với code hiện tại của `sentiment-service`. Trạng thái chuẩn hiện tại là:

```text
Source chính:
- main.py
- config.py
- models.py
- finbert_service.py
- suggestion_service.py
- requirements.txt
- start.ps1
```

Những điểm đã chốt theo source:

```text
- Không có database riêng trong Sentiment Service.
- Không train model mới; service dùng pretrained model ProsusAI/finbert.
- Model được load một lần trong FastAPI lifespan khi service start.
- Nếu model load thất bại, health vẫn trả service UP nhưng modelLoaded=false; endpoint analyze sẽ trả 503.
- analyze_text() cắt input theo MAX_TEXT_CHARS, mặc định 512 ký tự.
- suggestion_service gọi Market Service và News Service qua API Gateway.
- request nội bộ dùng header X-Internal-Service-Key lấy từ INTERNAL_SERVICE_KEY.
- Nếu News Service lỗi, suggestion vẫn chạy với sentiment rỗng và aggregate về neutral.
- Nếu Market Service lỗi, suggestion trả HTTP 503 vì không có dữ liệu giá để ra tín hiệu.
```

Đã dọn phần rác tự sinh:

```text
- Đã xóa sentiment-service/__pycache__.
- Các file .pyc không phải source code, không cần đưa vào tài liệu hoặc review với giảng viên.
```

Khi review code, chỉ cần đọc các file `.py` chính ở trên. Không cần quan tâm `__pycache__` vì Python sẽ tự sinh lại nếu chạy service.