# Sentiment Service - Detail Notes

Tai lieu nay mo ta `sentiment-service` theo dung source hien tai sau khi da tach file va clean cho Do an 2.

## 1. Muc Tieu

Sentiment Service la Python FastAPI service chay o port `3008`, phu trach:

- Phan tich sentiment cua text bang FinBERT.
- Tra ve nhan `positive`, `negative`, `neutral`.
- Ho tro analyze batch.
- Tong hop market price + news sentiment de tao trade suggestion.

Service nay khong co database. No nhan input, chay inference/tong hop, roi tra output.

## 2. Source Chinh

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

Thu tu doc:

1. `config.py`
2. `models.py`
3. `finbert_service.py`
4. `main.py`
5. `suggestion_service.py`

`__pycache__` va `.pyc` khong phai source code. Python tu sinh khi chay/import, khong can hoc va khong can dua vao bao cao.

## 3. FinBERT La Gi?

Model hien tai:

```text
ProsusAI/finbert
```

Day la pretrained model tren HuggingFace. Project khong train model moi.

Nhiem vu cua service:

```text
Load pretrained model -> inference text -> tra sentiment
```

Khac voi training:

```text
Training:
  can dataset, GPU, epoch, loss, evaluation

Project hien tai:
  chi load model da train san
  dua text vao
  nhan ket qua
```

## 4. `config.py`

Chua cau hinh runtime:

```text
PORT = 3008
MODEL_NAME = ProsusAI/finbert
MAX_TEXT_CHARS = 512
GATEWAY_URL = http://localhost:3000
INTERNAL_SERVICE_KEY
SUPPORTED_COINS
NEUTRAL_SCORES
```

`MAX_TEXT_CHARS` giup cat input truoc khi dua vao model, tranh text qua dai lam cham hoac loi inference.

## 5. `models.py`

Chua Pydantic models:

```text
AnalyzeRequest
BatchAnalyzeRequest
SentimentResult
PriceInfo
SuggestionSignal
SuggestionResponse
```

Pydantic tu validate request/response cho FastAPI.

## 6. `finbert_service.py`

Trach nhiem:

- Load FinBERT mot lan khi app start.
- Kiem tra model da load chua.
- Normalize text.
- Tra neutral neu text rong.
- Raise HTTP 503 neu model chua load.
- Chay analyzer va tra `SentimentResult`.

Luong:

```text
load_model()
  -> transformers.pipeline("text-classification", model=MODEL_NAME, top_k=None)
  -> analyzer nam trong bien global

analyze_text(text)
  -> strip text
  -> neu rong: neutral
  -> neu analyzer None: 503
  -> analyzer(text[:MAX_TEXT_CHARS])
  -> lay label diem cao nhat
  -> tra label, score, scores
```

Model duoc load mot lan trong RAM. Khong load lai moi request.

## 7. `main.py`

FastAPI entrypoint.

Khi service start:

```text
lifespan()
  -> finbert_service.load_model()
```

Endpoints:

```text
GET  /sentiment/health
POST /sentiment/analyze
POST /sentiment/analyze-batch
GET  /sentiment/suggestion?symbol=BTC
```

Health response co:

```text
status
service
model
modelLoaded
version
```

Neu model load fail:

- Service van UP.
- `modelLoaded=false`.
- Analyze endpoint tra 503.

## 8. `suggestion_service.py`

Day la phan AI Suggestion trong do an.

No khong phai AI model trading. No la rule-based engine dua tren:

```text
Market price 24h change
News sentiment distribution
```

Luong:

```text
GET /sentiment/suggestion?symbol=BTC
  -> BTC -> bitcoin
  -> call Gateway /api/market/price/bitcoin
  -> call Gateway /api/news/coins/BTC?limit=5&page=1
  -> aggregate sentiment
  -> build signal
  -> tra SuggestionResponse
```

Header noi bo:

```text
X-Internal-Service-Key: <INTERNAL_SERVICE_KEY>
```

Dung de service-to-service call qua Gateway.

## 9. Aggregate Sentiment

Ham:

```text
aggregate_sentiments(sentiments)
```

Vi du:

```text
positive, positive, neutral, negative, positive
```

Thanh:

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

Neu khong co tin:

```text
label = neutral
score = 0.5
articleCount = 0
```

## 10. Build Signal

Ham:

```text
build_signal(symbol, sentiment, change_24h)
```

Tin hieu:

```text
BULLISH
BEARISH
CAUTION
NEUTRAL
```

Vi du:

```text
sentiment positive + gia 24h tang >= 2%
  -> BULLISH

sentiment negative + gia 24h giam <= -2%
  -> BEARISH

sentiment positive nhung gia giam
  -> CAUTION

sentiment neutral va gia di ngang
  -> NEUTRAL
```

Response luon co disclaimer: day khong phai loi khuyen dau tu.

## 11. Tich Hop Voi News Service

News Service goi:

```text
POST http://localhost:3008/sentiment/analyze
```

Neu Sentiment Service loi, News fallback keyword. Nho vay News Service van chay duoc khi Python service chua san sang.

## 12. Tich Hop Gateway

Trong API Gateway:

```javascript
app.use('/api/sentiment', sentimentProxy);
```

Gateway strip `/api`:

```text
/api/sentiment/analyze -> /sentiment/analyze
```

## 13. Test Va Trang Thai Hien Tai

Da kiem tra:

```text
python -m compileall sentiment-service -> pass
GET http://localhost:3008/sentiment/health -> 200
GET http://localhost:3000/api/sentiment/health -> 200
POST http://localhost:3000/api/sentiment/analyze -> 200
GET http://localhost:3000/api/sentiment/suggestion?symbol=BTC -> 200
```

Sau khi compile/import, Python co the sinh `__pycache__`; thu muc nay da xoa lai de repo sach.

## 14. Nhung Thu Khong Co

Sentiment Service hien tai khong co:

- Database.
- Training pipeline.
- Dataset rieng.
- Fine-tune model.
- Luu lich su suggestion.
- File source trong `__pycache__`.

## 15. Cau Trinh Bay Ngan

Sentiment Service la Python FastAPI service dung pretrained model `ProsusAI/finbert` de phan tich cam xuc tin tuc tai chinh. Service load model mot lan khi start, nhan text va tra `positive/negative/neutral`. Ngoai ra service co endpoint suggestion ket hop gia tu Market Service va sentiment tin tuc tu News Service de tao tin hieu BULLISH/BEARISH/CAUTION/NEUTRAL kem disclaimer. Service khong train model va khong dung database.
