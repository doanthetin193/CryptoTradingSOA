# KẾ HOẠCH PHÁT TRIỂN NEWS SERVICE (JAVA + SPRING BOOT)

**Ngày lập:** 03/04/2026  
**Phiên bản:** 1.0  
**Trạng thái:** Chuẩn bị phát triển

---

## I. MỤC TIÊU CỦA NEWS SERVICE

### 1.1. Mục tiêu chính

- Cung cấp tin tức crypto **real-time** cho nền tảng giao dịch
- Chứng minh kiến trúc **SOA hoàn toàn language-agnostic** (không phụ thuộc ngôn ngữ lập trình)
- Tích hợp seamless với gateway Node.js Express hiện tại
- Tăng đa dạng công nghệ cho đồ án (Java Spring Boot vào cảnh)

### 1.2. Mục tiêu phụ

- Giáo dục: Người dùng có thể xem tin tức liên quan đến coin để đưa ra quyết định giao dịch
- Engagement: Tăng tính tương tác của ứng dụng
- Scalability: Chứng minh service có thể triển khai độc lập bằng Java

---

## II. PHẠM VI (SCOPE)

### 2.1. Chức năng chính

1. **Lấy tin tức từ API bên ngoài**
   - Nguồn: CityNews API (hoặc NewsAPI.org, hoặc CryptoPanic)
   - Frequency: Mỗi 15 phút tự động fetch (background task)
   - Lấy tối đa 50 tin gần nhất

2. **Quản lý và caching**
   - Lưu tin vào in-memory cache (không lưu database)
   - Cache size: Tối đa 100 tin gần nhất
   - TTL (Time To Live): 24 giờ tự động xóa

3. **Cung cấp API endpoints**
   - GET `/news` - Danh sách tin (có phân trang, lọc)
   - GET `/news/{id}` - Chi tiết tin
   - GET `/news/trending` - Top tin xu hướng
   - GET `/news/coins/{coin}` - Tin liên quan coin cụ thể
   - GET `/health` - Health check

4. **Tích hợp vào Gateway**
   - Gateway proxy route `/api/news/*` tới Java service
   - Không cần authentication (tin tức là public)

### 2.2. Chức năng không bao gồm

- ❌ Phân tích sentiment phức tạp (chỉ dùng keyword matching đơn giản nếu có)
- ❌ Lưu database MongoDB (chỉ in-memory cache)
- ❌ Orchestration với các service khác
- ❌ WebSocket real-time push (chỉ pull khi user request)
- ❌ User customization (follow topic)

---

## III. KIẾN TRÚC KỸ THUẬT

### 3.1. Tech Stack

| Thành phần            | Công nghệ                | Phiên bản               | Lý do                      |
| --------------------- | ------------------------ | ----------------------- | -------------------------- |
| **Language**          | Java                     | 11+ LTS                 | Stable, widely-used        |
| **Framework**         | Spring Boot              | 3.x                     | Dễ setup, rich ecosystem   |
| **Build Tool**        | Maven                    | 3.8+                    | Standard for Java          |
| **Service Discovery** | Spring Cloud Consul      | 4.x                     | Toàn vẹn với Node services |
| **Cache**             | Guava Cache              | 32.1 (com.google.guava) | In-memory, embedded        |
| **HTTP Client**       | RestTemplate / WebClient | Spring Boot built-in    | Call external APIs         |
| **Logging**           | SLF4J + Logback          | Spring Boot default     | Consistent with Node       |
| **Build & Run**       | Docker (optional)        | -                       | Dễ deploy                  |

### 3.2. Sơ đồ kiến trúc tích hợp

```
┌─────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Port 5173)           │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / WebSocket
                         ▼
┌─────────────────────────────────────────────────────────┐
│              API GATEWAY (Node.js Express, Port 3000)   │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Routing Layer                                       │ │
│  │ ├─ /api/users/... → User Service (3001)           │ │
│  │ ├─ /api/market/... → Market Service (3002)        │ │
│  │ ├─ /api/portfolio/... → Portfolio Service (3003)  │ │
│  │ ├─ /api/trade/... → Trade Service (3004)          │ │
│  │ ├─ /api/notifications/... → Notification (3005)   │ │
│  │ └─ /api/news/... ──────────┐                       │ │
│  └────────────────────────────┼───────────────────────┘ │
└─────────────────────────────────┼──────────────────────┘
                                  │
                                  ▼
                 ┌───────────────────────────────┐
                 │ NEWS SERVICE (Java Spring Boot)│
                 │ Port: 3006                     │
                 │                               │
                 │ ┌─────────────────────────    │
                 │ │ NewsController              │
                 │ │ ├─ GET /news                │
                 │ │ ├─ GET /news/{id}           │
                 │ │ ├─ GET /news/trending       │
                 │ │ └─ GET /health              │
                 │ ├─────────────────────────────│
                 │ │ NewsService                 │
                 │ │ └─ getNews()                │
                 │ │ └─ getTrendingNews()        │
                 │ │─────────────────────────────│
                 │ │ GuavaCache (In-memory)      │
                 │ │ └─ newsCache (100 tin)      │
                 │ │ └─ TTL: 24 giờ              │
                 │ ├─────────────────────────────│
                 │ │ ScheduledTask               │
                 │ │ └─ Fetch every 15min        │
                 │ └─────────────────────────────│
                 └───────────────────────────────┘
                         │       │
                         │       └─ Register Consul
                         │          (health check)
                         │
                         ▼
            ┌──────────────────────────┐
            │  CryptoPanic API / NewsAPI│
            │  (External News Source)   │
            └──────────────────────────┘
```

### 3.3. Service Discovery Integration

**Consul Registration:**

```yaml
# application.yml
spring:
  cloud:
    consul:
      host: localhost
      port: 8500
      discovery:
        serviceName: news-service
        instanceId: news-service-3006
        port: 3006
        healthCheckPath: /health
        healthCheckInterval: 10s
        deregister-critical-service-after: 30s
```

**Kết quả:** News Service tự động xuất hiện trong Consul, Gateway có thể discover.

---

## IV. API DESIGN

### 4.1. API Endpoints

#### 4.1.1. GET /news - Danh sách tin

**Request:**

```http
GET /news?page=1&limit=10&coin=BTC&sentiment=positive
```

**Query Parameters:**
| Tham số | Kiểu | Mặc định | Mô tả |
|--------|-----|---------|-------|
| page | int | 1 | Trang (1-based) |
| limit | int | 10 | Tin trên trang (max 50) |
| coin | string | - | Lọc theo coin (VD: BTC, ETH) |
| sentiment | string | - | Lọc theo sentiment (positive/neutral/negative) |
| search | string | - | Tìm kiếm theo tiêu đề |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "news": [
      {
        "id": "abc123",
        "title": "Bitcoin tăng 10% sau tin vui từ Fed",
        "summary": "Giá BTC vừa chạm mức $45,000...",
        "source": "CryptoPanic",
        "url": "https://...",
        "imageUrl": "https://...",
        "sentiment": "positive",
        "coins": ["BTC"],
        "publishedAt": "2026-04-03T10:30:00Z",
        "fetchedAt": "2026-04-03T10:35:00Z"
      },
      {
        "id": "def456",
        "title": "Ethereum dự báo sẽ tăng mạnh",
        "summary": "...",
        "source": "CoinTelegraph",
        "url": "...",
        "imageUrl": "...",
        "sentiment": "positive",
        "coins": ["ETH"],
        "publishedAt": "2026-04-03T09:15:00Z",
        "fetchedAt": "2026-04-03T09:20:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2026-04-03T10:40:00Z"
}
```

**Response (503 Service Unavailable):**

```json
{
  "success": false,
  "message": "News service temporarily unavailable",
  "error": "Failed to fetch from external API"
}
```

---

#### 4.1.2. GET /news/{id} - Chi tiết tin

**Request:**

```http
GET /news/abc123
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "title": "Bitcoin tăng 10% sau tin vui từ Fed",
    "summary": "Giá BTC vừa chạm mức $45,000 lần đầu tiên trong 6 tháng qua",
    "content": "Dài hơn...",
    "source": "CryptoPanic",
    "url": "https://cryptopanic.com/news/...",
    "imageUrl": "https://...",
    "sentiment": "positive",
    "coins": ["BTC"],
    "publishedAt": "2026-04-03T10:30:00Z",
    "fetchedAt": "2026-04-03T10:35:00Z",
    "views": 234
  }
}
```

**Response (404 Not Found):**

```json
{
  "success": false,
  "message": "News article not found"
}
```

---

#### 4.1.3. GET /news/trending - Tin xu hướng

**Request:**

```http
GET /news/trending?limit=5
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "trending": [
      {
        "id": "abc123",
        "title": "Bitcoin tăng 10%",
        "summary": "...",
        "views": 1200,
        "sentiment": "positive",
        "coins": ["BTC"]
      }
    ],
    "period": "24h",
    "timestamp": "2026-04-03T10:40:00Z"
  }
}
```

---

#### 4.1.4. GET /news/coins/{coin} - Tin theo coin

**Request:**

```http
GET /news/coins/BTC?limit=10
```

**Response:** Tương tự danh sách tin, nhưng lọc chỉ coin BTC

---

#### 4.1.5. GET /health - Health Check

**Request:**

```http
GET /health
```

**Response (200 OK):**

```json
{
  "status": "UP",
  "service": "news-service",
  "version": "1.0.0",
  "timestamp": "2026-04-03T10:40:00Z",
  "cache": {
    "size": 45,
    "maxSize": 100,
    "totalFetches": 1250
  }
}
```

---

### 4.2. Error Handling

**Global Error Response Format:**

```json
{
  "success": false,
  "message": "User-friendly error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-04-03T10:40:00Z"
}
```

**HTTP Status Codes:**
| Status | Trường hợp |
|--------|-----------|
| 200 | Success |
| 400 | Invalid query params |
| 404 | Resource not found |
| 503 | External API unavailable |
| 500 | Server error |

---

## V. CACHE STRATEGY

### 5.1. Cache Implementation

**Framework:** Guava Cache (com.google.guava)

**Lý do chọn:**

- Lightweight, embedded (không cần Redis)
- Thread-safe, built-in LoadingCache
- TTL (expiration) tích hợp sẵn
- Phù hợp cho single-instance service

### 5.2. Cache Configuration

```java
// NewsService.java

@Service
public class NewsService {

    // Main cache: giữ 100 tin gần nhất, TTL 24 giờ
    private LoadingCache<String, List<News>> newsCache =
        CacheBuilder.newBuilder()
            .maximumSize(1)
            .expireAfterWrite(24, TimeUnit.HOURS)
            .recordStats()
            .build(new CacheLoader<String, List<News>>() {
                @Override
                public List<News> load(String key) throws Exception {
                    return fetchFromExternalAPI();
                }
            });

    // Trending cache: Top 10 tin hot, TTL 6 giờ
    private LoadingCache<String, List<News>> trendingCache =
        CacheBuilder.newBuilder()
            .maximumSize(1)
            .expireAfterWrite(6, TimeUnit.HOURS)
            .build(new CacheLoader<String, List<News>>() {
                @Override
                public List<News> load(String key) throws Exception {
                    return calculateTrending();
                }
            });

    public List<News> getNews(NewsFilter filter) {
        // Lấy từ cache
        List<News> allNews = newsCache.getUnchecked("all");

        // Áp dụng bộ lọc trong memory
        return applyFilter(allNews, filter);
    }
}
```

### 5.3. Cache Refresh Policy

**Scheduled Task:** Mỗi 15 phút, fetch tin mới từ API

```java
@Service
public class NewsFetchScheduler {

    @Scheduled(fixedRate = 900000)  // 15 phút = 900,000ms
    public void fetchNewsRegularly() {
        try {
            logger.info("🔄 Starting scheduled news fetch...");

            // Gọi external API
            List<News> newsList = cryptoPanicProvider.fetchLatestNews();

            // Update cache (tự động load lại)
            newsCache.invalidate("all");
            newsCache.getUnchecked("all");

            // Update trending cache
            trendingCache.invalidate("trending");

            logger.info("✅ Fetched {} news articles", newsList.size());

        } catch (Exception e) {
            logger.error("❌ Failed to fetch news: {}", e.getMessage());
        }
    }
}
```

### 5.4. Cache Statistics

**Monitored Metrics:**

- Cache hit rate (%)
- Cache miss rate (%)
- Số tin hiện tại trong cache
- Lần fetch cuối cùng thành công
- Error count

**Endpoint để xem (internal use):**

```http
GET /health
→ Trả về cache stats trong response
```

---

## VI. IMPLEMENTATION PLAN

### 6.1. Timeline (Chi tiết)

#### Phase 1: Setup & Infrastructure (1 ngày)

**Day 1 - Setup Java Project**

| Công việc                                 | Thời gian   | Kết quả                             |
| ----------------------------------------- | ----------- | ----------------------------------- |
| Cài đặt JDK 11+                           | 30 phút     | ✅ `java -version` successful       |
| Tạo Spring Boot project (Maven archetype) | 30 phút     | ✅ Folder structure ready           |
| Setup pom.xml dependencies                | 30 phút     | ✅ All libraries downloaded         |
| Configure application.yml (Consul)        | 30 phút     | ✅ Service dapat discover từ Consul |
| Setup logging (SLF4J + Logback)           | 30 phút     | ✅ Log files generated              |
| **Total:**                                | **2.5 giờ** |                                     |

**Deliverable:** Project chạy được, log trong console

---

#### Phase 2: Core Development (2-2.5 ngày)

**Day 2 - Models & Cache Layer**

| Công việc                          | Thời gian | Kết quả                         |
| ---------------------------------- | --------- | ------------------------------- |
| Định nghĩa News model & NewsFilter | 1 giờ     | ✅ Java classes defined         |
| Setup Guava Cache config           | 1 giờ     | ✅ Cache tạo & initialize       |
| Implement CacheLoader logic        | 1 giờ     | ✅ Cache load data successfully |
| Unit test cache behavior           | 1 giờ     | ✅ Cache tests pass             |
| **Subtotal Day 2:**                | **4 giờ** |                                 |

**Day 3 - External API Integration**

| Công việc                                       | Thời gian   | Kết quả                               |
| ----------------------------------------------- | ----------- | ------------------------------------- |
| Setup RestTemplate / WebClient                  | 1 giờ       | ✅ HTTP client configured             |
| Call CryptoPanic API (hoặc NewsAPI)             | 1.5 giờ     | ✅ Parse response, extract news       |
| Implement sentiment analysis (keyword matching) | 1 giờ       | ✅ Classify positive/negative/neutral |
| Implement FetchNewsScheduler (@Scheduled)       | 1 giờ       | ✅ Task chạy mỗi 15 phút              |
| Test external API call                          | 1 giờ       | ✅ Real data fetched                  |
| **Subtotal Day 3:**                             | **5.5 giờ** |                                       |

**Day 4 - Controllers & Exception Handling**

| Công việc                            | Thời gian   | Kết quả                        |
| ------------------------------------ | ----------- | ------------------------------ |
| Implement NewsController endpoints   | 2 giờ       | ✅ All 5 endpoints coded       |
| Implement NewsService business logic | 1.5 giờ     | ✅ Filtering, pagination logic |
| Global exception handler             | 1 giờ       | ✅ Consistent error responses  |
| Input validation (DTO, annotations)  | 1 giờ       | ✅ Validate query params       |
| **Subtotal Day 4:**                  | **5.5 giờ** |                                |

---

#### Phase 3: Testing & Integration (1-1.5 ngày)

**Day 5 - Testing & Integration with Gateway**

| Công việc                                  | Thời gian   | Kết quả                           |
| ------------------------------------------ | ----------- | --------------------------------- |
| Integration test (controller tests)        | 2 giờ       | ✅ SpringBootTest pass            |
| Manual testing với Postman                 | 1 giờ       | ✅ All endpoints verified         |
| Setup Gateway proxy routing (Node.js)      | 1 giờ       | ✅ Added 15 lines code            |
| End-to-end test: Frontend → Gateway → Java | 1 giờ       | ✅ Request/response working       |
| Performance test (response time)           | 1 giờ       | ✅ < 100ms latency                |
| Consul health check verify                 | 30 phút     | ✅ News service appears in Consul |
| **Subtotal Day 5:**                        | **6.5 giờ** |                                   |

---

#### Phase 4: Frontend Integration & Polish (1 ngày)

**Day 6 - UI & Documentation**

| Công việc                              | Thời gian | Kết quả                         |
| -------------------------------------- | --------- | ------------------------------- |
| Create News page component (React)     | 2 giờ     | ✅ /news page renders           |
| Integrate API calls (useEffect hook)   | 1.5 giờ   | ✅ Fetch news from /api/news    |
| Display news list + detail modal       | 1.5 giờ   | ✅ UI looks good                |
| Add news widget to Dashboard           | 1 giờ     | ✅ Breaking news sidebar widget |
| Write API documentation (Swagger-like) | 1 giờ     | ✅ README updated               |
| **Subtotal Day 6:**                    | **7 giờ** |                                 |

---

### 6.2. Total Timeline Summary

| Phase                          | Ngày       | Giờ         |
| ------------------------------ | ---------- | ----------- |
| Setup & Infrastructure         | Day 1      | 2.5         |
| Core Development (API + Cache) | Day 2-4    | 15          |
| Testing & Integration          | Day 5      | 6.5         |
| Frontend + Polish              | Day 6      | 7           |
| **TOTAL**                      | **6 ngày** | **~31 giờ** |

**Real-world estimate:** 1 tuần làm việc (40-50 giờ) bao gồm debugging + refinement

---

## VII. IMPLEMENTATION DETAILS

### 7.1. Folder Structure (Java Project)

```
news-service/                          (root project folder)
├── pom.xml                            (Maven config)
├── src/
│   ├── main/
│   │   ├── java/com/cryptotrading/news/
│   │   │   ├── NewsServiceApplication.java         (Main Spring Boot app)
│   │   │   ├── config/
│   │   │   │   ├── CacheConfig.java               (Guava cache setup)
│   │   │   │   ├── WebClientConfig.java           (HTTP client config)
│   │   │   │   └── ConsulConfig.java              (Optional, mostly auto)
│   │   │   ├── controller/
│   │   │   │   └── NewsController.java            (REST endpoints)
│   │   │   ├── service/
│   │   │   │   ├── NewsService.java               (Business logic)
│   │   │   │   ├── NewsFetchScheduler.java        (Scheduled task)
│   │   │   │   └── CryptoPanicProvider.java       (External API call)
│   │   │   ├── model/
│   │   │   │   ├── News.java                      (Main entity)
│   │   │   │   ├── NewsFilter.java                (Filter DTO)
│   │   │   │   └── NewsResponse.java              (API response wrapper)
│   │   │   ├── util/
│   │   │   │   ├── SentimentAnalyzer.java         (Simple keyword analysis)
│   │   │   │   └── DateUtil.java                  (Date formatting)
│   │   │   └── exception/
│   │   │       ├── GlobalExceptionHandler.java    (Exception handling)
│   │   │       └── NewsServiceException.java      (Custom exception)
│   │   └── resources/
│   │       ├── application.yml                    (Spring config)
│   │       ├── application-dev.yml                (Dev profile)
│   │       └── logback.xml                        (Logging config)
│   └── test/
│       └── java/com/cryptotrading/news/
│           ├── NewsServiceTest.java
│           ├── NewsControllerTest.java
│           └── CacheTest.java
├── Dockerfile                         (Optional)
├── README.md                          (Project docs)
└── .gitignore
```

### 7.2. Key Classes Skeleton

**News.java** (Model)

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class News {
    private String id;
    private String title;
    private String summary;
    private String content;
    private String source;          // CryptoPanic, CoinTelegraph, etc.
    private String url;
    private String imageUrl;
    private String sentiment;       // positive, negative, neutral
    private List<String> coins;     // [BTC, ETH]
    private LocalDateTime publishedAt;
    private LocalDateTime fetchedAt;
    private Integer views;          // optional
}
```

**NewsService.java** (Core Logic)

```java
@Service
@Slf4j
public class NewsService {

    @Autowired
    private CryptoPanicProvider cryptoPanicProvider;

    private LoadingCache<String, List<News>> newsCache;

    @PostConstruct
    public void initCache() {
        newsCache = CacheBuilder.newBuilder()
            .maximumSize(1)
            .expireAfterWrite(24, TimeUnit.HOURS)
            .recordStats()
            .build(new CacheLoader<String, List<News>>() {
                @Override
                public List<News> load(String key) throws Exception {
                    return cryptoPanicProvider.fetchLatestNews();
                }
            });
    }

    public PageResponse<News> getNews(int page, int limit,
                                      String coin, String sentiment) {
        List<News> all = newsCache.getUnchecked("all");
        List<News> filtered = filterNews(all, coin, sentiment);
        return paginate(filtered, page, limit);
    }

    private List<News> filterNews(List<News> all, String coin, String sentiment) {
        return all.stream()
            .filter(n -> coin == null || n.getCoins().contains(coin))
            .filter(n -> sentiment == null || sentiment.equals(n.getSentiment()))
            .collect(Collectors.toList());
    }
}
```

**NewsController.java** (REST Endpoints)

```java
@RestController
@RequestMapping("/news")
@Slf4j
public class NewsController {

    @Autowired
    private NewsService newsService;

    @GetMapping
    public ResponseEntity<?> getNews(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int limit,
        @RequestParam(required = false) String coin,
        @RequestParam(required = false) String sentiment
    ) {
        try {
            PageResponse<News> data = newsService.getNews(page, limit, coin, sentiment);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.status(503)
                .body(ApiResponse.error("Failed to fetch news"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNewsById(@PathVariable String id) {
        // Implementation
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        // Health check
    }
}
```

---

## VIII. EXTERNAL API SELECTION

### 8.1. API Options

| API                    | Free Tier    | Limit     | Pros                      | Cons                         |
| ---------------------- | ------------ | --------- | ------------------------- | ---------------------------- |
| **CryptoPanic**        | ✅ Yes       | 50/minute | Real crypto news, curated | Require API key registration |
| **NewsAPI.org**        | ✅ Yes       | 100/day   | Simple, structured        | Need to filter crypto news   |
| **CoinTelegraph RSS**  | ✅ Yes (RSS) | N/A       | Free, no auth             | Parsing RSS format           |
| **CoinMarketCap News** | ❌ No        | -         | Authoritative             | Premium API                  |

### 8.2. Recommend: CryptoPanic (Free)

**Lý do:**

- Free tier (50 req/min)
- Real crypto news
- JSON API (dễ parse)
- No complex authentication

**Setup:**

1. Đăng ký tại https://cryptopanic.com/developers/
2. Lấy API key (1-2 phút)
3. Thêm vào `application.yml`:

```yaml
cryptopanic:
  api-url: https://cryptopanic.com/api/posts/
  api-key: ${CRYPTOPANIC_API_KEY}
```

**API Call Example:**

```
GET https://cryptopanic.com/api/posts/?auth_token=YOUR_KEY&currencies=BTC,ETH&limit=50
```

---

## IX. TÍCH HỢP VỚI GATEWAY (NODE.JS)

### 9.1. Code cần thêm vào Gateway

**File:** `backend/api-gateway/server.js`

**Thêm vào sau đoạn tạo các proxy khác (~line 120):**

```javascript
// ===========================
// NEWS SERVICE (Java Spring Boot) - NEW
// ===========================

// Create proxy for news service
const newsProxy = createServiceProxy("news-service", "news");

// ===========================
// API Routes - Service Proxies
// ===========================

// ... (các route hiện tại vẫn giữ nguyên)

// NEWS SERVICE - Public route (không cần auth)
app.use("/api/news", newsProxy);

// Hoặc nếu muốn auth optional:
// app.use('/api/news', optionalAuth, newsProxy);
```

**Total:** ~5 dòng code, không làm thay đổi logic hiện tại

---

### 9.2. Verify Integration

**Test command:**

```bash
# 1. Chắc chắn News Service chạy:
curl http://localhost:3006/news

# 2. Qua Gateway (sau khi thêm proxy):
curl http://localhost:3000/api/news

# 3. Kiểm tra Consul registration:
curl http://localhost:8500/v1/catalog/service/news-service
```

---

## X. FRONTEND INTEGRATION

### 10.1. New News Page Component

**File:** `frontend/src/pages/News.jsx` (tạo mới)

**Chức năng:**

- Table hiển thị danh sách tin
- Filter theo coin, sentiment
- Pagination
- Detail modal khi click

### 10.2. Add Widget vào Dashboard

**File:** `frontend/src/pages/Dashboard.jsx` (sửa)

**Thêm section:**

```jsx
{
  /* Breaking News Widget */
}
<div className="crypto-card">
  <h3>🔔 Breaking News</h3>
  <BreakingNewsWidget limit={3} />
</div>;
```

### 10.3. API Calls

**File:** `frontend/src/services/api.js` (sửa)

**Thêm:**

```javascript
export const newsAPI = {
  getNews: (page = 1, limit = 10, filters = {}) =>
    instance.get("/news", { params: { page, limit, ...filters } }),
  getNewsDetail: (id) => instance.get(`/news/${id}`),
  getTrending: (limit = 5) =>
    instance.get("/news/trending", { params: { limit } }),
};
```

---

## XI. DEPLOYMENT & RUNNING

### 11.1. Local Development

**Chuẩn bị:**

1. ✅ Java 11+ installed
2. ✅ Maven 3.8+ installed
3. ✅ Consul running (`consul agent -dev`)
4. ✅ CryptoPanic API key đã có

**Build & Run:**

```bash
cd news-service

# Build
mvn clean package -DskipTests

# Run
mvn spring-boot:run

# Or run JAR directly:
java -jar target/news-service-1.0.0.jar
```

**Expected Output:**

```
[main] c.c.n.NewsServiceApplication : Started NewsServiceApplication
news-service registered in Consul successfully
Cache initialized with 0 articles
Scheduled news fetch started
```

### 11.2. Docker (Optional, nếu muốn)

**Dockerfile:**

```dockerfile
FROM openjdk:11-jre-slim
WORKDIR /app
COPY target/news-service-1.0.0.jar app.jar
EXPOSE 3006
ENV SPRING_PROFILES_ACTIVE=docker
CMD ["java", "-jar", "app.jar"]
```

**Build & Run:**

```bash
docker build -t news-service:1.0.0 .
docker run -p 3006:3006 \
  -e CONSUL_HOST=host.docker.internal \
  -e CRYPTOPANIC_API_KEY=xxx \
  news-service:1.0.0
```

---

## XII. TESTING STRATEGY

### 12.1. Unit Tests

**Test Cases:**

- ✅ Cache load & expiration
- ✅ Filter logic (coin, sentiment)
- ✅ Pagination calculation
- ✅ Sentiment analysis

**Tools:** JUnit 5 + Mockito

### 12.2. Integration Tests

**Test Cases:**

- ✅ Controller endpoints (GET /news, /news/{id})
- ✅ ExternalAPI call (mocked)
- ✅ Exception handling

**Tools:** Spring Boot Test + MockMvc

### 12.3. Manual Testing

**Postman Collection (tạo):**

- Collection: "News Service"
  - `GET /news` - List
  - `GET /news/{id}` - Detail
  - `GET /news/trending` - Trending
  - `GET /health` - Health

---

## XIII. KIỂM THỬ & DEMO CHECKLIST

### 13.1. Pre-Demo Checklist

- [ ] Java Service chạy stable (no errors)
- [ ] Consul discovery working (check UI)
- [ ] Cache hiển thị stats (health endpoint)
- [ ] Tin tức fetch từ API external thành công
- [ ] Gateway proxy routing working
- [ ] Frontend page hiển thị đẹp
- [ ] Pagination & filter hoạt động
- [ ] No breaking change với services hiện tại
- [ ] Response time < 100ms
- [ ] Error handling graceful

### 13.2. Demo Flow (với Giảng viên)

1. **Giới thiệu kiến trúc:**
   - "Đây là News Service viết bằng Java Spring Boot"
   - "Tự động register với Consul như các Node services"

2. **Show code:**
   - Chỉ vào `NewsController.java` (10 min)
   - Cache config trong `CacheConfig.java` (5 min)

3. **Live demo:**
   - Mở Postman/Insomnia
   - Call `GET /api/news` qua Gateway
   - Show Frontend News Page render đẹp
   - Filter theo coin, sentiment
   - Click vào 1 tin xem detail

4. **Q&A Giáo viên:**
   - "Tại sao chọn Java?" → Language-agnostic SOA
   - "Cache strategy?" → Guava in-memory, không DB
   - "Mở rộng được không?" → Độc lập scale, không ảnh hưởng services khác

---

## XIV. RISK & MITIGATION

### 14.1. Risks

| Risk                         | Likelihood | Impact     | Mitigation                           |
| ---------------------------- | ---------- | ---------- | ------------------------------------ |
| CryptoPanic API rate limit   | Medium     | Fetch fail | Add retry logic, fallback to cache   |
| Java version incompatibility | Low        | Build fail | Docker ensured compatible JDK        |
| Cache memory leak            | Low        | Crash      | TTL 24h auto cleanup, JVM monitoring |
| Gateway integration fail     | Low        | No access  | Test routing separately before merge |

### 14.2. Fallback Plans

1. **API unavailable:** Serve cached data từ memory
2. **Java service down:** Gateway return 503, frontend shows error gracefully
3. **Memory overflow:** Auto clean cache nếu >100 articles

---

## XV. DOCUMENTATION & KNOWLEDGE SHARING

### 15.1. Code Comments (English - để consistent với codebase)

```java
/**
 * Initialize Guava cache for storing news articles.
 * Cache TTL: 24 hours (auto evict)
 * Max size: 100 articles (FIFO)
 */
@PostConstruct
public void initCache() { ... }
```

### 15.2. README.md cho News Service

```markdown
# News Service (Java Spring Boot)

## Overview

SOA microservice providing crypto news from external APIs.

## Tech Stack

- Java 11+
- Spring Boot 3.x
- Guava Cache (in-memory)
- Consul Service Discovery

## Running

mvn spring-boot:run

## API Endpoints

- GET /news - List articles
- GET /news/{id} - Detail
- GET /health - Health check

## Configuration

See application.yml for Consul & API key setup.
```

### 15.3. Architecture Diagram (cho report)

```
Frontend (React)
    ↓ HTTP /api/news
Gateway (Node.js Express)
    ↓ Proxy to service-service
News Service (Java Spring Boot, Port 3006)
    ├─ NewsController
    ├─ NewsService (Guava Cache)
    └─ CryptoPanicProvider
        ↓ HTTP
    CryptoPanic API (External)
```

---

## XVI. CONCLUSION

### 16.1. Expected Outcome

✅ **Demo tính năng:**

- Tin tức crypto real-time trên app
- Từ Java service, không Node.js
- Tích hợp seamless với Gateway

✅ **Demonstrate SOA:**

- Service 6 bằng ngôn ngữ khác (Java)
- Same service discovery (Consul)
- Same API Gateway pattern
- Language-agnostic! ✨

✅ **Plus points cho điểm:**

- Diversify tech stack
- Show understanding of microservices
- Production-like setup (caching, scheduling, error handling)

### 16.2. Success Criteria

- ✅ News Service chạy stable
- ✅ 0 breaking changes với services khác
- ✅ Giảng viên ghi nhận SOA concept
- ✅ Demo smooth (< 5 phút setup)
- ✅ Code quality (readable, documented)

---

**End of Document**

---

_Prepared by: AI Assistant_  
_Last updated: 03/04/2026_  
_Status: Ready for development_
