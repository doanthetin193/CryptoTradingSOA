# KẾ HOẠCH PHÁT TRIỂN ACADEMY SERVICE

**Ngày lập:** 03/04/2026
**Phiên bản:** 3.0
**Trạng thái:** Chuẩn bị phát triển

---

## I. MỤC TIÊU

Tạo trang **Learning Hub** — nơi người dùng xem video học crypto/blockchain/web3 được tuyển chọn sẵn, có thể lọc theo chủ đề và trình độ.

**Không làm:** quiz, progress tracking, badge, upload video.

---

## II. Ý TƯỞNG CỐT LÕI

YouTube API không phân biệt được video "dạy học" hay không — search "crypto" ra đủ loại. Giải pháp:

- **Bạn tự tạo 1 Playlist trên YouTube**, tay chọn 10-15 video từ các kênh uy tín (Whiteboard Crypto, 99Bitcoins, Finematics...)
- **Service chỉ fetch từ playlist đó** → đảm bảo 100% là nội dung giáo dục
- **MySQL lưu thêm metadata do bạn seed:** `difficulty`, `category` (YouTube không có 2 trường này)
- Frontend dùng 2 trường đó để **filter theo chủ đề / trình độ**

```
Bạn seed vào DB:
  video_id=abc123, difficulty=beginner, category=bitcoin

YouTube API trả về:
  title, thumbnail, description, duration

Kết hợp lại:
  Người dùng filter "Bitcoin + Beginner" → ra đúng video cần xem
```

---

## III. TECH STACK

| Thành phần        | Công nghệ                   | Ghi chú                                    |
|-------------------|-----------------------------|--------------------------------------------|
| Language          | Java 21                     | Cùng version với news-service              |
| Framework         | Spring Boot 3.2.4           | Nhất quán với news-service                 |
| Database          | MySQL                       | Đã cài sẵn, dùng Workbench để seed data   |
| ORM               | Spring Data JPA + Hibernate | Tự tạo bảng khi khởi động                  |
| HTTP Client       | RestTemplate                | Gọi YouTube API, giống news-service        |
| Cache             | Guava Cache (TTL 24h)       | Không gọi API liên tục                     |
| Service Discovery | Spring Cloud Consul         | Giống news-service                         |
| Build tool        | Maven                       | Giống news-service                         |
| Port              | **3007**                    |                                            |

---

## IV. CẤU TRÚC THƯ MỤC

```
academy-service/                             <- đặt ngang với news-service/
├── pom.xml
└── src/main/
    ├── java/com/cryptotrading/academy/
    │   ├── AcademyServiceApplication.java    <- Entry point, @EnableScheduling
    │   ├── config/
    │   │   └── AppConfig.java                <- ObjectMapper, RestTemplate beans
    │   ├── controller/
    │   │   └── AcademyController.java         <- @RequestMapping("/academy")
    │   ├── service/
    │   │   └── AcademyService.java            <- Business logic + Guava Cache
    │   ├── provider/
    │   │   └── YouTubeProvider.java           <- Gọi YouTube Data API v3
    │   ├── model/
    │   │   └── Course.java                    <- @Entity -> bảng courses
    │   ├── repository/
    │   │   └── CourseRepository.java          <- extends JpaRepository
    │   └── exception/
    │       └── GlobalExceptionHandler.java
    └── resources/
        └── application.yml
```

**Điểm mới so với news-service:** Thêm `model/` (@Entity JPA) và `repository/` (Spring Data JPA). Còn lại hoàn toàn giống pattern đã biết.

---

## V. DATABASE DESIGN (MySQL)

### Bảng `courses`

```sql
CREATE TABLE courses (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_id    VARCHAR(20)  NOT NULL UNIQUE,   -- YouTube video ID
    title       VARCHAR(300) NOT NULL,           -- Lấy từ YouTube API
    description TEXT,                            -- Lấy từ YouTube API
    thumbnail   VARCHAR(500),                    -- Lấy từ YouTube API
    duration    INT,                             -- Giây, lấy từ YouTube API
    sort_order  INT,
    difficulty  VARCHAR(20)  NOT NULL,           -- 'beginner'|'intermediate'|'advanced'  <- BẠN SEED
    category    VARCHAR(50)  NOT NULL,           -- 'bitcoin'|'ethereum'|'defi'|'web3'    <- BẠN SEED
    fetched_at  DATETIME,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

> Spring JPA tự tạo bảng này khi service khởi động — không cần chạy SQL thủ công.

### Seed data mẫu (bạn tự chọn video)

| video_id | difficulty | category | sort_order |
|----------|-----------|---------|-----------|
| `GmOzih6I1zs` | beginner | bitcoin | 1 |
| `3GJCBaahUc8` | beginner | ethereum | 2 |
| `H2_B6GxCdRQ` | intermediate | defi | 3 |
| `rYQgy8QDEBI` | advanced | blockchain | 4 |
| `E5f_mAe4DyE` | beginner | web3 | 5 |

> Lấy `video_id` từ URL: `youtube.com/watch?v=GmOzih6I1zs` → ID là `GmOzih6I1zs`
> Thumbnail tự động có tại: `https://img.youtube.com/vi/{videoId}/mqdefault.jpg`

---

## VI. API ENDPOINTS

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET | `/academy/courses` | JWT | Danh sách video, có filter + phân trang |
| GET | `/academy/courses/{videoId}` | JWT | Chi tiết 1 video |
| GET | `/academy/health` | Public | Health check cho Consul |

### Query params cho GET /academy/courses

| Param | Mặc định | Ví dụ |
|-------|---------|-------|
| `page` | 1 | `?page=2` |
| `limit` | 10 | `?limit=6` |
| `category` | (tất cả) | `?category=bitcoin` |
| `difficulty` | (tất cả) | `?difficulty=beginner` |

### Response mẫu

```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "videoId": "GmOzih6I1zs",
        "title": "Bitcoin Explained Simply",
        "thumbnail": "https://img.youtube.com/vi/GmOzih6I1zs/mqdefault.jpg",
        "youtubeUrl": "https://youtube.com/watch?v=GmOzih6I1zs",
        "duration": 742,
        "difficulty": "beginner",
        "category": "bitcoin",
        "order": 1
      }
    ],
    "pagination": {
      "page": 1, "limit": 10, "total": 5, "pages": 1,
      "hasNext": false, "hasPrev": false
    }
  }
}
```

---

## VII. application.yml

```yaml
server:
  port: 3007

spring:
  application:
    name: academy-service

  datasource:
    url: jdbc:mysql://localhost:3306/crypto_academy?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
    username: root
    password: ${MYSQL_PASSWORD:root}
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: update        # Tự tạo bảng, không xóa data cũ
    show-sql: false
    database-platform: org.hibernate.dialect.MySQLDialect

  cloud:
    consul:
      host: ${CONSUL_HOST:localhost}
      port: ${CONSUL_PORT:8500}
      discovery:
        health-check-path: /academy/health
        health-check-interval: 10s
        fail-fast: false

youtube:
  api-url: https://www.googleapis.com/youtube/v3/playlistItems
  api-key: ${YOUTUBE_API_KEY:}
  playlist-id: ${YOUTUBE_PLAYLIST_ID:}

cache:
  courses-ttl-hours: 24

scheduler:
  fetch-interval-ms: 86400000   # Refresh mỗi 24 giờ

logging:
  level:
    com.cryptotrading.academy: DEBUG
    org.springframework.cloud.consul: WARN
```

### Thêm vào backend/.env

```
ACADEMY_SERVICE_PORT=3007
MYSQL_PASSWORD=your_mysql_root_password
YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxx
YOUTUBE_PLAYLIST_ID=PLxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## VIII. YOUTUBE SETUP

### Bước 1 — Tạo Playlist

```
1. Đăng nhập YouTube
2. Library -> Playlists -> New Playlist -> đặt tên "Crypto Academy"
3. Tìm và thêm 10-15 video chất lượng từ:
   - Whiteboard Crypto (giải thích dễ hiểu, animation)
   - Finematics (DeFi, Web3)
   - 99Bitcoins (beginner friendly)
   - Andreas M. Antonopoulos (Bitcoin nâng cao)
4. Copy Playlist ID từ URL:
   youtube.com/playlist?list=PLxxxxx  ->  PLxxxxx
```

### Bước 2 — Lấy YouTube API Key

```
1. Vào https://console.cloud.google.com
2. Create Project "CryptoTradingSOA"
3. APIs & Services -> Enable -> tìm "YouTube Data API v3" -> Enable
4. Credentials -> Create Credentials -> API Key -> Copy
5. Dán vào .env: YOUTUBE_API_KEY=...
```

---

## IX. LUỒNG HOẠT ĐỘNG

```
Lần đầu khởi động:
  Spring JPA tạo bảng courses (nếu chưa có)

Bạn seed data vào MySQL Workbench:
  INSERT INTO courses (video_id, difficulty, category, sort_order)
  VALUES ('GmOzih6I1zs', 'beginner', 'bitcoin', 1), ...

User request GET /api/academy/courses?category=bitcoin:
  Gateway xác thực JWT -> forward đến :3007/academy/courses?category=bitcoin
  AcademyController -> AcademyService.getCourses()
    Guava Cache MISS (lần đầu):
      YouTubeProvider.fetchPlaylist()
        -> YouTube API trả về title, thumbnail, duration
        -> Merge với difficulty + category từ DB
        -> Lưu vào Guava Cache TTL 24h
    Guava Cache HIT (request tiếp theo):
      -> Trả về ngay từ bộ nhớ (~1ms)
    Filter theo category=bitcoin
    Paginate
  Trả về JSON

Frontend:
  Dropdown filter category + difficulty
  Hiển thị thumbnail grid
  Click -> mở youtube.com/watch?v=... trong tab mới
```

---

## X. TÍCH HỢP GATEWAY

Thêm vào `backend/api-gateway/server.js` (cùng pattern với newsProxy):

```javascript
// academy-service: Spring Boot dùng @RequestMapping("/academy")
// nên chỉ strip /api, giữ nguyên /academy trong path
const academyProxy = createProxyMiddleware({
  target: 'http://localhost:3007',
  router: async () => await getServiceTarget('academy-service'),
  changeOrigin: true,
  pathRewrite: (path) => path.replace('/api', ''),
  onProxyReq: (proxyReq, req) => {
    if (req.userId) proxyReq.setHeader('X-User-Id', req.userId);
  },
  onError: (err, req, res) => {
    if (!res.headersSent)
      res.status(503).json({ success: false, message: 'Academy Service unavailable' });
  },
  timeout: 30000,
});

app.use('/api/academy', authMiddleware, academyProxy);
```

---

## XI. FRONTEND

### Trang mới: `frontend/src/pages/Academy.jsx`

```
Layout:
+------------------------------------------+
|  Crypto Academy                           |
|  [Category: Tất cả v]  [Level: Tất cả v] |
+------------------------------------------+
|  +--------+  +--------+  +--------+      |
|  |thumbnail|  |thumbnail|  |thumbnail|      |
|  | Bitcoin |  |Ethereum |  |  DeFi  |      |
|  | Beginner|  | Inter.  |  | Inter. |      |
|  | [Xem v] |  | [Xem v] |  | [Xem v]|      |
|  +--------+  +--------+  +--------+      |
|                   [< 1 2 3 >]            |
+------------------------------------------+
```

### Thêm vào `api.js`

```javascript
export const academyAPI = {
  getCourses: (params) => instance.get('/academy/courses', { params }),
  getCourse:  (videoId) => instance.get(`/academy/courses/${videoId}`),
};
```

---

## XII. ĐIỂM MỚI HỌC ĐƯỢC (so với news-service)

| Khái niệm | news-service | academy-service |
|-----------|-------------|----------------|
| Spring Data JPA | Không | @Entity, @Column, @Id, @GeneratedValue |
| JpaRepository | Không | findByCategory(), findByCategoryAndDifficulty() |
| MySQL kết nối | Không | JDBC URL + Hibernate Dialect |
| Merge API data + DB data | Không | YouTube data + difficulty/category từ DB |

---

## XIII. KẾ HOẠCH THỰC HIỆN

| Bước | Công việc | Ước tính |
|------|-----------|---------|
| 1 | pom.xml + application.yml + AcademyServiceApplication | 30 phút |
| 2 | Course.java (@Entity) + CourseRepository | 30 phút |
| 3 | YouTubeProvider (gọi API, parse JSON) | 1 giờ |
| 4 | AcademyService (merge data, Guava Cache, filter, pagination) | 1 giờ |
| 5 | AcademyController (3 endpoints) | 45 phút |
| 6 | Tạo playlist YouTube + seed data MySQL Workbench | 45 phút |
| 7 | Thêm academyProxy vào Gateway + test | 30 phút |
| 8 | Academy.jsx (filter UI + card grid) | 1.5 giờ |
| **Tổng** | | **~6.5 giờ** |

---

*Phiên bản 3.0 | Cập nhật: 03/04/2026*
