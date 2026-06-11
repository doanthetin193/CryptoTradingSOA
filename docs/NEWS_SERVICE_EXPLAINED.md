# News Service Explained

File nÃ y mÃ´ táº£ Ä‘Ãºng tráº¡ng thÃ¡i hiá»‡n táº¡i cá»§a `news-service` sau khi Ä‘Ã£ clean code vÃ  hoÃ n thiá»‡n pháº§n tin tá»©c cho Ä‘á»“ Ã¡n 2.

## 1. Vai trÃ² cá»§a News Service

`news-service` lÃ  service chuyÃªn cung cáº¥p tin tá»©c crypto cho há»‡ thá»‘ng.

Nhiá»‡m vá»¥ chÃ­nh:

- Láº¥y tin crypto má»›i tá»« API ngoÃ i.
- Chuáº©n hÃ³a dá»¯ liá»‡u tin tá»©c vá» model ná»™i bá»™ `News`.
- Gáº¯n sentiment cho tá»«ng bÃ i viáº¿t.
- Cache tin tá»©c Ä‘á»ƒ trÃ¡nh gá»i API ngoÃ i quÃ¡ nhiá»u.
- Há»— trá»£ lá»c theo coin, sentiment, search.
- Há»— trá»£ danh sÃ¡ch trending.
- Expose REST API cho frontend thÃ´ng qua API Gateway.

Trong SOA, service nÃ y Ä‘á»™c láº­p vá»›i cÃ¡c service khÃ¡c. Frontend khÃ´ng gá»i trá»±c tiáº¿p `news-service`, mÃ  gá»i qua:

```text
Frontend -> API Gateway -> News Service
```

## 2. CÃ´ng nghá»‡ sá»­ dá»¥ng

```text
Language: Java 21
Framework: Spring Boot 3.2.4
Service port: 3006
External API chÃ­nh: CryptoCompare News API
External API fallback: NewsAPI, náº¿u cÃ³ NEWSAPI_KEY
Cache: Guava Cache
Service discovery: Consul
AI integration: gá»i Sentiment Service Python FinBERT
```

News Service khÃ´ng dÃ¹ng database. Dá»¯ liá»‡u Ä‘Æ°á»£c láº¥y tá»« API ngoÃ i vÃ  cache trong bá»™ nhá»›.

## 3. Cáº¥u trÃºc thÆ° má»¥c chÃ­nh

```text
news-service/
  src/main/java/com/cryptotrading/news/
    NewsServiceApplication.java
    config/
      AppConfig.java
    controller/
      NewsController.java
    exception/
      GlobalExceptionHandler.java
      NewsNotFoundException.java
      NewsServiceException.java
    model/
      ApiResponse.java
      News.java
      PageResponse.java
    provider/
      CryptoCompareProvider.java
    service/
      NewsFetchScheduler.java
      NewsService.java
    util/
      SentimentAnalyzer.java
  src/main/resources/
    application.yml
```

## 4. CÃ¡c file quan trá»ng

### `NewsServiceApplication.java`

ÄÃ¢y lÃ  entrypoint cá»§a Spring Boot app.

Chá»©c nÄƒng:

- Start service.
- Báº­t Spring Boot auto configuration.
- Báº­t scheduling Ä‘á»ƒ `NewsFetchScheduler` cÃ³ thá»ƒ cháº¡y Ä‘á»‹nh ká»³.
- ÄÄƒng kÃ½ service vá»›i Consul.

### `application.yml`

Chá»©a cáº¥u hÃ¬nh runtime:

```yaml
server.port: 3006
spring.application.name: news-service
cryptocompare.api-url: https://min-api.cryptocompare.com/data/v2/news/
cryptocompare.api-key: ${CRYPTOCOMPARE_API_KEY:}
newsapi.api-key: ${NEWSAPI_KEY:}
cache.news-ttl-hours: 24
cache.trending-ttl-hours: 6
scheduler.news-fetch-interval-ms: 900000
sentiment.service-url: ${SENTIMENT_SERVICE_URL:http://localhost:3008}
```

Ã nghÄ©a quan trá»ng:

- `CRYPTOCOMPARE_API_KEY` cÃ³ thá»ƒ Ä‘á»ƒ trá»‘ng, CryptoCompare váº«n cÃ³ free tier.
- `NEWSAPI_KEY` chá»‰ dÃ¹ng fallback náº¿u CryptoCompare lá»—i.
- `sentiment.service-url` trá» tá»›i Python Sentiment Service á»Ÿ port `3008`.
- `health-check-path` lÃ  `/news/health` vÃ¬ controller cÃ³ prefix `/news`.

### `News.java`

Model Ä‘áº¡i diá»‡n cho má»™t bÃ i tin tá»©c.

CÃ¡c field quan trá»ng:

```java
private String id;
private String title;
private String summary;
private String content;
private String source;
private String url;
private String imageUrl;
private String sentiment;
private List<String> coins;
private LocalDateTime publishedAt;
private LocalDateTime fetchedAt;
private int views;
```

`id` hiá»‡n Ä‘Æ°á»£c táº¡o á»•n Ä‘á»‹nh tá»« URL/title báº±ng SHA-256 trong `CryptoCompareProvider.stableId()`.

### `CryptoCompareProvider.java`

ÄÃ¢y lÃ  lá»›p láº¥y dá»¯ liá»‡u tá»« API ngoÃ i.

Thá»© tá»± láº¥y dá»¯ liá»‡u:

1. Gá»i CryptoCompare.
2. Náº¿u CryptoCompare lá»—i vÃ  cÃ³ `NEWSAPI_KEY`, gá»i NewsAPI.
3. Náº¿u cáº£ hai Ä‘á»u khÃ´ng cÃ³ dá»¯ liá»‡u, dÃ¹ng sample data Ä‘á»ƒ demo.

Luá»“ng chÃ­nh:

```text
fetchLatestNews()
  -> gá»i CryptoCompare API
  -> parse JSON
  -> táº¡o News object
  -> extract coins
  -> analyze sentiment
  -> táº¡o stable id
```

Äiá»ƒm quan trá»ng:

- `parseCryptoCompareResponse()` Ä‘á»c field `Data`.
- `published_on` cá»§a CryptoCompare lÃ  Unix epoch seconds nÃªn pháº£i convert sang `LocalDateTime`.
- Má»—i bÃ i Ä‘á»u gá»i `sentimentAnalyzer.analyze(title, summary)`.
- Náº¿u bÃ i khÃ´ng detect Ä‘Æ°á»£c coin nÃ o thÃ¬ máº·c Ä‘á»‹nh gÃ¡n `BTC`.
- Sample data cÅ©ng Ä‘Æ°á»£c cháº¡y láº¡i qua `SentimentAnalyzer`, khÃ´ng giá»¯ sentiment hardcode.

### `SentimentAnalyzer.java`

ÄÃ¢y lÃ  cáº§u ná»‘i giá»¯a News Service Java vÃ  Sentiment Service Python.

Chiáº¿n lÆ°á»£c 2 lá»›p:

1. Gá»i FinBERT qua HTTP:

```text
POST http://localhost:3008/sentiment/analyze
```

Body:

```json
{
  "text": "title + summary snippet"
}
```

2. Náº¿u Sentiment Service chÆ°a cháº¡y hoáº·c lá»—i, fallback vá» keyword matching.

VÃ¬ váº­y News Service váº«n hoáº¡t Ä‘á»™ng Ä‘Æ°á»£c ngay cáº£ khi AI service Ä‘ang táº¯t. ÄÃ¢y lÃ  graceful degradation.

NgoÃ i sentiment, class nÃ y cÃ²n cÃ³:

- `extractCoins(title, summary)`: tÃ¬m coin nhÆ° BTC, ETH, BNB, SOL, XRP, ADA, DOGE, DOT.
- `simulateViews(title)`: táº¡o views giáº£ dá»±a trÃªn hash Ä‘á»ƒ mÃ´ phá»ng trending.

### `NewsService.java`

ÄÃ¢y lÃ  business logic chÃ­nh.

Chá»©c nÄƒng:

- Quáº£n lÃ½ Guava cache.
- Lá»c tin.
- PhÃ¢n trang.
- TÃ­nh trending.
- Refresh cache.
- Tráº£ cache stats cho health endpoint.

Cache hiá»‡n táº¡i:

```text
newsCache:
  key: "all"
  value: List<News>
  TTL: cache.news-ttl-hours, máº·c Ä‘á»‹nh 24h

trendingCache:
  key: "trending"
  value: List<News>
  TTL: cache.trending-ttl-hours, máº·c Ä‘á»‹nh 6h
```

Luá»“ng `getNews()`:

```text
getNews(page, limit, coin, sentiment, search)
  -> validatePaginationParams()
  -> getAllCached()
  -> applyFilters()
  -> paginate()
```

Filter há»— trá»£:

- `coin=BTC`
- `sentiment=positive|negative|neutral`
- `search=bitcoin`

Trending:

```text
getTrending(limit)
  -> láº¥y tá»« trendingCache
  -> náº¿u lá»—i thÃ¬ sort newsCache theo views giáº£m dáº§n
```

### `NewsFetchScheduler.java`

Cháº¡y Ä‘á»‹nh ká»³ Ä‘á»ƒ refresh cache.

Cáº¥u hÃ¬nh:

```yaml
scheduler.news-fetch-interval-ms: 900000
```

Tá»©c lÃ  15 phÃºt refresh má»™t láº§n.

Luá»“ng:

```text
scheduledFetch()
  -> newsService.refreshCache()
  -> invalidate newsCache vÃ  trendingCache
  -> pre-warm newsCache báº±ng getAllCached()
```

### `NewsController.java`

Expose REST API.

Endpoints:

| Method | Path | Ã nghÄ©a |
|---|---|---|
| GET | `/news` | Láº¥y tin cÃ³ phÃ¢n trang vÃ  filter |
| GET | `/news/trending` | Láº¥y tin trending |
| GET | `/news/coins/{coin}` | Láº¥y tin theo coin |
| GET | `/news/{id}` | Láº¥y chi tiáº¿t má»™t bÃ i |
| GET | `/news/health` | Health check cho Consul |

LÆ°u Ã½ thá»© tá»± route:

`/news/trending` vÃ  `/news/coins/{coin}` pháº£i Ä‘á»©ng trÆ°á»›c `/news/{id}` Ä‘á»ƒ Spring khÃ´ng hiá»ƒu `trending` hoáº·c `coins` lÃ  `{id}`.

## 5. API qua Gateway

Frontend gá»i:

```text
GET http://localhost:3000/api/news
GET http://localhost:3000/api/news/trending
GET http://localhost:3000/api/news/coins/BTC
```

Gateway rewrite:

```text
/api/news -> /news
/api/news/trending -> /news/trending
```

Trong `backend/api-gateway/server.js`, `newsProxy` chá»‰ strip `/api`, khÃ´ng strip `/news`, vÃ¬ Spring controller cáº§n prefix `/news`.

## 6. Luá»“ng request Ä‘áº§y Ä‘á»§

VÃ­ dá»¥ user má»Ÿ trang tin tá»©c:

```text
1. Frontend gá»i /api/news?page=1&limit=10
2. API Gateway forward sang /news?page=1&limit=10
3. NewsController.getNews() nháº­n request
4. NewsService.getNews() láº¥y data tá»« cache
5. Náº¿u cache miss, CryptoCompareProvider.fetchLatestNews() gá»i API ngoÃ i
6. Má»—i bÃ i Ä‘Æ°á»£c SentimentAnalyzer phÃ¢n tÃ­ch sentiment
7. NewsService filter vÃ  paginate
8. Controller tráº£ ApiResponse vá» Gateway
9. Frontend render UI
```

## 7. Frontend liÃªn quan

File chÃ­nh:

```text
frontend/src/pages/News.jsx
frontend/src/services/api.js
```

API helper:

```javascript
export const newsAPI = {
  getNews: (page = 1, limit = 10, filters = {}) =>
    api.get('/news', { params: { page, limit, ...filters } }),
  getNewsById: (id) => api.get(`/news/${id}`),
  getTrending: (limit = 5) => api.get('/news/trending', { params: { limit } }),
  getNewsByCoin: (coin, page = 1, limit = 10) =>
    api.get(`/news/coins/${coin}`, { params: { page, limit } }),
  getHealth: () => api.get('/news/health'),
};
```

Trang News hiá»‡n dÃ¹ng:

- Tab má»›i nháº¥t/trending.
- Search.
- Filter coin.
- Filter sentiment.
- Card tin tá»©c cÃ³ áº£nh, badge sentiment, coin tags, source, thá»i gian, views.

## 8. Nhá»¯ng Ä‘iá»ƒm Ä‘Ã£ clean/cáº£i thiá»‡n

- Provider cÃ³ fallback rÃµ: CryptoCompare -> NewsAPI -> sample.
- ID bÃ i viáº¿t á»•n Ä‘á»‹nh hÆ¡n nhá» hash URL/title.
- Filter/search Ä‘Æ°á»£c gom trong `NewsService.applyFilters()`.
- Cache logic náº±m trong `NewsService`, controller khÃ´ng xá»­ lÃ½ business logic.
- SentimentAnalyzer khÃ´ng lÃ m cháº¿t News Service náº¿u Python service down.
- Frontend News Ä‘Ã£ chá»‰nh layout Ä‘á»ƒ bá»›t khoáº£ng trá»‘ng vÃ  card cÃ¢n Ä‘á»‘i hÆ¡n.

## 9. Thá»© tá»± Ä‘á»c code Ä‘á» xuáº¥t

Náº¿u báº¡n muá»‘n hiá»ƒu News Service Ä‘á»ƒ trÃ¬nh bÃ y:

1. `News.java` - hiá»ƒu dá»¯ liá»‡u má»™t bÃ i tin gá»“m gÃ¬.
2. `NewsController.java` - xem service expose API nÃ o.
3. `NewsService.java` - hiá»ƒu filter, pagination, cache, trending.
4. `CryptoCompareProvider.java` - hiá»ƒu dá»¯ liá»‡u láº¥y tá»« API ngoÃ i nhÆ° tháº¿ nÃ o.
5. `SentimentAnalyzer.java` - hiá»ƒu cÃ¡ch gá»i FinBERT vÃ  fallback keyword.
6. `NewsFetchScheduler.java` - hiá»ƒu auto refresh cache.
7. `application.yml` - hiá»ƒu port, API key, cache, Consul.
8. `frontend/src/pages/News.jsx` - hiá»ƒu cÃ¡ch frontend dÃ¹ng API.

## 10. CÃ¢u nÃ³i ngáº¯n Ä‘á»ƒ trÃ¬nh bÃ y

News Service lÃ  má»™t Java Spring Boot service Ä‘á»™c láº­p trong há»‡ thá»‘ng SOA, chá»‹u trÃ¡ch nhiá»‡m láº¥y tin crypto tá»« CryptoCompare, chuáº©n hÃ³a dá»¯ liá»‡u, gáº¯n sentiment báº±ng FinBERT thÃ´ng qua Sentiment Service, cache báº±ng Guava Ä‘á»ƒ giáº£m gá»i API ngoÃ i, sau Ä‘Ã³ cung cáº¥p API lá»c, tÃ¬m kiáº¿m, trending cho frontend qua API Gateway.

## 11. Kiáº¿n Thá»©c Ná»n TrÆ°á»›c Khi Äá»c News Service

News Service dá»… hiá»ƒu hÆ¡n Academy vÃ¬ nÃ³ khÃ´ng cÃ³ database. NhÆ°ng nÃ³ cÃ³ 3 khÃ¡i niá»‡m cáº§n náº¯m:

```text
Provider  -> láº¥y dá»¯ liá»‡u tá»« API ngoÃ i
Service   -> cache, filter, pagination, trending
Scheduler -> tá»± refresh cache theo chu ká»³
```

HÃ£y nhá»›:

```text
News Service khÃ´ng lÆ°u tin vÃ o MySQL/MongoDB.
Tin tá»©c náº±m trong bá»™ nhá»› cache.
Khi cache háº¿t háº¡n hoáº·c scheduler refresh, service gá»i API ngoÃ i láº¡i.
```

## 12. `@EnableScheduling` CÃ³ TÃ¡c Dá»¥ng GÃ¬?

Trong `NewsServiceApplication.java` hiá»‡n cÃ³:

```java
@SpringBootApplication
@EnableScheduling
public class NewsServiceApplication
```

`@EnableScheduling` báº­t cÆ¡ cháº¿ cháº¡y task Ä‘á»‹nh ká»³ cá»§a Spring.

NÃ³ Ä‘ang Ä‘Æ°á»£c dÃ¹ng tháº­t bá»Ÿi:

```text
news-service/src/main/java/com/cryptotrading/news/service/NewsFetchScheduler.java
```

Trong Ä‘Ã³ cÃ³:

```java
@Scheduled(initialDelay = 30_000, fixedRateString = "${scheduler.news-fetch-interval-ms:900000}")
public void scheduledFetch()
```

Ã nghÄ©a:

```text
Sau khi News Service start 30 giÃ¢y:
  -> gá»i newsService.refreshCache()

Sau Ä‘Ã³ cá»© má»—i 900000ms, tá»©c 15 phÃºt:
  -> gá»i refreshCache() tiáº¿p
```

NÃ³ hoáº¡t Ä‘á»™ng cáº£ local láº«n deploy. KhÃ´ng pháº£i chá»‰ deploy má»›i cháº¡y.

Náº¿u báº¡n cháº¡y local rá»“i táº¯t trÆ°á»›c 30 giÃ¢y, báº¡n sáº½ khÃ´ng ká»‹p tháº¥y scheduler cháº¡y láº§n Ä‘áº§u. Náº¿u service cháº¡y lÃ¢u hÆ¡n 30 giÃ¢y, scheduler sáº½ cháº¡y.

So sÃ¡nh vá»›i Academy:

```text
News Service:
  @EnableScheduling + @Scheduled
  -> cháº¡y láº·p láº¡i Ä‘á»‹nh ká»³

Academy Service:
  CommandLineRunner trong AcademySeeder
  -> cháº¡y má»™t láº§n khi service start
```

VÃ¬ váº­y:

- News cáº§n `@EnableScheduling` vÃ¬ cÃ³ task refresh cache.
- Academy khÃ´ng cáº§n `@EnableScheduling` vÃ¬ seeder khÃ´ng pháº£i scheduled task.

## 13. Báº£n Äá»“ Dá»¯ Liá»‡u News Service

Luá»“ng dá»¯ liá»‡u:

```text
CryptoCompare API
  -> CryptoCompareProvider
  -> News object
  -> SentimentAnalyzer
  -> NewsService cache
  -> NewsController
  -> API Gateway
  -> Frontend News.jsx
```

Má»™t bÃ i tin sau khi parse thÃ nh `News` sáº½ cÃ³ dáº¡ng:

```json
{
  "id": "news-a1b2c3d4e5f6",
  "title": "Bitcoin rises as institutional demand grows",
  "summary": "Bitcoin moved higher after new institutional inflows...",
  "source": "cryptocompare",
  "url": "https://...",
  "imageUrl": "https://...",
  "sentiment": "positive",
  "coins": ["BTC"],
  "publishedAt": "2026-06-11T10:30:00",
  "fetchedAt": "2026-06-11T10:35:00",
  "views": 1420
}
```

Nhá»¯ng field nÃ o Ä‘áº¿n tá»« API ngoÃ i:

```text
title
summary/body
source
url
imageUrl
publishedAt
```

Nhá»¯ng field nÃ o do service tá»± táº¡o:

```text
id
sentiment
coins
fetchedAt
views
```

## 14. VÃ¬ Sao News Service KhÃ´ng DÃ¹ng Database?

VÃ¬ tin tá»©c crypto lÃ  dá»¯ liá»‡u external, thay Ä‘á»•i liÃªn tá»¥c vÃ  khÃ´ng pháº£i dá»¯ liá»‡u sá»Ÿ há»¯u lÃ¢u dÃ i cá»§a há»‡ thá»‘ng.

Service chá»‰ cáº§n:

```text
fetch -> parse -> cache -> tráº£ frontend
```

Náº¿u lÆ°u toÃ n bá»™ news vÃ o database, há»‡ thá»‘ng sáº½ phá»©c táº¡p hÆ¡n:

- cáº§n job dá»n tin cÅ©
- cáº§n trÃ¡nh duplicate bÃ i
- cáº§n schema migration
- cáº§n index search

Vá»›i Ä‘á»“ Ã¡n nÃ y, cache lÃ  Ä‘á»§ há»£p lÃ½.

## 15. Guava Cache LÃ  GÃ¬?

Guava Cache lÃ  cache trong RAM cá»§a Java process.

Trong `NewsService`, cÃ³ 2 cache:

```text
newsCache:
  key = "all"
  value = List<News>
  TTL = 24h

trendingCache:
  key = "trending"
  value = List<News>
  TTL = 6h
```

Cache giÃºp:

- request nhanh hÆ¡n
- giáº£m gá»i CryptoCompare API
- trÃ¡nh bá»‹ giá»›i háº¡n quota API

Luá»“ng cache:

```text
Request Ä‘áº§u tiÃªn:
  cache miss
  -> gá»i CryptoCompare
  -> parse news
  -> lÆ°u vÃ o cache
  -> tráº£ frontend

Request sau:
  cache hit
  -> láº¥y List<News> trong RAM
  -> tráº£ frontend ngay
```

## 16. `CryptoCompareProvider` Äá»c NhÆ° Tháº¿ NÃ o?

File:

```text
news-service/src/main/java/com/cryptotrading/news/provider/CryptoCompareProvider.java
```

Provider cÃ³ nhiá»‡m vá»¥ duy nháº¥t:

```text
Láº¥y dá»¯ liá»‡u tá»« API ngoÃ i vÃ  biáº¿n nÃ³ thÃ nh List<News>.
```

Thá»© tá»± fallback:

```text
1. CryptoCompare
2. NewsAPI náº¿u cÃ³ NEWSAPI_KEY
3. Sample data
```

VÃ¬ sao cáº§n fallback?

Náº¿u API ngoÃ i lá»—i hoáº·c háº¿t quota, trang News váº«n cÃ³ dá»¯ liá»‡u demo Ä‘á»ƒ há»‡ thá»‘ng khÃ´ng bá»‹ tráº¯ng.

Method quan trá»ng:

```text
fetchLatestNews()
  -> thá»­ CryptoCompare
  -> thá»­ NewsAPI
  -> fallback sample

parseCryptoCompareResponse()
  -> Ä‘á»c JSON tá»« CryptoCompare
  -> táº¡o News object

stableId()
  -> táº¡o ID á»•n Ä‘á»‹nh tá»« url/title báº±ng SHA-256
```

## 17. `SentimentAnalyzer` Trong News Service

Äá»«ng nháº§m class nÃ y vá»›i Python Sentiment Service.

```text
SentimentAnalyzer.java
  -> náº±m trong News Service
  -> lÃ  client gá»i sang Python Sentiment Service
```

NÃ³ thá»­ gá»i:

```text
POST http://localhost:3008/sentiment/analyze
```

Náº¿u gá»i thÃ nh cÃ´ng:

```text
return label tá»« FinBERT
```

Náº¿u gá»i tháº¥t báº¡i:

```text
fallback keyword matching
```

Äiá»ƒm hay Ä‘á»ƒ trÃ¬nh bÃ y:

```text
News Service khÃ´ng phá»¥ thuá»™c cá»©ng vÃ o Sentiment Service.
Sentiment Service down thÃ¬ News váº«n cháº¡y.
Khi Sentiment Service up thÃ¬ News tá»± dÃ¹ng AI.
```

## 18. API Response Máº«u

### `GET /api/news`

Response cÃ³ dáº¡ng:

```json
{
  "success": true,
  "data": {
    "news": [
      {
        "id": "news-abc123",
        "title": "Bitcoin rises...",
        "sentiment": "positive",
        "coins": ["BTC"],
        "views": 1420
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### `GET /api/news/trending`

```json
{
  "success": true,
  "data": {
    "trending": [],
    "period": "24h",
    "timestamp": "2026-06-11T10:00:00Z"
  }
}
```

### `GET /api/news/coins/BTC`

```json
{
  "success": true,
  "data": {
    "news": [],
    "pagination": {},
    "coin": "BTC"
  }
}
```

## 19. Nhá»¯ng Annotation Spring Cáº§n Hiá»ƒu

### `@SpringBootApplication`

Start Spring Boot app, báº­t auto config vÃ  component scan.

### `@EnableScheduling`

Báº­t scheduled task. News Service cáº§n cÃ¡i nÃ y vÃ¬ cÃ³ `NewsFetchScheduler`.

### `@Service`

ÄÃ¡nh dáº¥u class chá»©a business logic.

VÃ­ dá»¥:

```java
@Service
public class NewsService
```

### `@Component`

ÄÃ¡nh dáº¥u class lÃ  bean thÆ°á»ng.

VÃ­ dá»¥:

```java
@Component
public class CryptoCompareProvider
```

### `@RestController`

ÄÃ¡nh dáº¥u class nháº­n HTTP request vÃ  tráº£ JSON.

### `@Scheduled`

ÄÃ¡nh dáº¥u method cháº¡y Ä‘á»‹nh ká»³.

### `@Value`

Inject config tá»« `application.yml` hoáº·c env.

VÃ­ dá»¥:

```java
@Value("${cache.news-ttl-hours:24}")
private long newsTtlHours;
```

## 20. CÃ¢u Há»i Giáº£ng ViÃªn CÃ³ Thá»ƒ Há»i

### VÃ¬ sao News Service dÃ¹ng cache?

VÃ¬ gá»i API ngoÃ i liÃªn tá»¥c sáº½ cháº­m vÃ  dá»… háº¿t quota. Cache giÃºp request nhanh hÆ¡n vÃ  giáº£m phá»¥ thuá»™c API ngoÃ i.

### Náº¿u Sentiment Service táº¯t thÃ¬ News cÃ³ cháº¿t khÃ´ng?

KhÃ´ng. `SentimentAnalyzer` fallback vá» keyword matching.

### VÃ¬ sao cáº§n scheduler?

Äá»ƒ tá»± refresh cache Ä‘á»‹nh ká»³. Náº¿u khÃ´ng cÃ³ scheduler, cache chá»‰ refresh khi háº¿t háº¡n hoáº·c khi cÃ³ request cache miss.

### News Service cÃ³ database riÃªng khÃ´ng?

KhÃ´ng. Service nÃ y khÃ´ng cáº§n database vÃ¬ dá»¯ liá»‡u tin tá»©c láº¥y tá»« API ngoÃ i vÃ  cache trong RAM.

### VÃ¬ sao Gateway chá»‰ strip `/api`?

VÃ¬ Spring controller cÃ³ prefix `/news`. Náº¿u strip luÃ´n `/news`, route sáº½ sai.

## 21. CÃ¡ch Tá»± Test

```powershell
Invoke-RestMethod http://localhost:3006/news/health
Invoke-RestMethod "http://localhost:3006/news?page=1&limit=10"
Invoke-RestMethod "http://localhost:3006/news/trending?limit=5"
Invoke-RestMethod "http://localhost:3006/news/coins/BTC?page=1&limit=5"
```

Qua Gateway:

```powershell
Invoke-RestMethod http://localhost:3000/api/news/health
Invoke-RestMethod "http://localhost:3000/api/news?page=1&limit=10"
```

## 22. CÃ¡ch Nhá»› Nhanh

```text
CryptoCompareProvider = ngÆ°á»i Ä‘i láº¥y bÃ¡o
SentimentAnalyzer = ngÆ°á»i Ä‘á»c cáº£m xÃºc bÃ i bÃ¡o
NewsService = ngÆ°á»i sáº¯p xáº¿p, lá»c, phÃ¢n trang vÃ  cache
NewsFetchScheduler = Ä‘á»“ng há»“ tá»± lÃ m má»›i tin
NewsController = quáº§y API
News.jsx = mÃ n hÃ¬nh Ä‘á»c tin
```

## Trạng Thái Sau Khi Rà Soát Mới Nhất

Mình đã đối chiếu lại tài liệu này với code hiện tại của `news-service`. Các điểm dưới đây vẫn đúng theo source:

```text
- News Service không dùng database.
- Dữ liệu tin tức nằm trong Guava LoadingCache.
- Provider chính là CryptoCompare.
- NewsAPI chỉ là fallback nếu có NEWSAPI_KEY và CryptoCompare lỗi.
- Nếu API ngoài không trả dữ liệu, service dùng sample data để demo/test.
- SentimentAnalyzer gọi Sentiment Service trước, lỗi thì fallback keyword matching.
- @EnableScheduling vẫn đang dùng thật bởi NewsFetchScheduler.
- Scheduler refresh cache lần đầu sau 30 giây, sau đó theo scheduler.news-fetch-interval-ms.
```

Không có phần playlist/YouTube trong News Service. Lần dọn code mới nhất không xóa logic News nào, nên tài liệu News chỉ ghi nhận trạng thái hiện tại, không thêm chức năng không có trong code.