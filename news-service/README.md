# News Service (Java Spring Boot)

Microservice cung cáº¥p tin tá»©c crypto, chá»©ng minh kiáº¿n trÃºc **SOA language-agnostic**.

## Tech Stack

- **Language**: Java 21
- **Framework**: Spring Boot 3.2.4
- **Cache**: Guava Cache (in-memory, TTL 24h)
- **Port**: 3006
- **Build**: Maven 3.9.6

## Khá»Ÿi Ä‘á»™ng

```powershell
# Cháº¡y script start
.\start.ps1

# Hoáº·c trá»±c tiáº¿p (sau khi Ä‘Ã£ build)
java -jar target\news-service-1.0.0.jar
```

## Build

```powershell
# Maven cÃ i táº¡i C:\maven\apache-maven-3.9.6
& "C:\maven\apache-maven-3.9.6\bin\mvn.cmd" clean package -DskipTests
```

## API Endpoints

| Method | Path | MÃ´ táº£ |
|--------|------|-------|
| GET | `/news` | Danh sÃ¡ch tin (há»— trá»£ filter + paginate) |
| GET | `/news/{id}` | Chi tiáº¿t bÃ i bÃ¡o |
| GET | `/news/trending` | Top tin trending |
| GET | `/news/coins/{coin}` | Tin theo coin |
| GET | `/health` | Health check |

### Query Params cho GET /news

| Param | Máº·c Ä‘á»‹nh | MÃ´ táº£ |
|-------|---------|-------|
| page | 1 | Trang (1-based) |
| limit | 10 | Tin/trang (max 50) |
| coin | - | Lá»c theo coin (BTC, ETH,...) |
| sentiment | - | positive / negative / neutral |
| search | - | TÃ¬m kiáº¿m trong tiÃªu Ä‘á» |

## Cáº¥u hÃ¬nh CryptoCompare API (tÃ¹y chá»n)

1. ÄÄƒng kÃ½ táº¡i https://www.cryptocompare.com/cryptopian/api-keys
2. Láº¥y API key
3. Set environment variable:

```powershell
$env:CRYPTOCOMPARE_API_KEY = "your-cryptocompare-key"
$env:NEWSAPI_KEY = "your-newsapi-key"
```

CryptoCompare co the chay free tier khi khong co key. Neu API ngoai loi hoac khong co du lieu, service se dung 10 bai tin mau de demo.

## TÃ­ch há»£p

- **API Gateway**: `GET /api/news/*` proxy tá»›i service nÃ y
- **Consul**: Tá»± Ä‘á»™ng Ä‘Äƒng kÃ½ khi Consul Ä‘ang cháº¡y (fail-safe náº¿u khÃ´ng cÃ³)
- **Frontend**: Trang `/news` vÃ  widget trÃªn Dashboard
