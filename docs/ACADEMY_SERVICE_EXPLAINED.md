# 🎓 Academy Service — Giải thích toàn diện

> **Mục tiêu của tài liệu này:** Giúp bạn hiểu rõ *tại sao* và *như thế nào* Academy Service được xây dựng bằng Spring Boot + MySQL + YouTube Data API v3, từ kiến trúc tổng thể đến từng dòng code nghiệp vụ.

---

## Mục lục

1. [Tổng quan chức năng](#1-tổng-quan-chức-năng)
2. [Sơ đồ kiến trúc tổng thể](#2-sơ-đồ-kiến-trúc-tổng-thể)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Điểm khởi đầu — AcademyServiceApplication.java](#4-điểm-khởi-đầu--academyserviceapplicationjava)
5. [Cấu hình — application.yml](#5-cấu-hình--applicationyml)
6. [Dependency — pom.xml](#6-dependency--pomxml)
7. [Model — Dữ liệu được tổ chức như thế nào?](#7-model--dữ-liệu-được-tổ-chức-như-thế-nào)
8. [Repository — Giao tiếp với MySQL](#8-repository--giao-tiếp-với-mysql)
9. [YouTubeProvider — Lấy metadata từ YouTube API v3](#9-youtubeprovider--lấy-metadata-từ-youtube-api-v3)
10. [AcademyService — Trái tim xử lý nghiệp vụ](#10-academyservice--trái-tim-xử-lý-nghiệp-vụ)
11. [AcademyController — Cổng giao tiếp HTTP](#11-academycontroller--cổng-giao-tiếp-http)
12. [AppConfig — Cấu hình Bean chung](#12-appconfig--cấu-hình-bean-chung)
13. [Exception Handling — Xử lý lỗi thống nhất](#13-exception-handling--xử-lý-lỗi-thống-nhất)
14. [Luồng request đầy đủ](#14-luồng-request-đầy-đủ)
15. [Tích hợp với hệ thống SOA](#15-tích-hợp-với-hệ-thống-soa)
16. [Frontend — Academy.jsx](#16-frontend--academyjsx)
17. [Những vấn đề đã gặp và cách fix](#17-những-vấn-đề-đã-gặp-và-cách-fix)
18. [Tóm tắt kiến trúc](#18-tóm-tắt-kiến-trúc)

---

## 1. Tổng quan chức năng

Academy Service cung cấp tính năng **học tập crypto** cho người dùng CryptoTrading SOA. Thay vì chỉ xây một trang danh sách video đơn giản, service này được thiết kế theo mô hình **hybrid data** — kết hợp hai nguồn dữ liệu:

| Nguồn | Dữ liệu | Lý do |
|-------|---------|-------|
| **MySQL (DB)** | videoId, category, difficulty, sort_order | Admin kiểm soát: quyết định video nào xuất hiện, thuộc chủ đề nào, độ khó nào |
| **YouTube Data API v3** | title, thumbnail, duration, viewCount, likeCount, channelTitle | Metadata live: luôn mới nhất, không cần cập nhật thủ công |

**Ý tưởng cốt lõi:** Admin chỉ cần thêm một hàng vào DB (`videoId`, `category`, `difficulty`) — service tự động gọi YouTube API để lấy thumbnail, duration, tên kênh, số lượt xem. Admin không bao giờ phải copy-paste tiêu đề hay tải ảnh lên.

**Tính năng:**
- Xem danh sách video học tập với thumbnail, duration badge, số lượt xem
- Lọc theo **category**: TRADING, BLOCKCHAIN, DEFI, ALTCOINS, SECURITY
- Lọc theo **difficulty**: BEGINNER (Cơ bản), INTERMEDIATE (Trung cấp), ADVANCED (Nâng cao)
- Phân trang (pagination)
- Xem video trong modal iframe nhúng trực tiếp (autoplay)
- Cache 24 giờ — không gọi YouTube API liên tục

---

## 2. Sơ đồ kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│                   http://localhost:5173/academy                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │ GET /api/academy/courses?category=TRADING
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                     API GATEWAY :3000                            │
│                                                                  │
│  academyProxy: strip "/api" → forward to academy-service        │
│  /api/academy/courses → /academy/courses                        │
│  (Consul Service Discovery tìm địa chỉ academy-service)         │
└──────────────────────────┬───────────────────────────────────────┘
                           │ GET /academy/courses?category=TRADING
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│            ACADEMY SERVICE :3007 (Spring Boot)                   │
│                                                                  │
│  ┌──────────────────┐   ┌──────────────────┐                    │
│  │ AcademyController│──▶│  AcademyService  │                    │
│  │ /academy/*       │   │ (Business Logic) │                    │
│  └──────────────────┘   └────────┬─────────┘                    │
│                                  │                               │
│                    ┌─────────────┴──────────────┐               │
│                    │                            │               │
│           ┌────────▼────────┐        ┌──────────▼────────┐     │
│           │ CourseRepository│        │  YouTubeProvider  │     │
│           │ (Spring Data JPA│        │  (Guava Cache     │     │
│           │  → MySQL)       │        │   TTL 24h)        │     │
│           └────────┬────────┘        └──────────┬────────┘     │
│                    │                            │               │
└────────────────────┼────────────────────────────┼───────────────┘
                     │                            │
         ┌───────────▼──────────┐    ┌────────────▼─────────────┐
         │   MySQL :3306        │    │  YouTube Data API v3      │
         │   crypto_academy     │    │  googleapis.com/youtube   │
         │   table: courses     │    │  /playlistItems + /videos │
         └──────────────────────┘    └──────────────────────────┘
```

**Luồng merge dữ liệu:**
```
MySQL row: { videoId: "EoFWcSKRMyg", category: "TRADING", difficulty: "BEGINNER" }
                    +
YouTube API: { title: "Kiến Thức Crypto Bài 1", thumbnail: "...", duration: "PT7M25S", viewCount: "25700" }
                    ↓
CourseDto: { videoId, category, difficulty, title, thumbnail, durationFormatted: "7:25", viewCount: "25.7K", embedUrl, ... }
```

---

## 3. Cấu trúc thư mục

```
academy-service/
├── pom.xml                              # Maven build (Java 21, Spring Boot 3.2.4)
├── src/main/
│   ├── java/com/cryptotrading/academy/
│   │   ├── AcademyServiceApplication.java   # ← Điểm khởi động Spring Boot
│   │   ├── config/
│   │   │   └── AppConfig.java               # ← ObjectMapper, CORS config
│   │   ├── controller/
│   │   │   └── AcademyController.java       # ← HTTP endpoints
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java  # ← Bắt lỗi toàn cục
│   │   │   └── ResourceNotFoundException.java
│   │   ├── model/
│   │   │   ├── Course.java                  # ← JPA Entity (ánh xạ bảng courses)
│   │   │   ├── CourseDto.java               # ← DTO trả về frontend (merged data)
│   │   │   ├── YouTubeResponse.java         # ← Ánh xạ JSON từ YouTube API
│   │   │   ├── ApiResponse.java             # ← Format response chuẩn
│   │   │   └── PageResponse.java            # ← Response có phân trang
│   │   ├── provider/
│   │   │   └── YouTubeProvider.java         # ← Gọi YouTube API, quản lý cache
│   │   ├── repository/
│   │   │   └── CourseRepository.java        # ← Spring Data JPA queries
│   │   └── service/
│   │       └── AcademyService.java          # ← Business logic, merge DB + YouTube
│   └── resources/
│       └── application.yml                  # ← Cấu hình port, DB, YouTube keys
└── target/
    └── academy-service-1.0.0.jar            # ← File chạy được sau mvn package
```

> **Quy tắc vàng Spring Boot:** Mỗi class có đúng một trách nhiệm. Controller nhận request, Service xử lý logic, Repository nói chuyện với DB, Provider nói chuyện với API ngoài. Không ai làm hết mọi thứ.

---

## 4. Điểm khởi đầu — AcademyServiceApplication.java

```java
@SpringBootApplication    // ← Tổ hợp 3 annotations: @Configuration + @EnableAutoConfiguration + @ComponentScan
@EnableDiscoveryClient    // ← Đăng ký service với Consul (Service Discovery)
@EnableScheduling         // ← Bật tính năng chạy tác vụ định kỳ (không dùng ở đây nhưng sẵn sàng)
public class AcademyServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AcademyServiceApplication.class, args);
    }
}
```

**`@SpringBootApplication` làm gì?**

Spring Boot scan toàn bộ package `com.cryptotrading.academy`, tìm mọi class có `@Component`, `@Service`, `@Controller`, `@Repository` và tự động:
- Tạo object (Bean) từ các class đó
- Inject chúng vào nhau theo `@Autowired` / constructor injection
- Cấu hình Tomcat embedded (web server tích hợp sẵn, không cần cài Tomcat riêng)
- Cấu hình Spring Data JPA (kết nối MySQL)

**`@EnableDiscoveryClient`** — Khi service start, nó tự đăng ký với Consul:
```
"Xin chào Consul, tôi là academy-service, đang chạy tại 192.168.1.85:3007.
Health check của tôi là GET /academy/health mỗi 10 giây."
```
API Gateway hỏi Consul để biết academy-service đang ở đâu — không cần hardcode IP.

---

## 5. Cấu hình — application.yml

```yaml
server:
  port: 3007           # ← Academy Service chạy ở cổng này

spring:
  application:
    name: academy-service   # ← Tên đăng ký với Consul

  datasource:
    # Kết nối MySQL với đầy đủ charset UTF-8 (quan trọng cho tiếng Việt!)
    url: jdbc:mysql://localhost:3306/crypto_academy?useSSL=false
         &serverTimezone=UTC
         &allowPublicKeyRetrieval=true
         &useUnicode=true        # ← Bật Unicode
         &characterEncoding=UTF-8  # ← Mã hóa UTF-8
    username: ${DB_USERNAME:root}   # ← Đọc từ env, mặc định "root"
    password: ${DB_PASSWORD:}       # ← Đọc từ env, mặc định rỗng

  jpa:
    hibernate:
      ddl-auto: update   # ← Tự tạo/cập nhật bảng khi start (không xóa data)

  cloud:
    consul:
      discovery:
        health-check-path: /academy/health   # ← Consul gọi đây để kiểm tra sức khỏe
        health-check-interval: 10s
        fail-fast: false   # ← Không crash nếu Consul chưa sẵn sàng khi start
      config:
        enabled: false     # ← Không dùng Consul Config (dùng application.yml thay thế)

youtube:
  api-key: ${YOUTUBE_API_KEY:your-youtube-api-key-here}
  playlist-id: ${YOUTUBE_PLAYLIST_ID:PLmkMeQXrAX47_ZwxjoPXDAqanx4-ady6O}
  base-url: https://www.googleapis.com/youtube/v3
  cache-ttl-hours: 24    # ← Cache YouTube data 24 giờ
```

**Tại sao `ddl-auto: update` thay vì `create`?**

- `create` → Mỗi lần restart xóa sạch toàn bộ bảng và tạo lại → **MẤT DATA**
- `validate` → Chỉ kiểm tra schema, không thay đổi → bảng phải tồn tại trước
- `update` → Tạo bảng nếu chưa có, thêm cột nếu model thay đổi, **không xóa data cũ** ✅

**Tại sao API key hardcode làm default?**

Đây là trade-off trong môi trường dev. Cú pháp `${YOUTUBE_API_KEY:your-key-here}` có nghĩa:
- Nếu biến môi trường `YOUTUBE_API_KEY` tồn tại → dùng giá trị đó (production)
- Nếu không → dùng giá trị sau dấu `:` (dev, mặc định)

Khi deploy production, chỉ cần set biến môi trường, không cần sửa code.

---

## 6. Dependency — pom.xml

Các dependency quan trọng trong `pom.xml`:

| Dependency | Tác dụng |
|-----------|---------|
| `spring-boot-starter-web` | Nhúng Tomcat, tạo REST API với `@RestController` |
| `spring-boot-starter-data-jpa` | ORM: ánh xạ Java class → MySQL table, tự tạo SQL |
| `spring-boot-starter-actuator` | Endpoint `/actuator/health`, `/actuator/metrics` (Consul dùng) |
| `mysql-connector-j` | JDBC driver kết nối MySQL |
| `spring-cloud-starter-consul-discovery` | Đăng ký/khám phá service qua Consul |
| `guava` (Google) | `CacheBuilder` — cache in-memory mạnh mẽ |
| `lombok` | Generate boilerplate: getter, setter, builder, constructor |
| `jackson-datatype-jsr310` | Serialize `LocalDateTime` sang JSON dạng ISO string |

**Tại sao cần Guava Cache thay vì tự viết?**

Tự viết cache đơn giản (`HashMap`) không có:
- TTL (time-to-live) tự động expire
- Thread-safe cho môi trường concurrent
- Giới hạn kích thước
- Thống kê hit/miss rate

Guava Cache giải quyết tất cả với 5 dòng code.

---

## 7. Model — Dữ liệu được tổ chức như thế nào?

### 7.1. Course.java — JPA Entity (ánh xạ bảng MySQL)

```java
@Entity            // ← Spring Data JPA biết class này ánh xạ tới 1 bảng trong DB
@Table(name = "courses")  // ← Tên bảng trong MySQL
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // ← AUTO_INCREMENT
    private Long id;

    @Column(name = "video_id", nullable = false, unique = true, length = 50)
    private String videoId;   // Ví dụ: "EoFWcSKRMyg"

    @Column(nullable = false, length = 500)
    private String title;     // Có thể để trống → service fallback sang YouTube title

    @Enumerated(EnumType.STRING)  // ← Lưu dạng chuỗi "BEGINNER" thay vì số 0,1,2
    @Column(nullable = false)
    private Difficulty difficulty;  // BEGINNER | INTERMEDIATE | ADVANCED

    @Column(nullable = false)
    private String category;  // "TRADING" | "BLOCKCHAIN" | "DEFI" | "ALTCOINS" | "SECURITY"

    @Column(columnDefinition = "TEXT")
    private String description;   // Mô tả, có thể null → fallback YouTube description

    @Column(name = "sort_order")
    private Integer sortOrder;    // Thứ tự hiển thị

    @PrePersist   // ← Hook: chạy tự động trước khi INSERT
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate    // ← Hook: chạy tự động trước khi UPDATE
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Difficulty { BEGINNER, INTERMEDIATE, ADVANCED }
}
```

**`@Enumerated(EnumType.STRING)` quan trọng như thế nào?**

Nếu dùng `EnumType.ORDINAL` (mặc định), MySQL lưu số: BEGINNER=0, INTERMEDIATE=1, ADVANCED=2. Nếu sau này thêm enum value vào giữa list, toàn bộ data cũ sẽ sai. `EnumType.STRING` lưu chính tên enum → an toàn khi thay đổi.

**`@PrePersist` và `@PreUpdate`** — JPA lifecycle hooks. Không cần gọi thủ công `setCreatedAt(LocalDateTime.now())` mỗi khi tạo object. JPA tự gọi method này trước khi INSERT/UPDATE.

---

### 7.2. CourseDto.java — DTO trả về frontend

DTO (Data Transfer Object) là object chuyên dùng để trả về API response. **Khác với Entity** (ánh xạ 1-1 với DB), DTO chứa dữ liệu tổng hợp từ nhiều nguồn:

```java
@JsonInclude(JsonInclude.Include.NON_NULL)  // ← Field nào null → không xuất hiện trong JSON
public class CourseDto {

    // ── Từ DB (Course entity) ────────────────────────────────────────
    private Long id;
    private String videoId;      // "EoFWcSKRMyg"
    private String title;        // Có thể từ DB hoặc YouTube (xem merge logic)
    private String difficulty;   // "BEGINNER"
    private String category;     // "TRADING"
    private String description;
    private Integer sortOrder;

    // ── Từ YouTube API ───────────────────────────────────────────────
    private String thumbnailUrl;        // URL ảnh thumbnail HD
    private String duration;            // "PT7M25S" (ISO 8601)
    private String durationFormatted;   // "7:25" (human-readable)
    private String viewCount;           // "25700"
    private String likeCount;           // "250"
    private String publishedAt;         // "2024-03-15T10:00:00Z"
    private String channelTitle;        // "Thời Báo Tài Chính"

    // ── Tính toán ────────────────────────────────────────────────────
    private String embedUrl;   // "https://www.youtube.com/embed/EoFWcSKRMyg"
    private String watchUrl;   // "https://www.youtube.com/watch?v=EoFWcSKRMyg"
}
```

**Tại sao không trả thẳng `Course` entity ra API?**

1. Entity có `createdAt`, `updatedAt` — frontend không cần
2. Entity không có `thumbnailUrl`, `durationFormatted` — những thứ frontend cần
3. Trả Entity ra API = lộ cấu trúc DB nội bộ → bad practice về security
4. `@JsonInclude(NON_NULL)` trên DTO tránh trả về `{ "thumbnailUrl": null }` gây JSON rác

---

### 7.3. YouTubeResponse.java — Ánh xạ JSON từ YouTube API

YouTube Data API v3 trả về JSON phức tạp. Class này là "bản đồ" cho Jackson biết cách parse:

```java
// YouTube trả về dạng:
// {
//   "items": [{
//     "snippet": {
//       "resourceId": { "videoId": "EoFWcSKRMyg" },
//       "title": "...",
//       "thumbnails": { "maxres": { "url": "..." }, "high": { "url": "..." } }
//     }
//   }],
//   "nextPageToken": "abc123"   ← dùng để phân trang playlist
// }

public class YouTubeResponse {

    public static class PlaylistItemsResponse {
        private String nextPageToken;         // null nếu là trang cuối
        private List<PlaylistItem> items;
    }

    public static class Snippet {
        private ResourceId resourceId;        // chứa videoId thực sự
        private Thumbnails thumbnails;        // nhiều kích thước ảnh
    }

    @JsonProperty("videoId")   // ← Jackson map field "videoId" trong JSON vào field Java này
    private String videoId;
}
```

**`@JsonProperty("videoId")` để làm gì?**

YouTube trả về JSON với key `"videoId"` (camelCase). Khi Jackson deserialize, nó tìm field Java có tên `videoId`. Nếu tên Java khác (ví dụ: `video_id`), dùng `@JsonProperty("videoId")` để chỉ định mapping.

---

### 7.4. ApiResponse.java và PageResponse.java

**ApiResponse** — Format JSON chuẩn cho mọi endpoint:

```json
// Thành công:
{
  "success": true,
  "message": "Courses fetched successfully",
  "data": { ... },
  "timestamp": "2026-04-03T23:32:39"
}

// Lỗi:
{
  "success": false,
  "message": "Course not found: abc123",
  "timestamp": "2026-04-03T23:32:39"
}
```

**PageResponse** — Bao bọc danh sách có phân trang:

```json
{
  "content": [ ...5 courses... ],
  "page": 0,
  "size": 12,
  "totalElements": 5,
  "totalPages": 1,
  "last": true
}
```

`PageResponse.from(Page<T> page)` là static factory method — nhận `Page` từ Spring Data JPA và convert sang format JSON thân thiện:

```java
public static <T> PageResponse<T> from(Page<T> page) {
    return PageResponse.<T>builder()
            .content(page.getContent())      // List các item trong trang này
            .page(page.getNumber())          // Số trang hiện tại (0-based)
            .totalElements(page.getTotalElements())  // Tổng số item
            .totalPages(page.getTotalPages())
            .last(page.isLast())
            .build();
}
```

---

## 8. Repository — Giao tiếp với MySQL

```java
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    Optional<Course> findByVideoId(String videoId);

    Page<Course> findByCategory(String category, Pageable pageable);

    Page<Course> findByDifficulty(Difficulty difficulty, Pageable pageable);

    Page<Course> findByCategoryAndDifficulty(String category, Difficulty difficulty, Pageable pageable);
}
```

**Đây là interface, không phải class. Ai implement nó?**

Spring Data JPA tự động tạo một class implementation lúc runtime — bạn không cần viết SQL hay implement. Tên method theo convention `findBy[Field][And|Or][Field]` → Spring parse tên method và tạo câu SQL tương ứng:

| Method | SQL được tạo |
|--------|-------------|
| `findByVideoId(String id)` | `SELECT * FROM courses WHERE video_id = ?` |
| `findByCategory(String cat, Pageable p)` | `SELECT * FROM courses WHERE category = ? ORDER BY ? LIMIT ? OFFSET ?` |
| `findByCategoryAndDifficulty(...)` | `SELECT * FROM courses WHERE category = ? AND difficulty = ?` |

`Pageable` là object chứa `page`, `size`, `sort` — Spring Data tự thêm `LIMIT`, `OFFSET`, `ORDER BY` vào SQL.

**`JpaRepository<Course, Long>`** — `Long` là kiểu dữ liệu của primary key (id). Kế thừa từ interface này, repository tự có sẵn: `findAll()`, `findById()`, `save()`, `deleteById()`, `count()`, v.v.

---

## 9. YouTubeProvider — Lấy metadata từ YouTube API v3

Đây là class phức tạp nhất. Nó thực hiện toàn bộ giao tiếp với YouTube.

### 9.1. Hai bước gọi API

Để lấy thông tin đầy đủ một playlist, cần **2 bước API** (YouTube không cho lấy tất cả trong 1 call):

```
Bước 1: playlistItems.list
  → Truyền vào: playlistId
  → Nhận về: danh sách videoId (không có metadata)
  
Bước 2: videos.list
  → Truyền vào: danh sách videoId (tối đa 50 mỗi request)
  → Nhận về: snippet (title, thumbnail) + contentDetails (duration) + statistics (viewCount, likeCount)
```

**Tại sao cần 2 bước?** YouTube API tách riêng vì lý do hiệu suất và quota. Nếu playlist có 200 video, `playlistItems.list` chỉ trả về array 200 `videoId` (nhẹ), sau đó `videos.list` fetch detail 200 video đó theo batch.

### 9.2. Pagination của playlist

Playlist có thể có nhiều trang (YouTube giới hạn 50 video/request). Code xử lý bằng vòng lặp `do-while`:

```java
private List<String> fetchAllVideoIdsFromPlaylist() throws Exception {
    List<String> ids = new ArrayList<>();
    String pageToken = null;  // null = trang đầu tiên

    do {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromHttpUrl(baseUrl + "/playlistItems")
                .queryParam("part", "snippet")
                .queryParam("playlistId", playlistId)
                .queryParam("maxResults", 50)   // Max 50 mỗi request
                .queryParam("key", apiKey);

        // Nếu có pageToken → thêm vào URL để lấy trang tiếp
        if (pageToken != null) builder.queryParam("pageToken", pageToken);

        String body = get(builder.build().toUriString());
        YouTubeResponse.PlaylistItemsResponse response = objectMapper.readValue(body, ...);

        // Thu thập videoId từ mỗi item
        response.getItems().forEach(item -> {
            String vid = item.getSnippet().getResourceId().getVideoId();
            ids.add(vid);
        });

        // Chuyển sang trang tiếp nếu còn
        pageToken = response.getNextPageToken();

    } while (pageToken != null);  // Dừng khi trang cuối (không có nextPageToken)

    return ids;
}
```

**`UriComponentsBuilder`** — Builder pattern để tạo URL an toàn. Thay vì nối chuỗi (`"?key=" + apiKey` — nguy hiểm nếu apiKey có ký tự đặc biệt), builder tự encode đúng.

### 9.3. Batch fetch video details

```java
private Map<String, CourseDto> fetchVideoDetails(List<String> videoIds) throws Exception {
    Map<String, CourseDto> result = new HashMap<>();

    // Chia thành batch tối đa 50 video
    int batchSize = 50;
    for (int i = 0; i < videoIds.size(); i += batchSize) {
        List<String> batch = videoIds.subList(i, Math.min(i + batchSize, videoIds.size()));
        String ids = String.join(",", batch);  // "EoFWcSKRMyg,vv0fl7x3QzQ,..."

        String url = UriComponentsBuilder
                .fromHttpUrl(baseUrl + "/videos")
                .queryParam("part", "snippet,contentDetails,statistics")
                .queryParam("id", ids)             // Nhiều video cùng lúc
                .queryParam("key", apiKey)
                .build().toUriString();

        String body = get(url);
        // Parse JSON → map mỗi videoId → CourseDto
        response.getItems().forEach(item -> {
            CourseDto dto = mapVideoItem(item);
            result.put(item.getId(), dto);       // Key = videoId
        });
    }
    return result;
}
```

Kết quả: `Map<String, CourseDto>` — tra cứu O(1) theo videoId, dùng để merge với DB data.

### 9.4. Chọn thumbnail tốt nhất

YouTube cung cấp nhiều kích thước thumbnail. Code chọn theo độ ưu tiên:

```java
if (thumbs.getMaxres() != null) thumbnail = thumbs.getMaxres().getUrl();  // 1280x720 ✅ ưu tiên 1
else if (thumbs.getHigh() != null)   thumbnail = thumbs.getHigh().getUrl();   // 480x360
else if (thumbs.getMedium() != null) thumbnail = thumbs.getMedium().getUrl(); // 320x180
```

`maxres` là chất lượng cao nhất (1280x720), chỉ có ở video được upload HD. Nếu không có → fallback xuống `high` → `medium`. Frontend còn có thêm fallback URL cứng: `https://img.youtube.com/vi/{videoId}/hqdefault.jpg` phòng khi tất cả đều null.

### 9.5. Parse duration ISO 8601

YouTube trả về duration dạng ISO 8601: `"PT1H2M34S"` (1 giờ 2 phút 34 giây), `"PT7M25S"` (7 phút 25 giây).

```java
private static final Pattern DURATION_PATTERN =
        Pattern.compile("PT(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+)S)?");
        //              └──────────────────────────────────────────┘
        //         Regex: "PT" + optional hours + optional minutes + optional seconds

private String formatDuration(String iso) {
    Matcher m = DURATION_PATTERN.matcher(iso);   // "PT7M25S"
    int hours   = m.group(1) != null ? Integer.parseInt(m.group(1)) : 0;  // null (không có H)
    int minutes = m.group(2) != null ? Integer.parseInt(m.group(2)) : 7;  // "7"
    int seconds = m.group(3) != null ? Integer.parseInt(m.group(3)) : 25; // "25"

    if (hours > 0) return String.format("%d:%02d:%02d", hours, minutes, seconds);
    return String.format("%d:%02d", minutes, seconds);  // → "7:25"
}
```

`%02d` nghĩa là in số nguyên với ít nhất 2 chữ số, pad bằng 0 nếu cần: 5 → "05", 10 → "10".

### 9.6. Guava Cache — Tránh gọi YouTube API liên tục

```java
private Cache<String, Map<String, CourseDto>> videoCache;

private Cache<String, Map<String, CourseDto>> getCache() {
    if (videoCache == null) {  // ← Lazy init: chỉ tạo cache khi lần đầu cần dùng
        videoCache = CacheBuilder.newBuilder()
                .maximumSize(1000)                              // Tối đa 1000 entry
                .expireAfterWrite(cacheTtlHours, TimeUnit.HOURS) // Expire sau 24h
                .build();
    }
    return videoCache;
}

public Map<String, CourseDto> fetchPlaylistVideos() {
    // Kiểm tra cache trước
    Map<String, CourseDto> cached = getCache().getIfPresent(PLAYLIST_CACHE_KEY);
    if (cached != null) {
        log.debug("Cache hit — {} videos", cached.size());
        return cached;   // ← Trả về ngay, ~1ms
    }

    // Cache miss → gọi YouTube API (chậm ~500-1000ms)
    List<String> videoIds = fetchAllVideoIdsFromPlaylist();
    Map<String, CourseDto> details = fetchVideoDetails(videoIds);
    getCache().put(PLAYLIST_CACHE_KEY, details);   // ← Lưu vào cache
    return details;
}
```

**Tại sao Lazy init thay vì `@PostConstruct`?**

`@Value` fields (như `cacheTtlHours`) được inject SAU khi constructor chạy. Nếu tạo cache trong constructor, `cacheTtlHours` vẫn là 0 (giá trị mặc định, chưa inject). Lazy init trong `getCache()` đảm bảo cache chỉ được tạo khi method đầu tiên được gọi — lúc đó `@Value` đã inject xong.

### 9.7. HTTP Client — Java 11 HttpClient

Thay vì dùng `RestTemplate` (của Spring), YouTubeProvider dùng `java.net.http.HttpClient` (có sẵn từ Java 11):

```java
this.httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))  // Timeout kết nối
        .build();

private String get(String url) throws Exception {
    HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .GET()
            .timeout(Duration.ofSeconds(15))  // Timeout đọc response
            .build();

    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

    if (response.statusCode() != 200) {
        throw new RuntimeException("YouTube API returned HTTP " + response.statusCode());
    }
    return response.body();
}
```

**Tại sao check `statusCode() != 200`?**

`HttpClient` không tự throw exception khi 4xx/5xx (khác `RestTemplate`). Phải check thủ công. Nếu không check, code sẽ cố parse response lỗi (ví dụ HTML error page) thành `YouTubeResponse` → crash với `JsonParseException` khó debug.

---

## 10. AcademyService — Trái tim xử lý nghiệp vụ

### 10.1. Lọc và phân trang từ DB

```java
public PageResponse<CourseDto> getCourses(String category, String difficultyStr, int page, int size) {
    // Chuẩn bị: sắp xếp theo sortOrder rồi id, phân trang
    Pageable pageable = PageRequest.of(page, size, Sort.by("sortOrder", "id").ascending());

    // Parse difficulty string → enum (null nếu không hợp lệ)
    Difficulty difficulty = parseDifficulty(difficultyStr);

    // Chọn query phù hợp dựa trên filter được truyền vào
    Page<Course> coursePage;
    if (category != null && difficulty != null) {
        coursePage = courseRepository.findByCategoryAndDifficulty(category, difficulty, pageable);
    } else if (category != null) {
        coursePage = courseRepository.findByCategory(category, pageable);
    } else if (difficulty != null) {
        coursePage = courseRepository.findByDifficulty(difficulty, pageable);
    } else {
        coursePage = courseRepository.findAll(pageable);  // Không lọc
    }

    // Lấy YouTube metadata (từ cache hoặc API)
    Map<String, CourseDto> ytData = youTubeProvider.fetchPlaylistVideos();

    // Merge từng Course entity với YouTube data tương ứng
    Page<CourseDto> dtoPage = coursePage.map(course -> merge(course, ytData.get(course.getVideoId())));
    return PageResponse.from(dtoPage);
}
```

**Tại sao lọc ở DB thay vì lấy hết rồi lọc ở Java?**

Lọc ở DB (bằng `WHERE` clause trong SQL) hiệu quả hơn nhiều:
- Giả sử có 10,000 video → lọc TRADING ở Java cần load 10,000 row vào RAM → chậm, tốn bộ nhớ
- Lọc ở DB: MySQL chỉ trả về 2,000 row TRADING → Java nhận ít hơn → nhanh hơn

### 10.2. Merge logic — DB title ưu tiên hơn YouTube title

```java
private CourseDto merge(Course course, CourseDto yt) {
    CourseDto.CourseDtoBuilder builder = CourseDto.builder()
            .id(course.getId())
            .videoId(course.getVideoId())
            .title(course.getTitle())         // ← Dùng DB title trước
            .difficulty(course.getDifficulty().name())
            .category(course.getCategory())
            // ... các field từ DB

    if (yt != null) {
        // Override title nếu DB title null hoặc rỗng
        if (course.getTitle() == null || course.getTitle().isBlank()) {
            builder.title(yt.getTitle());     // ← Fallback sang YouTube title
        }
        // Override description tương tự
        if (course.getDescription() == null || course.getDescription().isBlank()) {
            builder.description(yt.getDescription());
        }
        // YouTube fields: luôn dùng từ YouTube (DB không lưu những thứ này)
        builder.thumbnailUrl(yt.getThumbnailUrl())
               .duration(yt.getDuration())
               .durationFormatted(yt.getDurationFormatted())
               .viewCount(yt.getViewCount())
               .likeCount(yt.getLikeCount())
               .channelTitle(yt.getChannelTitle());
    }

    return builder.build();
}
```

**Ưu tiên merge:**
```
Title:       DB title (nếu không rỗng) > YouTube title > null
Description: DB description (nếu không rỗng) > YouTube description > null
Thumbnail:   Luôn từ YouTube (DB không lưu)
viewCount:   Luôn từ YouTube (live data, DB không lưu)
```

Khi DB title được set rỗng (`""`), service tự động dùng YouTube title — đây là cơ chế fix lỗi encoding tiếng Việt (xem mục 17).

### 10.3. parseDifficulty — Xử lý input sai an toàn

```java
private Difficulty parseDifficulty(String value) {
    if (value == null || value.isBlank()) return null;  // Không lọc
    try {
        return Difficulty.valueOf(value.toUpperCase());  // "beginner" → BEGINNER
    } catch (IllegalArgumentException e) {
        log.warn("Unknown difficulty '{}' — ignoring filter.", value);
        return null;   // Request với ?difficulty=INVALID → bỏ qua, không báo lỗi
    }
}
```

Thay vì throw exception khi user truyền `?difficulty=INVALID`, service bỏ qua filter và trả về tất cả. **UX tốt hơn** — user không thấy lỗi vì một typo nhỏ.

---

## 11. AcademyController — Cổng giao tiếp HTTP

```java
@RestController          // ← Tự serialize return value thành JSON
@RequestMapping("/academy")  // ← Prefix cho mọi endpoint
@RequiredArgsConstructor     // ← Lombok: tạo constructor inject các final fields
@Slf4j                       // ← Lombok: tạo field `log` để dùng log.info(...)
public class AcademyController {
    private final AcademyService academyService;
    private final YouTubeProvider youTubeProvider;
```

**Constructor Injection vs `@Autowired` field injection:**

`@RequiredArgsConstructor` tạo constructor nhận `AcademyService` và `YouTubeProvider` làm tham số. Spring thấy constructor này → tự inject. Đây là **cách được khuyến nghị** thay vì `@Autowired` trên field vì:
- Dễ test (có thể mock bằng constructor)
- Field `final` → đảm bảo không bị gán lại sau khi inject
- Tường minh về dependency

### Endpoints

```java
// GET /academy/health — Consul health check
@GetMapping("/health")
public ResponseEntity<Map<String, Object>> health() {
    return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "academy-service",
            "version", "1.0.0",
            "timestamp", LocalDateTime.now().toString()
    ));
}

// GET /academy/courses?category=TRADING&difficulty=BEGINNER&page=0&size=12
@GetMapping("/courses")
public ResponseEntity<ApiResponse<PageResponse<CourseDto>>> getCourses(
        @RequestParam(required = false) String category,    // ← Không bắt buộc
        @RequestParam(required = false) String difficulty,
        @RequestParam(defaultValue = "0")  int page,       // ← Mặc định trang 0
        @RequestParam(defaultValue = "12") int size         // ← Mặc định 12/trang
) {
    size = Math.min(size, 50);  // ← Cap max 50 để tránh request lạm dụng
    log.info("[AcademyController] GET /courses — category={}, difficulty={}, page={}, size={}",
            category, difficulty, page, size);

    PageResponse<CourseDto> result = academyService.getCourses(category, difficulty, page, size);
    return ResponseEntity.ok(ApiResponse.success("Courses fetched successfully", result));
}

// GET /academy/courses/{videoId}
@GetMapping("/courses/{videoId}")
public ResponseEntity<ApiResponse<CourseDto>> getCourseByVideoId(@PathVariable String videoId) {
    log.info("[AcademyController] GET /courses/{}", videoId);
    CourseDto course = academyService.getCourseByVideoId(videoId);
    return ResponseEntity.ok(ApiResponse.success(course));
}

// GET /academy/debug/youtube — Endpoint debug tạm thời
@GetMapping("/debug/youtube")
public ResponseEntity<Map<String, Object>> debugYoutube() {
    // Kiểm tra API key có load đúng không
    // Thử gọi YouTube API trực tiếp và trả về raw response
    // Hữu ích khi debug tại sao YouTube không trả data
}
```

**Tại sao `@RequestParam(required = false)` thay vì bắt buộc?**

Nếu `required = true` (mặc định), request không truyền `?category=` sẽ bị 400 Bad Request. Nhưng muốn hỗ trợ cả 4 case: không lọc, lọc category, lọc difficulty, lọc cả hai. `required = false` → Spring inject `null` nếu không truyền.

---

## 12. AppConfig — Cấu hình Bean chung

```java
@Configuration
public class AppConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                // LocalDateTime → "2026-04-03T23:32:39" (ISO string), không phải [2026,4,3,23,32,39]
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                // ← Bug fix quan trọng! (xem mục 17)
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/academy/**")
                        .allowedOrigins("*")      // ← Cho phép mọi origin (dev)
                        .allowedMethods("GET")    // ← Chỉ GET (read-only API)
                        .allowedHeaders("*");
            }
        };
    }
}
```

**CORS là gì và tại sao cần?**

Browser có chính sách bảo mật: script từ `localhost:5173` (frontend) không được gọi API ở domain/port khác (`localhost:3007`) trừ khi server đó cho phép. Đây gọi là **Same-Origin Policy**.

`addCorsMappings` thêm header `Access-Control-Allow-Origin: *` vào response → browser cho phép frontend gọi API.

Trong thực tế, Academy Service không cần CORS vì frontend gọi qua Gateway (port 3000) — Gateway mới là người cần cho phép. Nhưng config này vẫn hữu ích khi test trực tiếp service mà không qua Gateway.

---

## 13. Exception Handling — Xử lý lỗi thống nhất

```java
@RestControllerAdvice   // ← Bắt exception từ mọi @RestController trong dự án
@Slf4j
public class GlobalExceptionHandler {

    // VideoId không tồn tại trong DB
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)   // 404
                .body(ApiResponse.error(ex.getMessage()));
    }

    // Logic nghiệp vụ sai (ví dụ: constraint violation)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)  // 400
                .body(ApiResponse.error(ex.getMessage()));
    }

    // ?page=abc (không phải số)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(...) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Invalid value for parameter: " + ex.getName()));
    }

    // Catch-all: bất kỳ exception nào khác
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)  // 500
                .body(ApiResponse.error("Internal server error"));
    }
}
```

**Luồng khi course không tồn tại:**

```
GET /academy/courses/nonexistent-id
    ↓
AcademyService.getCourseByVideoId("nonexistent-id")
    ↓
courseRepository.findByVideoId("nonexistent-id") → Optional.empty()
    ↓
throw new ResourceNotFoundException("Course not found: nonexistent-id")
    ↓
Spring tự động tìm @ExceptionHandler(ResourceNotFoundException.class)
    ↓
handleNotFound() chạy → HTTP 404 + JSON:
{
  "success": false,
  "message": "Course not found: nonexistent-id",
  "timestamp": "2026-04-03T23:32:39"
}
```

---

## 14. Luồng request đầy đủ

### Kịch bản: User mở trang Academy, chọn filter TRADING + BEGINNER

```
1. Browser request: GET http://localhost:5173/academy
   React app load Academy.jsx, useEffect() chạy khi component mount

2. React gọi: GET http://localhost:3000/api/academy/courses?category=TRADING&difficulty=BEGINNER&page=0&size=12
   (qua academyAPI.getCourses() trong frontend/src/services/api.js)

3. API Gateway nhận:
   - Middleware: xác thực JWT? → academyProxy nằm sau auth middleware → cần token
   - academyProxy: strip "/api" khỏi path:
     "/api/academy/courses?..." → "/academy/courses?..."
   - Hỏi Consul: "academy-service đang ở đâu?"
   - Consul: "http://192.168.1.85:3007"
   - Forward: GET http://192.168.1.85:3007/academy/courses?category=TRADING&difficulty=BEGINNER

4. AcademyController nhận: GET /academy/courses?category=TRADING&difficulty=BEGINNER
   - size = min(12, 50) = 12
   - log.info: "[AcademyController] GET /courses — category=TRADING, difficulty=BEGINNER, page=0, size=12"
   - Gọi academyService.getCourses("TRADING", "BEGINNER", 0, 12)

5. AcademyService xử lý:
   a) parseDifficulty("BEGINNER") → Difficulty.BEGINNER
   b) Pageable = page 0, size 12, sort by sortOrder + id
   c) courseRepository.findByCategoryAndDifficulty("TRADING", BEGINNER, pageable)
      → SQL: SELECT * FROM courses WHERE category='TRADING' AND difficulty='BEGINNER'
             ORDER BY sort_order ASC, id ASC LIMIT 12 OFFSET 0
      → Trả về: Page<Course> với N course (ví dụ 5)
   d) youTubeProvider.fetchPlaylistVideos()
      → getCache().getIfPresent("playlist_all")
      → Cache HIT (nếu đã fetch trước đó) → Map<videoId, CourseDto> ngay lập tức
      → Hoặc Cache MISS → gọi YouTube API (xem bước 6)
   e) coursePage.map(course -> merge(course, ytData.get(course.getVideoId())))
      → Mỗi Course entity được merge với YouTube data tương ứng
      → 5 Course → 5 CourseDto (đầy đủ thumbnail, duration, viewCount)
   f) PageResponse.from(dtoPage)

6. (Nếu cache miss) YouTubeProvider.fetchPlaylistVideos():
   a) fetchAllVideoIdsFromPlaylist():
      GET googleapis.com/youtube/v3/playlistItems?playlistId=PL...&maxResults=50&key=...
      → ["EoFWcSKRMyg", "vv0fl7x3QzQ", "kJfcZDQULiY", "Wu8M77c05hk", "BO_yydwF1j0"]
   b) fetchVideoDetails(["EoFWcSKRMyg", ...]):
      GET googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=EoFWcSKRMyg,...
      → Parse: title, thumbnail (maxres > high > medium), duration "PT7M25S" → "7:25", viewCount, likeCount
   c) getCache().put("playlist_all", result)  ← Lưu vào cache, dùng cho request tiếp theo

7. AcademyController trả về:
   HTTP 200 + JSON:
   {
     "success": true,
     "message": "Courses fetched successfully",
     "data": {
       "content": [
         {
           "id": 1,
           "videoId": "EoFWcSKRMyg",
           "title": "Kiến Thức Crypto - Bài 1: Mở Đầu",
           "difficulty": "BEGINNER",
           "category": "TRADING",
           "thumbnailUrl": "https://i.ytimg.com/vi/EoFWcSKRMyg/maxresdefault.jpg",
           "durationFormatted": "7:25",
           "viewCount": "25700",
           "likeCount": "250",
           "channelTitle": "Thời Báo Tài Chính",
           "embedUrl": "https://www.youtube.com/embed/EoFWcSKRMyg",
           "watchUrl": "https://www.youtube.com/watch?v=EoFWcSKRMyg"
         },
         ...
       ],
       "page": 0,
       "size": 12,
       "totalElements": 5,
       "totalPages": 1,
       "last": true
     },
     "timestamp": "2026-04-03T23:32:39"
   }

8. React nhận JSON → render danh sách CourseCard với thumbnail + duration badge + tên kênh
```

---

## 15. Tích hợp với hệ thống SOA

### 15.1. Consul Service Discovery

Khi Academy Service start, nó tự đăng ký:

```json
{
  "name": "academy-service",
  "id": "academy-service-3007",
  "address": "192.168.1.85",
  "port": 3007,
  "checks": [
    {
      "http": "http://192.168.1.85:3007/academy/health",
      "interval": "10s"
    }
  ]
}
```

Consul gọi `GET /academy/health` mỗi 10 giây. Nếu nhận `200 OK` → service `healthy`. Nếu timeout hoặc lỗi → service `critical` → Gateway không route request đến đây nữa.

**Tại sao health-check-path là `/academy/health` không phải `/health`?**

Controller có `@RequestMapping("/academy")`, mọi endpoint đều có prefix này. Nếu config Consul là `/health`, nó gọi `http://localhost:3007/health` → 404 Not Found → Consul nghĩ service chết.

### 15.2. API Gateway — academyProxy

```javascript
// backend/api-gateway/server.js
const academyProxy = createProxyMiddleware({
    target: 'http://localhost:3007',
    router: async () => await getServiceTarget('academy-service'),  // Consul lookup
    changeOrigin: true,
    pathRewrite: (path) => path.replace('/api', ''),
    // /api/academy/courses → /academy/courses ✅
});

app.use('/api/academy', academyProxy);
```

**Tại sao chỉ strip `/api` chứ không strip `/api/academy`?**

Nếu strip `/api/academy`, Spring nhận `/courses` — không match `@RequestMapping("/academy")` + `@GetMapping("/courses")`. Cần giữ `/academy` trong path để Spring route đúng.

Đây là lý do mỗi Java service (News, Academy) có proxy riêng với pathRewrite riêng, khác với các Node.js service.

### 15.3. So sánh với các service khác

| | Node.js Services | News Service | Academy Service |
|--|--|--|--|
| Port | 3001-3005 | 3006 | 3007 |
| DB | MongoDB | Không dùng | MySQL |
| External API | CoinPaprika | CryptoCompare | YouTube Data API v3 |
| Cache | Không | Guava | Guava |
| Data model | Document (NoSQL) | In-memory | Relational (SQL) |
| Auth | JWT middleware | Public | JWT (qua Gateway) |

Academy Service minh họa thêm một mô hình khác trong SOA: **hybrid persistence** — MySQL cho metadata quản lý (ai kiểm soát, category, difficulty) + external API cho live data (YouTube metadata).

---

## 16. Frontend — Academy.jsx

### 16.1. Cấu trúc component

```
Academy.jsx
├── CourseCard          ← Hiển thị 1 video: thumbnail, duration badge, tên kênh, stats
├── VideoModal          ← Popup xem video (iframe embed YouTube với autoplay)
└── Pagination          ← Nút < > điều hướng trang
```

### 16.2. API call qua academyAPI

```javascript
// frontend/src/services/api.js
export const academyAPI = {
  getCourses: (params) => api.get('/academy/courses', { params }),
  getCourseById: (videoId) => api.get(`/academy/courses/${videoId}`),
  getHealth: () => api.get('/academy/health'),
};

// Academy.jsx dùng:
const response = await academyAPI.getCourses({
  page: currentPage,
  size: 12,
  category: selectedCategory || undefined,   // undefined → không gửi param
  difficulty: selectedDifficulty || undefined,
});
```

### 16.3. Thumbnail fallback

```jsx
<img
  src={course.thumbnailUrl || `https://img.youtube.com/vi/${course.videoId}/hqdefault.jpg`}
  alt={course.title}
  onError={(e) => {
    // Nếu thumbnailUrl lỗi (404, expired) → thử hqdefault.jpg
    e.target.src = `https://img.youtube.com/vi/${course.videoId}/hqdefault.jpg`;
  }}
/>
```

URL `https://img.youtube.com/vi/{videoId}/hqdefault.jpg` luôn tồn tại cho mọi video YouTube — đây là fallback cuối cùng, không cần gọi API.

### 16.4. YouTube embed với autoplay

```jsx
<iframe
  src={`https://www.youtube.com/embed/${selectedCourse.videoId}?autoplay=1&rel=0`}
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

`autoplay=1` — video tự chạy khi modal mở. `rel=0` — không hiển thị video "gợi ý" của YouTube sau khi xem xong (tránh distraction). `allowFullScreen` — cho phép xem toàn màn hình.

---

## 17. Những vấn đề đã gặp và cách fix

### Vấn đề 1: Jackson `FAIL_ON_UNKNOWN_PROPERTIES = true` — YouTube data bị mất hoàn toàn

**Triệu chứng:** `GET /academy/courses` trả về data nhưng thiếu `thumbnailUrl`, `durationFormatted`, `viewCount`, `likeCount` — tất cả null.

**Debug:** Thêm endpoint `/academy/debug/youtube` gọi trực tiếp YouTube API và trả về raw response → YouTube API trả về đúng format. Vậy lỗi xảy ra khi parse JSON.

**Nguyên nhân:** Mặc định Jackson `FAIL_ON_UNKNOWN_PROPERTIES = true`. YouTube Data API v3 trả về `playlistItems.list` với field `videoOwnerChannelTitle`, `videoOwnerChannelId` trong `snippet` — những field này không có trong class `Snippet` của `YouTubeResponse.java`. Jackson gặp field lạ → throw exception → bắt ở catch → trả về `Collections.emptyMap()` (silent failure, không log error rõ ràng).

**Fix:**
```java
// AppConfig.java — thêm dòng này:
.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
// ← Jackson bỏ qua field không biết thay vì crash
```

**Bài học:** Khi parse JSON từ API bên ngoài, LUÔN cấu hình `FAIL_ON_UNKNOWN_PROPERTIES = false`. API ngoài có thể thêm field mới bất cứ lúc nào. Jackson mặc định quá strict cho usecase này.

---

### Vấn đề 2: Tiêu đề tiếng Việt hiển thị sai ("Ki?n Th?c Crypto")

**Triệu chứng:** Title tiếng Việt bị thành chuỗi dấu "?" như `"Ki?n Th?c Crypto"`. Dữ liệu trong DB bị corrupt.

**Nguyên nhân:** Khi seed data vào MySQL, JDBC URL không chỉ định charset. MySQL mặc định dùng `latin1` — không hỗ trợ Unicode → ký tự tiếng Việt bị mất, thay bằng `?`.

**Fix — 3 bước:**

**Bước 1:** Fix JDBC URL thêm charset:
```yaml
# application.yml:
url: jdbc:mysql://localhost:3306/crypto_academy?useSSL=false
     &allowPublicKeyRetrieval=true
     &useUnicode=true
     &characterEncoding=UTF-8    # ← Thêm hai param này
```

**Bước 2:** Fix charset database và table (chạy trong MySQL):
```sql
ALTER DATABASE crypto_academy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE courses CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Bước 3:** Xóa data cũ bị corrupt, để service tự fallback sang YouTube title:
```sql
UPDATE courses SET title = '', description = NULL;
```

Vì `merge()` logic: khi `title` rỗng → `if (course.getTitle() == null || course.getTitle().isBlank()) → builder.title(yt.getTitle())` → dùng YouTube title được fetch qua HTTPS → UTF-8 chuẩn.

**`utf8mb4` thay vì `utf8`?**

MySQL `utf8` thực ra chỉ là `utf8mb3` — không hỗ trợ emoji (cần 4 bytes). `utf8mb4` là UTF-8 thực sự, hỗ trợ đầy đủ Unicode bao gồm emoji. Với text tiếng Việt và crypto content (có thể chứa emoji), `utf8mb4` là lựa chọn đúng.

---

### Vấn đề 3: Consul config crash service khi start

**Triệu chứng:** Service crash ngay khi start với exception liên quan Consul Config.

**Nguyên nhân:** Spring Cloud Consul tự động cố đọc config từ Consul Key-Value store. Consul chưa có config cho `academy-service` → exception.

**Fix:**
```yaml
cloud:
  consul:
    config:
      enabled: false     # ← Tắt Consul Config, chỉ dùng Consul cho Service Discovery
    discovery:
      fail-fast: false   # ← Không crash nếu Consul chưa start khi service boot
```

---

### Vấn đề 4: Academy Service không có trong start-all-services.ps1

**Triệu chứng:** Chạy `.\start-all-services.ps1` thấy mọi service khởi động nhưng không có cửa sổ Academy Service.

**Nguyên nhân:** Script chỉ có News Service Java, chưa thêm Academy Service.

**Fix:** Thêm block khởi động Academy Service vào cuối script, sau phần News Service:
```powershell
$academyJar = "D:\CryptoTradingSOA\academy-service\target\academy-service-1.0.0.jar"
if (Test-Path $academyJar) {
    # Kill process cũ trên port 3007 nếu có
    $existingPid = netstat -ano | Select-String ":3007\s.*LISTENING" | ...
    if ($existingPid) { Stop-Process -Id $existingPid -Force }

    # Start trong cửa sổ mới với charset URL đúng
    $academyCmd = "java '-Dspring.datasource.password=123456'
                       '-Dspring.datasource.url=jdbc:mysql://...'
                       -jar '$academyJar'"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $academyCmd
}
```

Script cũng tự kill process cũ trên port 3007 trước khi start mới — tránh lỗi "Address already in use".

---

## 18. Tóm tắt kiến trúc

```
@SpringBootApplication
├── @Configuration → AppConfig (ObjectMapper với FAIL_ON_UNKNOWN=false, CORS)
├── @Component → YouTubeProvider (Guava Cache + Java HttpClient)
├── @Repository → CourseRepository (Spring Data JPA tự generate SQL)
├── @Service → AcademyService (merge DB + YouTube, filter, paginate)
├── @RestController → AcademyController (HTTP endpoints /academy/*)
└── @RestControllerAdvice → GlobalExceptionHandler

Annotations Spring Boot quan trọng đã dùng:
- @Entity, @Table, @Column    → Ánh xạ Java class → MySQL table
- @GeneratedValue              → AUTO_INCREMENT
- @Enumerated(STRING)          → Lưu enum dạng chuỗi, an toàn khi thay đổi
- @PrePersist, @PreUpdate      → JPA lifecycle hooks (auto-set timestamps)
- @Repository                  → Spring Data JPA (tự generate SQL từ tên method)
- @Value("${key:default}")     → Inject config từ application.yml / env vars
- @Slf4j (Lombok)              → Tạo field `log` tự động
- @RequiredArgsConstructor     → Constructor injection thay vì @Autowired field
- @JsonInclude(NON_NULL)        → Không serialized field null vào JSON
- @JsonProperty("videoId")     → Map tên JSON khác với tên field Java

Design patterns sử dụng:
- Hybrid Data Model     → DB cho metadata, YouTube API cho live data
- Cache-Aside           → Kiểm tra cache → hit: trả về; miss: fetch, lưu cache, trả về
- Fallback Chain        → DB title → YouTube title → null (graceful degradation)
- DTO Pattern           → Tách entity (DB model) khỏi API response model
- Builder Pattern       → CourseDto.builder()...build() (Lombok @Builder)
- Repository Pattern    → CourseRepository interface (Spring Data JPA implement)
- Exception Handler AOP → @RestControllerAdvice bắt exception tập trung
```

---

> **Tóm gọn trong một câu:** Academy Service là minh chứng của SOA — một Java service độc lập, dùng MySQL lưu metadata do admin kiểm soát, dùng YouTube API v3 lấy live media data, Guava Cache tối ưu performance, tất cả được expose qua REST API chuẩn và tích hợp vào hệ thống qua Consul + API Gateway.
