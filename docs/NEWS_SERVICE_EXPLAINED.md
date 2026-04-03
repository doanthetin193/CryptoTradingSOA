# 📰 News Service — Giải thích toàn diện

> **Mục tiêu của tài liệu này:** Giúp bạn hiểu rõ *tại sao* và *như thế nào* News Service được xây dựng bằng Spring Boot, từ kiến trúc tổng thể đến từng dòng code nghiệp vụ.

---

## Mục lục

1. [Tại sao dùng Spring Boot thay vì Node.js?](#1-tại-sao-dùng-spring-boot-thay-vì-nodejs)
2. [Sơ đồ tổng thể News Service](#2-sơ-đồ-tổng-thể-news-service)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Điểm khởi đầu — NewsServiceApplication.java](#4-điểm-khởi-đầu--newsserviceapplicationjava)
5. [Cấu hình — application.yml](#5-cấu-hình--applicationyml)
6. [Model — Dữ liệu trông như thế nào?](#6-model--dữ-liệu-trông-như-thế-nào)
7. [Provider — Lấy tin tức từ đâu?](#7-provider--lấy-tin-tức-từ-đâu)
8. [SentimentAnalyzer — Phân tích cảm xúc bài báo](#8-sentimentanalyzer--phân-tích-cảm-xúc-bài-báo)
9. [NewsService — Trái tim xử lý nghiệp vụ](#9-newsservice--trái-tim-xử-lý-nghiệp-vụ)
10. [NewsFetchScheduler — Tự động làm mới tin tức](#10-newsfetchscheduler--tự-động-làm-mới-tin-tức)
11. [NewsController — Cổng giao tiếp với bên ngoài](#11-newscontroller--cổng-giao-tiếp-với-bên-ngoài)
12. [Exception Handling — Xử lý lỗi thống nhất](#12-exception-handling--xử-lý-lỗi-thống-nhất)
13. [AppConfig — Cấu hình Bean chung](#13-appconfig--cấu-hình-bean-chung)
14. [Luồng request đầy đủ](#14-luồng-request-đầy-đủ)
15. [Tích hợp với hệ thống SOA](#15-tích-hợp-với-hệ-thống-soa)
16. [Những vấn đề đã gặp và cách fix](#16-những-vấn-đề-đã-gặp-và-cách-fix)

---

## 1. Tại sao dùng Spring Boot thay vì Node.js?

Dự án CryptoTrading SOA có tất cả các service viết bằng **Node.js + Express**. Riêng News Service được viết bằng **Java Spring Boot**. Lý do:

| Tiêu chí | Node.js (các service khác) | Spring Boot (News Service) |
|----------|---------------------------|---------------------------|
| Phù hợp với | I/O nhiều, realtime | CPU-bound, xử lý dữ liệu phức tạp |
| Ecosystem | npm, Express | Maven, Spring ecosystem |
| Caching | Tự xây hoặc Redis | Guava Cache tích hợp sẵn, rất mạnh |
| Scheduling | node-cron | `@Scheduled` annotation chuẩn |
| Type safety | Không bắt buộc | Bắt buộc, bắt lỗi compile time |
| Mục đích demo | — | Thể hiện tính lỏng lẻo SOA |

> **Đây chính là điểm hay của SOA (Service-Oriented Architecture):** Mỗi service có thể dùng ngôn ngữ/framework khác nhau, miễn là chúng giao tiếp qua API chuẩn. Frontend và Gateway hoàn toàn không biết News Service viết bằng Java — chúng chỉ biết gọi `GET /api/news`.

---

## 2. Sơ đồ tổng thể News Service

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                  http://localhost:5173                       │
└─────────────────────────┬───────────────────────────────────┘
                          │ GET /api/news?page=1&limit=10
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    API GATEWAY :3000                         │
│                                                             │
│  newsProxy: strip "/api" → forward to news-service         │
│  /api/news/trending → /news/trending                        │
└─────────────────────────┬───────────────────────────────────┘
                          │ GET /news?page=1&limit=10
                          │ (Consul Service Discovery)
┌─────────────────────────▼───────────────────────────────────┐
│               NEWS SERVICE :3006 (Spring Boot)              │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────────┐  │
│  │NewsController│──▶│ NewsService │──▶│ Guava Cache      │  │
│  │ /news/*     │   │(Business    │   │ (in-memory,      │  │
│  └─────────────┘   │  Logic)     │   │  TTL 24h)        │  │
│                    └──────┬──────┘   └──────────────────┘  │
│                           │ (cache miss)                    │
│                    ┌──────▼──────────────────┐             │
│                    │  CryptoCompareProvider  │             │
│                    │  Gọi API bên ngoài      │             │
│                    └──────┬──────────────────┘             │
│                           │                                 │
│  ┌────────────────────────▼──────────────────────────────┐ │
│  │           NewsFetchScheduler (mỗi 15 phút)            │ │
│  │  Tự động refresh cache, không cần ai gọi              │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│             CryptoCompare API (Internet)                     │
│     https://min-api.cryptocompare.com/data/v2/news/         │
│     Trả về 50 bài báo crypto mới nhất                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Cấu trúc thư mục

```
news-service/
├── pom.xml                          # Maven build config (Java version, dependencies)
├── src/main/
│   ├── java/com/cryptotrading/news/
│   │   ├── NewsServiceApplication.java     # ← Điểm khởi động Spring Boot
│   │   ├── config/
│   │   │   └── AppConfig.java              # ← Cấu hình Bean: ObjectMapper, RestTemplate
│   │   ├── controller/
│   │   │   └── NewsController.java         # ← Nhận HTTP request, trả response
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java # ← Bắt lỗi toàn cục
│   │   │   ├── NewsNotFoundException.java  # ← Exception khi không tìm thấy bài
│   │   │   └── NewsServiceException.java   # ← Exception khi service lỗi
│   │   ├── model/
│   │   │   ├── News.java                   # ← Cấu trúc 1 bài tin tức
│   │   │   ├── ApiResponse.java            # ← Format response chuẩn
│   │   │   └── PageResponse.java           # ← Response có phân trang
│   │   ├── provider/
│   │   │   └── CryptoCompareProvider.java  # ← Gọi API ngoài lấy tin
│   │   ├── service/
│   │   │   ├── NewsService.java            # ← Business logic chính
│   │   │   └── NewsFetchScheduler.java     # ← Tự động fetch định kỳ
│   │   └── util/
│   │       └── SentimentAnalyzer.java      # ← Phân tích cảm xúc bài báo
│   └── resources/
│       └── application.yml                 # ← Cấu hình port, cache, API keys...
└── target/
    └── news-service-1.0.0.jar              # ← File chạy được sau khi build
```

> **Quy tắc vàng của Spring Boot:** Mỗi class có một trách nhiệm rõ ràng. Controller chỉ nhận request, Service chỉ xử lý nghiệp vụ, Provider chỉ lấy dữ liệu. Không class nào làm hết mọi thứ.

---

## 4. Điểm khởi đầu — NewsServiceApplication.java

```java
@SpringBootApplication   // ← Annotation này làm 3 việc cùng lúc:
@EnableScheduling        // ← Bật tính năng chạy tác vụ định kỳ (@Scheduled)
public class NewsServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NewsServiceApplication.class, args);
    }
}
```

**`@SpringBootApplication` thực ra là tổ hợp 3 annotations:**
- `@Configuration` — Class này có thể chứa Bean definitions
- `@EnableAutoConfiguration` — Spring tự động cấu hình dựa trên dependencies có trong pom.xml (thấy có Spring Web → tự setup Tomcat, thấy có Actuator → tự expose `/actuator/health`)
- `@ComponentScan` — Quét toàn bộ package `com.cryptotrading.news` để tìm và đăng ký các class có `@Component`, `@Service`, `@Controller`, `@Repository`

**`@EnableScheduling`** — Nếu không có annotation này, dù bạn viết `@Scheduled` ở đâu cũng sẽ không chạy. Đây là "công tắc" bật Scheduling engine.

---

## 5. Cấu hình — application.yml

```yaml
server:
  port: 3006              # ← News Service chạy ở cổng 3006

spring:
  application:
    name: news-service    # ← Tên này dùng để đăng ký với Consul

  cloud:
    consul:
      host: localhost
      port: 8500
      discovery:
        health-check-path: /news/health   # ← Consul gọi đây để check service còn sống không
        health-check-interval: 10s        # ← Cứ 10 giây check 1 lần
        fail-fast: false                  # ← Không crash nếu Consul chưa sẵn sàng

cryptocompare:
  api-url: https://min-api.cryptocompare.com/data/v2/news/
  api-key: ${CRYPTOCOMPARE_API_KEY:}    # ← Đọc từ biến môi trường, nếu không có thì để trống

cache:
  news-ttl-hours: 24      # ← Cache tin tức trong 24 giờ (không fetch lại liên tục)
  max-size: 100           # ← Tối đa 100 entry trong cache

scheduler:
  news-fetch-interval-ms: 900000  # ← Fetch lại sau mỗi 15 phút (900000ms)
```

**Tại sao dùng `${CRYPTOCOMPARE_API_KEY:}` thay vì ghi thẳng key vào file?**

Đây là best practice bảo mật. Bạn không bao giờ commit API key vào Git. Dấu `:` sau tên biến nghĩa là "nếu biến môi trường không tồn tại, dùng giá trị mặc định là chuỗi rỗng". Khi chạy:

```powershell
$env:CRYPTOCOMPARE_API_KEY="abc123"
java -jar news-service-1.0.0.jar
```

Spring tự đọc biến môi trường và inject vào field `cryptoCompareApiKey`.

---

## 6. Model — Dữ liệu trông như thế nào?

### 6.1. News.java — Một bài tin tức

```java
@Data       // ← Lombok: tự tạo getter, setter, toString, equals, hashCode
@Builder    // ← Lombok: cho phép dùng pattern Builder (News.builder().title("...").build())
@NoArgsConstructor  // ← Lombok: tạo constructor không tham số
@AllArgsConstructor // ← Lombok: tạo constructor đầy đủ tham số
public class News {
    private String id;           // UUID duy nhất, tạo khi parse
    private String title;        // Tiêu đề bài báo
    private String summary;      // Tóm tắt
    private String content;      // Nội dung đầy đủ
    private String source;       // Tên nguồn: "CryptoCompare", "CoinDesk"...
    private String url;          // Đường link gốc
    private String imageUrl;     // Ảnh thumbnail
    private String sentiment;    // "positive" | "negative" | "neutral"
    private List<String> coins;  // ["BTC", "ETH"] - coins liên quan
    private LocalDateTime publishedAt;  // Khi bài được đăng
    private LocalDateTime fetchedAt;    // Khi ta lấy bài về
    private Integer views;       // Số lượt xem (dùng để tính trending)
}
```

**Tại sao cần `fetchedAt` ngoài `publishedAt`?**

`publishedAt` là thời điểm bài báo gốc đăng. `fetchedAt` là lúc service ta tải về. Hai cái khác nhau giúp debug: nếu `fetchedAt` cách `publishedAt` 2 tiếng → service đang bị delay.

### 6.2. ApiResponse.java — Format response nhất quán

Mọi endpoint đều trả về cùng 1 format:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-04-03T13:28:15Z"
}
```

Khi lỗi:
```json
{
  "success": false,
  "message": "News article not found with id: abc123",
  "error": "NEWS_NOT_FOUND",
  "timestamp": "2026-04-03T13:28:15Z"
}
```

```java
// Cách dùng trong code:
return ResponseEntity.ok(ApiResponse.success(data));         // 200 OK
return ResponseEntity.status(404).body(ApiResponse.error("Not found", "NEWS_NOT_FOUND"));
```

**Annotation `@JsonInclude(JsonInclude.Include.NON_NULL)`** — Nếu field nào là `null` thì không xuất hiện trong JSON. Tránh trả về `"message": null` khi không cần.

### 6.3. PageResponse.java — Response có phân trang

```json
{
  "success": true,
  "data": {
    "news": [ ... ],
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

---

## 7. Provider — Lấy tin tức từ đâu?

### CryptoCompareProvider.java

Provider là layer chịu trách nhiệm **giao tiếp với thế giới bên ngoài** (external APIs). Nó có 3 cấp độ fallback:

```
Attempt 1: CryptoCompare API (primary, FREE)
    ↓ (nếu thất bại)
Attempt 2: NewsAPI.org (nếu có NEWSAPI_KEY trong .env)
    ↓ (nếu cũng thất bại)
Attempt 3: Sample data (hardcoded, luôn hoạt động)
```

**Tại sao cần fallback?**

Nếu CryptoCompare bị rate limit hoặc down, service vẫn hoạt động, user vẫn thấy tin tức (dù là sample). Đây gọi là **Graceful Degradation** — nguyên tắc quan trọng trong hệ thống phân tán.

### Cách gọi CryptoCompare API

```java
// Dùng UriComponentsBuilder để build URL an toàn (tránh URL injection)
UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(cryptoCompareApiUrl)
        .queryParam("lang", "EN")
        .queryParam("size", 50);     // Lấy 50 bài mỗi lần

if (cryptoCompareApiKey != null && !cryptoCompareApiKey.isBlank()) {
    builder.queryParam("api_key", cryptoCompareApiKey);
}

String json = restTemplate.getForObject(builder.toUriString(), String.class);
```

**URL cuối cùng:** `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&size=50&api_key=xxx`

### Parse JSON từ CryptoCompare

CryptoCompare trả về:
```json
{
  "Data": [
    {
      "title": "Bitcoin hits $100K",
      "url": "https://...",
      "source": "CoinDesk",
      "body": "Full article text...",
      "published_on": 1743700800    ← Unix timestamp (giây), không phải ISO date!
    }
  ]
}
```

Vì `published_on` là **Unix epoch** (số giây từ 1/1/1970), phải convert thủ công:

```java
// "1743700800" → LocalDateTime
LocalDateTime publishedAt = LocalDateTime.ofEpochSecond(
    Long.parseLong(publishedAtStr),  // parse string thành long
    0,                               // nanoseconds
    ZoneOffset.UTC                   // UTC timezone
);
```

Nếu dùng `LocalDateTime.parse()` bình thường sẽ bị exception vì format không phải ISO 8601.

Sau khi parse xong, mỗi bài được tạo thành `News` object:

```java
News news = News.builder()
        .id(UUID.randomUUID().toString())          // tạo ID duy nhất
        .title(title)
        .summary(summary)
        .source(sourceName)
        .url(url)
        .sentiment(sentimentAnalyzer.analyze(title, summary))   // phân tích cảm xúc
        .coins(sentimentAnalyzer.extractCoins(title, summary))  // trích xuất coin
        .publishedAt(publishedAt)
        .fetchedAt(LocalDateTime.now())
        .views(sentimentAnalyzer.simulateViews(title))          // mô phỏng views
        .build();
```

---

## 8. SentimentAnalyzer — Phân tích cảm xúc bài báo

Đây là module NLP (Natural Language Processing) đơn giản dựa trên **keyword matching**.

### 8.1. Phân tích sentiment

```java
private static final List<String> POSITIVE_KEYWORDS = Arrays.asList(
    "surge", "rally", "bull", "gain", "rise", "soar", "high", "record",
    "breakout", "adopt", "approve", "launch", "growth", "profit", ...
);

private static final List<String> NEGATIVE_KEYWORDS = Arrays.asList(
    "crash", "drop", "fall", "bear", "loss", "decline", "dump", "low",
    "hack", "scam", "ban", "restrict", "fraud", "collapse", "risk", ...
);

public String analyze(String title, String summary) {
    String combined = (title + " " + summary).toLowerCase();

    long positiveCount = POSITIVE_KEYWORDS.stream()
            .filter(combined::contains)   // Đếm có bao nhiêu từ positive xuất hiện
            .count();

    long negativeCount = NEGATIVE_KEYWORDS.stream()
            .filter(combined::contains)
            .count();

    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
}
```

**Ví dụ:**
- Title: `"Bitcoin hits all-time high record, bulls celebrate"` → positive count = 3 (high, record, bull) → `positive`
- Title: `"Crypto exchange hacked, users lose funds"` → negative count = 2 (hack, loss) → `negative`

### 8.2. Trích xuất coin từ bài báo

```java
private static final Map<String, String> COIN_KEYWORDS = Map.of(
    "bitcoin", "BTC",
    "btc", "BTC",
    "ethereum", "ETH",
    "eth", "ETH",
    "solana", "SOL",
    ...
);

public List<String> extractCoins(String title, String summary) {
    String combined = (title + " " + summary).toLowerCase();
    List<String> found = new ArrayList<>();

    COIN_KEYWORDS.forEach((keyword, symbol) -> {
        if (combined.contains(keyword) && !found.contains(symbol)) {
            found.add(symbol);  // Thêm vào nếu chưa có
        }
    });
    return found;
}
```

**Ví dụ:**
- `"Ethereum and BTC both surge today"` → `["ETH", "BTC"]`
- `"Solana DeFi ecosystem growing"` → `["SOL"]`

Nếu không tìm thấy coin nào → mặc định gán `["BTC"]` (vì BTC là coin phổ biến nhất, tin crypto nào cũng liên quan).

---

## 9. NewsService — Trái tim xử lý nghiệp vụ

Đây là class quan trọng nhất. Nó chứa toàn bộ business logic.

### 9.1. Guava Cache — Caching thông minh

Thay vì fetch API mỗi khi user request tin tức (chậm, tốn quota), service dùng **Guava Cache** — thư viện cache in-memory của Google.

```java
@PostConstruct   // ← Annotation: chạy method này ngay sau khi Spring khởi tạo class xong
public void initCache() {
    newsCache = CacheBuilder.newBuilder()
            .maximumSize(1)                             // Chỉ giữ 1 entry ("all")
            .expireAfterWrite(newsTtlHours, TimeUnit.HOURS)  // Hết hạn sau 24h
            .recordStats()                              // Theo dõi hit rate
            .build(new CacheLoader<String, List<News>>() {
                @Override
                public List<News> load(String key) {
                    // Hàm này TỰ ĐỘNG chạy khi cache miss
                    List<News> news = cryptoCompareProvider.fetchLatestNews();
                    return news;
                }
            });
}
```

**Cách hoạt động:**

```
Request 1 (13:00): getAll() → cache MISS → gọi CryptoCompare API → lưu cache → trả về
Request 2 (13:01): getAll() → cache HIT → lấy từ bộ nhớ → trả về (0ms delay)
Request 3 (14:00): getAll() → cache HIT → lấy từ bộ nhớ → trả về
...
Request N (13:00 ngày hôm sau): getAll() → cache EXPIRED → gọi CryptoCompare API lại
```

**Lợi ích:**
- Response time giảm từ ~500ms (gọi API) xuống ~1ms (đọc bộ nhớ)
- Tiết kiệm quota API (chỉ gọi tối đa 96 lần/ngày thay vì mỗi request)

### 9.2. Filter — Lọc tin tức

```java
private List<News> applyFilters(List<News> all, String coin, String sentiment, String search) {
    return all.stream()
            // Lọc theo coin: nếu user truyền ?coin=BTC thì chỉ lấy bài có "BTC" trong danh sách coins
            .filter(n -> {
                if (coin == null || coin.isBlank()) return true;  // không lọc nếu không truyền
                return n.getCoins() != null && n.getCoins().contains(coin.toUpperCase());
            })
            // Lọc theo sentiment: ?sentiment=positive
            .filter(n -> {
                if (sentiment == null || sentiment.isBlank()) return true;
                return sentiment.equalsIgnoreCase(n.getSentiment());
            })
            // Tìm kiếm: ?search=bitcoin surges
            .filter(n -> {
                if (search == null || search.isBlank()) return true;
                String q = search.toLowerCase();
                return (n.getTitle() != null && n.getTitle().toLowerCase().contains(q))
                        || (n.getSummary() != null && n.getSummary().toLowerCase().contains(q));
            })
            .collect(Collectors.toList());
}
```

**Java Stream API** cho phép viết filter kiểu pipeline rất đọc được. Giống `Array.filter()` trong JavaScript.

### 9.3. Phân trang (Pagination)

```java
private <T> PageResponse<T> paginate(List<T> items, int page, int limit) {
    int total = items.size();                                // Tổng số bài
    int totalPages = (int) Math.ceil((double) total / limit); // Tổng số trang
    int fromIndex = Math.min((page - 1) * limit, total);    // Index bắt đầu
    int toIndex = Math.min(fromIndex + limit, total);        // Index kết thúc

    List<T> pageItems = items.subList(fromIndex, toIndex);   // Cắt đúng trang
    ...
}
```

**Ví dụ với 50 bài, page=2, limit=10:**
- `fromIndex = (2-1) * 10 = 10`
- `toIndex = 10 + 10 = 20`
- Trả về bài số 10 đến 19

### 9.4. Trending News

Trending = sắp xếp theo số lượt xem (`views`) từ cao xuống thấp:

```java
private List<News> calculateTrending() {
    return newsCache.get(CACHE_KEY_ALL).stream()
            .sorted(Comparator.comparingInt(News::getViews).reversed())  // Giảm dần
            .collect(Collectors.toList());
}
```

Số `views` được `SentimentAnalyzer.simulateViews(title)` tạo ra dựa trên hash của title — đảm bảo cùng title luôn cho cùng views, nhưng khác title thì khác views.

---

## 10. NewsFetchScheduler — Tự động làm mới tin tức

```java
@Service
public class NewsFetchScheduler {

    @Autowired
    private NewsService newsService;

    // Chạy lần đầu sau 30s khởi động, sau đó mỗi 15 phút
    @Scheduled(initialDelay = 30_000, fixedRateString = "${scheduler.news-fetch-interval-ms:900000}")
    public void scheduledFetch() {
        log.info("🔄 [Scheduler] Starting scheduled news fetch...");
        newsService.refreshCache();
    }
}
```

**`@Scheduled` hoạt động như thế nào?**

Spring Boot tạo một **thread riêng** (background thread) chạy scheduled tasks. Thread này độc lập với các HTTP request. Nó:
1. Chờ 30 giây sau khi service start (để các bean khác khởi tạo xong)
2. Gọi `refreshCache()` để invalidate cache cũ và fetch tin mới
3. Ngủ 15 phút
4. Lặp lại từ bước 2

```java
public void refreshCache() {
    newsCache.invalidate(CACHE_KEY_ALL);      // Xóa cache cũ
    trendingCache.invalidate(CACHE_KEY_TRENDING);
    getAllCached();   // Pre-warm: fetch ngay để cache request tiếp theo nhanh hơn
}
```

**Pre-warming** là kỹ thuật quan trọng: fetch và điền vào cache trước, thay vì đợi đến khi có request mới fetch (lazy). Điều này đảm bảo user không bao giờ phải chờ cache miss.

---

## 11. NewsController — Cổng giao tiếp với bên ngoài

```java
@RestController           // ← @Controller + @ResponseBody: mọi return value tự convert sang JSON
@RequestMapping("/news")  // ← Tất cả endpoints đều có prefix /news
@CrossOrigin(origins = "*")  // ← Cho phép frontend (localhost:5173) gọi vào
public class NewsController {

    @Autowired
    private NewsService newsService;  // ← Spring tự inject NewsService vào đây
```

**`@Autowired`** — Spring quản lý vòng đời của các Bean. Khi bạn dùng `@Autowired`, bạn đang nói: "Spring ơi, hãy tự tìm và inject `NewsService` vào đây cho tôi, tôi không cần tự `new NewsService()`". Đây gọi là **Dependency Injection**.

### Các endpoints

| HTTP Method | Path | Mô tả |
|-------------|------|-------|
| `GET` | `/news` | Danh sách tin, có lọc và phân trang |
| `GET` | `/news/trending` | Top tin nhiều views nhất |
| `GET` | `/news/coins/{coin}` | Tin theo coin cụ thể |
| `GET` | `/news/{id}` | Chi tiết 1 bài |
| `GET` | `/news/health` | Health check cho Consul |

**Thứ tự mapping quan trọng:** `/news/trending` phải được khai báo **trước** `/news/{id}`. Nếu không, Spring sẽ hiểu "trending" là `id="trending"` và tìm bài có id đó → 404.

```java
@GetMapping("/trending")    // ← Khai báo trước
public ResponseEntity<...> getTrending(...) { ... }

@GetMapping("/{id}")        // ← Khai báo sau
public ResponseEntity<...> getNewsById(@PathVariable String id) { ... }
```

### Health Check Endpoint

```java
@GetMapping("/health")
public ResponseEntity<Map<String, Object>> health() {
    NewsService.CacheStats stats = newsService.getCacheStats();
    return ResponseEntity.ok(Map.of(
        "status", "UP",
        "cache", Map.of(
            "size", stats.size(),           // Số bài đang cache
            "hitRate", "98.5%",            // Tỉ lệ cache hit
            "totalFetches", 3              // Tổng số lần fetch từ API ngoài
        )
    ));
}
```

Consul (Service Discovery) gọi endpoint này mỗi 10 giây để biết service còn sống không. Nếu trả về 200 → healthy. Nếu timeout hoặc lỗi → Consul đánh dấu unhealthy và không route request đến service này nữa.

---

## 12. Exception Handling — Xử lý lỗi thống nhất

```java
@RestControllerAdvice  // ← Áp dụng cho tất cả Controller trong dự án
public class GlobalExceptionHandler {

    // Khi NewsService throw NewsNotFoundException
    @ExceptionHandler(NewsNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNewsNotFound(NewsNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage(), "NEWS_NOT_FOUND"));
    }

    // Khi tham số sai kiểu (ví dụ: ?page=abc thay vì ?page=1)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(...) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Invalid parameter", "BAD_REQUEST"));
    }

    // Catch-all: mọi exception khác không dự đoán được
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred", "INTERNAL_ERROR"));
    }
}
```

**Tại sao tách Exception Handler ra class riêng?**

Không dùng cách này thì mỗi Controller phải tự try-catch, code lặp lại, format lỗi không nhất quán. `@RestControllerAdvice` giải quyết bằng AOP (Aspect-Oriented Programming) — chặn exception ở mọi Controller rồi xử lý tập trung.

**Luồng xử lý:**
```
Service throw NewsNotFoundException("id: abc not found")
    ↓
Spring tự động tìm @ExceptionHandler(NewsNotFoundException.class)
    ↓
handleNewsNotFound() chạy, trả về HTTP 404 + JSON chuẩn
    ↓
Client nhận được: { "success": false, "message": "...", "error": "NEWS_NOT_FOUND" }
```

---

## 13. AppConfig — Cấu hình Bean chung

```java
@Configuration  // ← Class này chứa định nghĩa Bean
public class AppConfig {

    @Bean  // ← Tạo ObjectMapper và đăng ký với Spring container
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())   // Hỗ trợ LocalDateTime
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)  // Date dạng ISO string, không phải số
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);  // Bỏ qua field lạ trong JSON
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();  // Client HTTP để gọi API ngoài
    }
}
```

**Tại sao cần cấu hình `ObjectMapper`?**

Mặc định, Jackson (thư viện JSON của Spring) serialize `LocalDateTime` thành mảng số `[2026, 4, 3, 13, 28, 15]`. Sau khi disable `WRITE_DATES_AS_TIMESTAMPS`, nó sẽ ra `"2026-04-03T13:28:15"` — dễ đọc hơn nhiều.

**`FAIL_ON_UNKNOWN_PROPERTIES = false`**: Nếu API ngoài trả về JSON có field mà model Java chưa khai báo, Jackson không throw exception mà bỏ qua. Quan trọng khi parse response từ CryptoCompare — họ có thể trả về nhiều field hơn ta cần.

---

## 14. Luồng request đầy đủ

### Kịch bản: User mở trang News trên browser

```
1. Browser gửi: GET http://localhost:5173/news
   (React app load trang, sau đó gọi API)

2. React gọi: GET http://localhost:3000/api/news?page=1&limit=10
   (qua axios trong frontend/src/services/api.js)

3. API Gateway nhận request:
   - Kiểm tra auth? → News là public route, không cần JWT
   - newsProxy: rewrite path "/api/news?page=1&limit=10" → "/news?page=1&limit=10"
   - Hỏi Consul: "news-service đang ở đâu?"
   - Consul trả lời: "http://192.168.1.85:3006"
   - Forward request đến: http://192.168.1.85:3006/news?page=1&limit=10

4. NewsController nhận: GET /news?page=1&limit=10
   - Gọi newsService.getNews(1, 10, null, null, null)

5. NewsService xử lý:
   - getAllCached() → Guava Cache kiểm tra key "all"
   - Cache HIT (nếu đã có dữ liệu) → trả về 50 bài từ bộ nhớ
   - Cache MISS (lần đầu) → gọi CryptoCompareProvider.fetchLatestNews()

6. CryptoCompareProvider (nếu cache miss):
   - Gọi https://min-api.cryptocompare.com/data/v2/news/?lang=EN&size=50&api_key=...
   - Nhận JSON với 50 bài
   - Parse từng bài: convertEpoch → LocalDateTime, extractCoins, analyze sentiment
   - Trả về List<News> 50 bài đã parse

7. NewsService tiếp tục:
   - applyFilters(all, null, null, null) → không lọc, giữ 50 bài
   - paginate(50 bài, page=1, limit=10) → cắt bài 0-9

8. NewsController trả về:
   ResponseEntity.ok(ApiResponse.success({
     "news": [10 bài],
     "pagination": { "page": 1, "limit": 10, "total": 50, "pages": 5, "hasNext": true }
   }))

9. API Gateway nhận response 200, forward về Browser

10. React nhận JSON, render danh sách tin tức lên UI
```

### Lần request tiếp theo (cache warm):

Bước 5 → 6 bị bỏ qua hoàn toàn. Guava Cache trả về danh sách từ bộ nhớ trong ~1ms. Không gọi CryptoCompare.

---

## 15. Tích hợp với hệ thống SOA

### 15.1. Service Discovery với Consul

Khi News Service start:
```
News Service → đăng ký với Consul:
  {
    "name": "news-service",
    "address": "192.168.1.85",
    "port": 3006,
    "checks": [{ "http": "http://192.168.1.85:3006/news/health", "interval": "10s" }]
  }
```

API Gateway hỏi Consul:
```
Gateway → Consul: "cho tôi địa chỉ của news-service"
Consul → Gateway: "http://192.168.1.85:3006"
Gateway → forward request đến news-service
```

**Lợi ích:** News Service có thể chạy ở bất kỳ IP nào, Gateway tự tìm. Không hardcode IP.

### 15.2. Tại sao health-check-path là `/news/health` chứ không phải `/health`?

Spring Boot với `@RequestMapping("/news")` ở controller nghĩa là **mọi endpoint đều có prefix `/news`**. Vậy health endpoint thực tế là `/news/health`.

Nếu cấu hình Consul `health-check-path: /health`, Consul sẽ gọi `http://localhost:3006/health` → Spring không có route này → 404 → Consul nghĩ service chết → deregister.

Fix: `health-check-path: /news/health` → Consul gọi đúng endpoint.

### 15.3. Gateway Path Rewrite

```
Frontend gọi:  /api/news/trending?limit=8
                    ↓
Gateway strip: "/api"  →  /news/trending?limit=8
                    ↓
Spring nhận:   /news/trending?limit=8  ✅ (match @RequestMapping("/news") + @GetMapping("/trending"))
```

Nếu Gateway strip `/api/news` (như cách thông thường với các service Node.js), Spring nhận `/trending` → không match → 404. Đó là lý do gateway có logic rewrite riêng cho news-service.

### 15.4. Internal Service Key Pattern

Notification Service cần check giá Bitcoin mỗi phút để trigger price alert. Nó gọi:

```
Notification Service → Gateway /api/market/prices
Header: X-Internal-Service-Key: cryptotrading-internal-svc-key-2026
```

Gateway nhận header này, bypass JWT auth (vì đây là internal call, không có user JWT), forward đến Market Service. Đây gọi là **Service-to-Service Authentication** — giữ Gateway là trung tâm, không có service nào gọi trực tiếp sang service khác.

---

## 16. Những vấn đề đã gặp và cách fix

### Vấn đề 1: `No static resource health.`

**Triệu chứng:** Log Spring spam `No static resource health.` mỗi 10 giây

**Nguyên nhân:** Consul gọi `http://localhost:3006/health` nhưng Spring Boot với `@RequestMapping("/news")` chỉ có route `/news/health`.

**Fix:** Sửa `application.yml`:
```yaml
# Trước (sai):
health-check-path: /health

# Sau (đúng):
health-check-path: /news/health
```

---

### Vấn đề 2: Frontend nhận 404 khi gọi `/api/news/trending`

**Nguyên nhân:** Gateway dùng rewrite chung `path.replace('/api/news', '')` → Spring nhận `/trending` → không có route.

**Fix:** Tạo `newsProxy` riêng chỉ strip `/api` (không strip `/news`):
```javascript
pathRewrite: (path) => path.replace('/api', '')
// /api/news/trending → /news/trending ✅
```

---

### Vấn đề 3: Notification Service bị 401 khi check giá

**Nguyên nhân:** `priceAlertChecker.js` gọi `/api/market/prices` qua Gateway không có JWT token.

**Fix:** Thêm `internalOrAuth` middleware vào Gateway cho route `/api/market`, và Notification Service gửi `X-Internal-Service-Key` header.

---

### Vấn đề 4: `published_on` parse lỗi

**Nguyên nhân:** CryptoCompare trả `published_on: 1743700800` (Unix epoch) thay vì ISO date string.

**Fix:**
```java
if (publishedAtStr.matches("^\\d+$")) {
    publishedAt = LocalDateTime.ofEpochSecond(Long.parseLong(publishedAtStr), 0, ZoneOffset.UTC);
}
```

---

## Tóm tắt kiến trúc Spring Boot qua News Service

```
@SpringBootApplication
├── @Configuration → AppConfig (ObjectMapper, RestTemplate)
├── @Component → SentimentAnalyzer, CryptoCompareProvider
├── @Service → NewsService, NewsFetchScheduler
├── @RestController → NewsController
└── @RestControllerAdvice → GlobalExceptionHandler

Annotations quan trọng:
- @Autowired        → Dependency Injection (Spring tự inject)
- @Value            → Đọc config từ application.yml / biến môi trường
- @PostConstruct    → Chạy sau khi Bean được tạo xong
- @Scheduled        → Chạy định kỳ (cần @EnableScheduling ở main class)
- @GetMapping       → Map HTTP GET request vào method
- @ExceptionHandler → Bắt exception và trả về response phù hợp
- @Builder (Lombok) → Pattern Builder để tạo object
```
