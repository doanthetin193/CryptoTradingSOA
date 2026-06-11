# News Service - Detail Notes

Tai lieu nay mo ta `news-service` theo dung source hien tai sau khi da clean cho Do an 2.

## 1. Muc Tieu

News Service la Java Spring Boot service chay o port `3006`, phu trach:

- Lay tin tuc crypto tu API ngoai.
- Chuan hoa du lieu bai bao ve model `News`.
- Gan coin tags va sentiment cho moi bai.
- Cache tin tuc trong RAM bang Guava Cache.
- Cung cap API cho frontend qua API Gateway.
- Tu dong refresh cache bang Spring Scheduler.

Service nay khong dung database. Tin tuc la du lieu dong, co the lay lai tu API ngoai, nen luu trong RAM cache la du cho do an.

## 2. Source Chinh

```text
news-service/
  src/main/java/com/cryptotrading/news/
    NewsServiceApplication.java
    config/AppConfig.java
    controller/NewsController.java
    model/News.java
    model/PageResponse.java
    provider/CryptoCompareProvider.java
    service/NewsService.java
    service/NewsFetchScheduler.java
    util/SentimentAnalyzer.java
    exception/*
  src/main/resources/application.yml
  src/test/resources/application.yml
```

Thu tu doc code de de hieu:

1. `NewsController.java`
2. `NewsService.java`
3. `CryptoCompareProvider.java`
4. `SentimentAnalyzer.java`
5. `NewsFetchScheduler.java`
6. `application.yml`

## 3. Luong Chinh

```text
Frontend
  -> GET /api/news
API Gateway
  -> strip /api
  -> GET /news
NewsController
  -> NewsService.getNews()
NewsService
  -> doc Guava cache
  -> cache miss thi goi CryptoCompareProvider.fetchLatestNews()
CryptoCompareProvider
  -> thu CryptoCompare
  -> neu fail va co NEWSAPI_KEY thi thu NewsAPI
  -> neu van khong co du lieu thi dung sample data
SentimentAnalyzer
  -> goi Sentiment Service FinBERT
  -> neu Sentiment Service loi thi fallback keyword
Frontend
  -> render danh sach tin
```

## 4. Nguon Du Lieu

Nguon chinh:

```text
CryptoCompare News API
```

Config:

```yaml
cryptocompare:
  api-url: https://min-api.cryptocompare.com/data/v2/news/
  api-key: ${CRYPTOCOMPARE_API_KEY:}
```

`CRYPTOCOMPARE_API_KEY` co the de trong. CryptoCompare co free tier khong can key, key chu yeu giup tang rate limit.

Fallback:

```text
NewsAPI.org
```

Config:

```yaml
newsapi:
  api-key: ${NEWSAPI_KEY:}
```

NewsAPI chi duoc dung khi CryptoCompare fail va co `NEWSAPI_KEY`.

Fallback cuoi:

```text
sample data trong CryptoCompareProvider.buildSampleNews()
```

Dung de demo/test khi API ngoai loi hoac khong tra du lieu.

## 5. Model `News`

`News.java` la object response, khong phai database entity.

Field chinh:

```text
id          - id on dinh tao tu URL/title bang SHA-256
title       - tieu de bai bao
summary     - tom tat
content     - noi dung neu co
source      - nguon bao
url         - link bai goc
imageUrl    - anh thumbnail
sentiment   - positive | negative | neutral
coins       - danh sach coin lien quan, vi du BTC, ETH
publishedAt - thoi diem bai duoc dang
fetchedAt   - thoi diem service lay ve
views       - view gia lap de sap xep trending
```

## 6. `CryptoCompareProvider`

File:

```text
news-service/src/main/java/com/cryptotrading/news/provider/CryptoCompareProvider.java
```

Trach nhiem:

- Goi API ngoai.
- Parse JSON cua CryptoCompare.
- Parse JSON cua NewsAPI khi fallback.
- Bo qua item loi format.
- Gan coin tags bang `SentimentAnalyzer.extractCoins()`.
- Gan sentiment bang `SentimentAnalyzer.analyze()`.
- Tao id on dinh bang `stableId(url, title)`.

Luong fallback:

```text
fetchLatestNews()
  -> CryptoCompare
  -> NewsAPI neu co key va CryptoCompare fail
  -> sample data
```

## 7. `NewsService`

File:

```text
news-service/src/main/java/com/cryptotrading/news/service/NewsService.java
```

Trach nhiem:

- Quan ly `newsCache`.
- Quan ly `trendingCache`.
- Filter theo coin, sentiment, search.
- Pagination.
- Lay chi tiet bai theo id.
- Refresh cache khi scheduler goi.
- Tra cache stats cho health endpoint.

Cache:

```text
newsCache:
  key = "all"
  TTL = cache.news-ttl-hours, mac dinh 24h

trendingCache:
  key = "trending"
  TTL = cache.trending-ttl-hours, mac dinh 6h
```

Ly do cache:

- Giam goi API ngoai.
- Trang News load nhanh hon.
- Cung mot tap tin duoc filter/paginate nhieu cach.

## 8. `SentimentAnalyzer`

File:

```text
news-service/src/main/java/com/cryptotrading/news/util/SentimentAnalyzer.java
```

Trach nhiem:

- Goi Python Sentiment Service:

```text
POST http://localhost:3008/sentiment/analyze
```

- Neu Python service loi, fallback keyword.
- Extract coin symbol tu title/summary.
- Gia lap views de trending co du lieu sap xep.

Day la thiet ke graceful degradation: Sentiment Service chua chay thi News Service van co tin.

## 9. Scheduler Va `@EnableScheduling`

`NewsServiceApplication.java` co:

```java
@EnableScheduling
```

`NewsFetchScheduler.java` dung `@Scheduled` de:

- Refresh cache sau khi service start.
- Refresh dinh ky theo `scheduler.news-fetch-interval-ms`.

Vi vay `@EnableScheduling` la dang dung that trong News Service.

Academy Service khong dung scheduler; seeder cua Academy la `CommandLineRunner`, khong can `@EnableScheduling`.

## 10. API Endpoints

Qua service port:

```text
GET /news
GET /news/{id}
GET /news/trending
GET /news/coins/{coin}
GET /news/health
```

Qua API Gateway:

```text
GET /api/news
GET /api/news/{id}
GET /api/news/trending
GET /api/news/coins/{coin}
GET /api/news/health
```

Query params cua `/news`:

```text
page       - mac dinh 1
limit      - mac dinh 10, toi da 50
coin       - BTC, ETH, SOL...
sentiment  - positive, negative, neutral
search     - tim trong title/summary/source
```

## 11. Tich Hop Gateway

Trong `backend/api-gateway/server.js`:

```javascript
app.use('/api/news', newsProxy);
```

Gateway chi strip `/api`:

```text
/api/news/health -> /news/health
```

News la route public, khong bat buoc dang nhap.

## 12. Test Va Trang Thai Hien Tai

Da kiem tra:

```text
news-service: mvnw test pass
GET http://localhost:3006/news/health -> 200
GET http://localhost:3000/api/news/health -> 200
GET http://localhost:3000/api/news?limit=3&page=1 -> 200
```

Test profile da tat Consul/discovery/auto-registration trong:

```text
news-service/src/test/resources/application.yml
```

Muc dich: test context khong phu thuoc Consul dang chay hay khong.

## 13. Nhung Thu Khong Con Dung

News Service hien tai khong dung:

- CryptoPanic.
- Database rieng.
- YouTube/playlist.
- Luu tin vao MongoDB/MySQL.

Neu thay tai lieu cu nhac CryptoPanic thi do la roadmap/ban cu, khong phai code hien tai.

## 14. Cau Trinh Bay Ngan

News Service la service Java Spring Boot doc lap trong he thong SOA, dung de lay tin crypto tu CryptoCompare, fallback NewsAPI/sample, gan sentiment bang FinBERT thong qua Sentiment Service, cache bang Guava va cung cap API filter/search/trending cho frontend. Service khong dung database vi tin tuc la du lieu dong va co the refresh dinh ky.
