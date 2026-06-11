# Academy Service Explained

File nÃ y lÃ  tÃ i liá»‡u há»c `academy-service` theo Ä‘Ãºng code hiá»‡n táº¡i. Má»¥c tiÃªu lÃ  giÃºp báº¡n hiá»ƒu tá»« ná»n táº£ng Ä‘áº¿n luá»“ng khÃ³ hÆ¡n: database, JPA, seeder, learning path, progress, Gateway vÃ  frontend.

## 1. Há»c Service NÃ y Theo CÃ¡ch NÃ o?

Náº¿u nhÃ¬n tháº³ng vÃ o code Spring Boot, service nÃ y dá»… bá»‹ rá»‘i vÃ¬ cÃ³ nhiá»u lá»›p:

```text
Controller -> Service -> Repository -> Database
                     -> Provider -> YouTube API
                     -> Progress -> User context tá»« Gateway
```

CÃ¡ch há»c dá»… nháº¥t lÃ  Ä‘á»«ng Ä‘á»c tá»« trÃªn xuá»‘ng má»i file. HÃ£y hiá»ƒu theo 5 cÃ¢u há»i:

1. Service nÃ y phá»¥c vá»¥ mÃ n hÃ¬nh nÃ o?
2. Service nÃ y lÆ°u dá»¯ liá»‡u gÃ¬?
3. Frontend gá»i API nÃ o?
4. Backend xá»­ lÃ½ API Ä‘Ã³ theo luá»“ng nÃ o?
5. Database thay Ä‘á»•i á»Ÿ Ä‘Ã¢u?

Vá»›i Academy, cÃ¢u tráº£ lá»i ngáº¯n lÃ :

```text
Academy Service phá»¥c vá»¥ trang há»c crypto.
NÃ³ lÆ°u danh sÃ¡ch video trong courses.
NÃ³ lÆ°u tiáº¿n Ä‘á»™ há»c theo user trong course_progress.
Frontend chá»§ yáº¿u gá»i /academy/paths Ä‘á»ƒ láº¥y lá»™ trÃ¬nh há»c.
Khi user tick hoÃ n thÃ nh, frontend gá»i /academy/progress/{videoId}.
```

## 2. Vai TrÃ² Cá»§a Academy Service

`academy-service` lÃ  service há»c táº­p crypto trong há»‡ thá»‘ng CryptoTrading SOA.

Nhiá»‡m vá»¥ chÃ­nh:

- Quáº£n lÃ½ danh sÃ¡ch video/khÃ³a há»c crypto.
- Seed sáºµn dá»¯ liá»‡u khÃ³a há»c máº«u vÃ o MySQL.
- Gom khÃ³a há»c thÃ nh cÃ¡c learning path.
- LÆ°u tiáº¿n Ä‘á»™ há»c cá»§a tá»«ng user.
- Láº¥y thÃªm metadata tá»« YouTube náº¿u cÃ³ API key.
- Expose REST API cho frontend thÃ´ng qua API Gateway.

Service nÃ y khÃ´ng xá»­ lÃ½ giao dá»‹ch, portfolio, giÃ¡ coin hay Ä‘Äƒng nháº­p. NÃ³ chá»‰ xá»­ lÃ½ nghiá»‡p vá»¥ há»c táº­p.

## 3. CÃ´ng Nghá»‡ Sá»­ Dá»¥ng

```text
Language: Java 21
Framework: Spring Boot 3.2.4
Service port: 3007
Database: MySQL
Database name: crypto_academy
ORM: Spring Data JPA / Hibernate
External API: YouTube Data API v3
Cache: Guava Cache trong YouTubeProvider
Service discovery: Consul
Frontend page: frontend/src/pages/Academy.jsx
```

## 4. VÃ¬ Sao CÃ³ 2 Báº£ng Trong 1 Database?

Database riÃªng cá»§a Academy Service lÃ :

```text
crypto_academy
```

Trong Ä‘Ã³ cÃ³ 2 báº£ng:

```text
courses
course_progress
```

Äiá»u nÃ y khÃ´ng vi pháº¡m SOA.

NguyÃªn táº¯c SOA khÃ´ng pháº£i lÃ  "má»—i service chá»‰ Ä‘Æ°á»£c cÃ³ má»™t báº£ng". NguyÃªn táº¯c Ä‘Ãºng lÃ :

```text
Má»—i service sá»Ÿ há»¯u database riÃªng cá»§a nÃ³.
Service khÃ¡c khÃ´ng truy cáº­p trá»±c tiáº¿p database Ä‘Ã³.
Muá»‘n láº¥y dá»¯ liá»‡u thÃ¬ pháº£i gá»i API cá»§a service.
```

á»ž Ä‘Ã¢y:

- `courses` lÆ°u dá»¯ liá»‡u khÃ³a há»c.
- `course_progress` lÆ°u tiáº¿n Ä‘á»™ há»c khÃ³a há»c.

Cáº£ hai Ä‘á»u lÃ  nghiá»‡p vá»¥ Academy nÃªn cÃ¹ng náº±m trong database `crypto_academy` lÃ  Ä‘Ãºng.

Náº¿u tÃ¡ch `course_progress` sang database khÃ¡c thÃ¬ láº¡i lÃ m há»‡ thá»‘ng phá»©c táº¡p khÃ´ng cáº§n thiáº¿t, vÃ¬ progress phá»¥ thuá»™c trá»±c tiáº¿p vÃ o course.

## 5. Bá»©c Tranh Tá»•ng Thá»ƒ

```text
Frontend Academy page
  |
  | GET /api/academy/paths
  v
API Gateway
  |
  | strip /api, optional auth, set X-User-Id náº¿u cÃ³ token
  v
AcademyController
  |
  v
AcademyService
  |
  v
CourseRepository / CourseProgressRepository
  |
  v
MySQL crypto_academy
```

Pháº§n cáº§n nhá»›:

- Controller nháº­n request.
- Service xá»­ lÃ½ nghiá»‡p vá»¥.
- Repository nÃ³i chuyá»‡n vá»›i MySQL.
- Provider nÃ³i chuyá»‡n vá»›i API ngoÃ i.
- DTO lÃ  dá»¯ liá»‡u Ä‘Ã£ chuáº©n bá»‹ Ä‘á»ƒ tráº£ vá» frontend.
Lưu ý theo code hiện tại: `/academy/paths` và `/academy/courses` không gọi YouTube API nữa để trang học mở nhanh và ổn định. `YouTubeProvider` chỉ được gọi ở các luồng cần metadata một video như xem chi tiết course, preview link trong Admin, tạo/sửa course.

## 6. Cáº¥u TrÃºc ThÆ° Má»¥c

```text
academy-service/
  src/main/java/com/cryptotrading/academy/
    AcademyServiceApplication.java
    config/
      AcademySeeder.java
      AppConfig.java
    controller/
      AcademyController.java
    exception/
      GlobalExceptionHandler.java
      ResourceNotFoundException.java
    model/
      ApiResponse.java
      Course.java
      CourseDto.java
      CourseProgress.java
      CourseRequest.java
      LearningPathDto.java
      PageResponse.java
      ProgressRequest.java
      YouTubeResponse.java
    provider/
      YouTubeProvider.java
    repository/
      CourseRepository.java
      CourseProgressRepository.java
    service/
      AcademyService.java
  src/main/resources/
    application.yml
```

## 7. Nhá»¯ng KhÃ¡i Niá»‡m CÆ¡ Báº£n TrÆ°á»›c Khi Äá»c Code

### Entity lÃ  gÃ¬?

Entity lÃ  class Java Ä‘áº¡i diá»‡n cho báº£ng trong database.

VÃ­ dá»¥:

```text
Course.java -> báº£ng courses
CourseProgress.java -> báº£ng course_progress
```

Khi báº¡n tháº¥y:

```java
@Entity
@Table(name = "courses")
```

NghÄ©a lÃ  class nÃ y Ä‘Æ°á»£c Hibernate map thÃ nh báº£ng `courses`.

### DTO lÃ  gÃ¬?

DTO lÃ  object dÃ¹ng Ä‘á»ƒ tráº£ dá»¯ liá»‡u ra API. DTO khÃ´ng nháº¥t thiáº¿t giá»‘ng y há»‡t database.

VÃ­ dá»¥ `CourseDto` khÃ´ng chá»‰ cÃ³ dá»¯ liá»‡u trong báº£ng `courses`, mÃ  cÃ²n cÃ³:

- thumbnail tá»« YouTube
- duration tá»« YouTube
- watchUrl tá»± build
- completed tá»« `course_progress`

VÃ¬ váº­y:

```text
Entity = dá»¯ liá»‡u trong DB
DTO = dá»¯ liá»‡u Ä‘Ã£ chuáº©n bá»‹ Ä‘á»ƒ gá»­i cho frontend
```

### Repository lÃ  gÃ¬?

Repository lÃ  lá»›p giÃºp query database.

Vá»›i Spring Data JPA, mÃ¬nh khÃ´ng cáº§n tá»± viáº¿t SQL cho cÃ¡c query Ä‘Æ¡n giáº£n. Chá»‰ cáº§n Ä‘áº·t tÃªn method:

```java
Optional<Course> findByVideoId(String videoId);
```

Spring hiá»ƒu vÃ  tá»± táº¡o SQL tÆ°Æ¡ng Ä‘Æ°Æ¡ng:

```sql
SELECT * FROM courses WHERE video_id = ?
```

### Service lÃ  gÃ¬?

Service lÃ  nÆ¡i chá»©a business logic.

Controller khÃ´ng nÃªn tá»± xá»­ lÃ½ nhiá»u. Controller chá»‰ nháº­n request rá»“i gá»i Service.

Trong project nÃ y:

```text
AcademyController -> nháº­n HTTP
AcademyService -> xá»­ lÃ½ logic tháº­t
```

## 8. `AcademyServiceApplication.java`

File:

```text
academy-service/src/main/java/com/cryptotrading/academy/AcademyServiceApplication.java
```

Code hiá»‡n táº¡i:

```java
@SpringBootApplication
@EnableDiscoveryClient
public class AcademyServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AcademyServiceApplication.class, args);
    }
}
```

Ã nghÄ©a:

- `@SpringBootApplication`: start Spring Boot, scan component, auto config.
- `@EnableDiscoveryClient`: Ä‘Äƒng kÃ½ service vá»›i Consul.

Service nÃ y khÃ´ng dÃ¹ng scheduler. Seeder cháº¡y báº±ng `CommandLineRunner`, khÃ´ng cáº§n `@EnableScheduling`.

## 9. `application.yml`

File:

```text
academy-service/src/main/resources/application.yml
```

Cáº¥u hÃ¬nh quan trá»ng:

```yaml
server:
  port: 3007

spring:
  application:
    name: academy-service

  datasource:
    url: jdbc:mysql://localhost:3306/crypto_academy?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:}

  jpa:
    hibernate:
      ddl-auto: update

youtube:
  api-key: ${YOUTUBE_API_KEY:}
  base-url: https://www.googleapis.com/youtube/v3
  cache-ttl-hours: 24
```

Giáº£i thÃ­ch:

- `server.port: 3007`: Academy cháº¡y á»Ÿ port 3007.
- `spring.application.name`: tÃªn Ä‘Äƒng kÃ½ vá»›i Consul.
- `datasource.url`: káº¿t ná»‘i MySQL database `crypto_academy`.
- `DB_USERNAME`, `DB_PASSWORD`: Ä‘á»c tá»« biáº¿n mÃ´i trÆ°á»ng, máº·c Ä‘á»‹nh root vÃ  password rá»—ng.
- `ddl-auto: update`: tá»± táº¡o/cáº­p nháº­t báº£ng theo Entity, khÃ´ng xÃ³a data.
- `youtube.api-key`: nếu có key thì lấy metadata cho một video khi cần preview/detail; nếu không có thì vẫn chạy bằng dữ liệu trong MySQL.

Vá»›i XAMPP MySQL hiá»‡n táº¡i, password root thÆ°á»ng rá»—ng nÃªn config nÃ y phÃ¹ há»£p.

## 10. Báº£ng `courses` VÃ  `Course.java`

File:

```text
academy-service/src/main/java/com/cryptotrading/academy/model/Course.java
```

`Course` map vá»›i báº£ng `courses`.

CÃ¡c field:

```java
private Long id;
private String videoId;
private String title;
private Difficulty difficulty;
private String category;
private String learningPath;
private String description;
private Integer sortOrder;
private LocalDateTime createdAt;
private LocalDateTime updatedAt;
```

Ã nghÄ©a tá»«ng field:

| Field | Ã nghÄ©a |
|---|---|
| `id` | khÃ³a chÃ­nh tá»± tÄƒng |
| `videoId` | ID video YouTube, vÃ­ dá»¥ `bBC-nXj3Ng4` |
| `title` | tÃªn bÃ i há»c hiá»ƒn thá»‹ |
| `difficulty` | Ä‘á»™ khÃ³: BEGINNER, INTERMEDIATE, ADVANCED |
| `category` | chá»§ Ä‘á»: BLOCKCHAIN, SECURITY, DEFI, ALTCOINS, TRADING |
| `learningPath` | lá»™ trÃ¬nh há»c, vÃ­ dá»¥ `FOUNDATIONS` |
| `description` | mÃ´ táº£ ngáº¯n |
| `sortOrder` | thá»© tá»± bÃ i trong path |
| `createdAt` | thá»i Ä‘iá»ƒm táº¡o |
| `updatedAt` | thá»i Ä‘iá»ƒm cáº­p nháº­t |

`@PrePersist` vÃ  `@PreUpdate` tá»± set timestamp.

## 11. Báº£ng `course_progress` VÃ  `CourseProgress.java`

File:

```text
academy-service/src/main/java/com/cryptotrading/academy/model/CourseProgress.java
```

`CourseProgress` map vá»›i báº£ng `course_progress`.

CÃ¡c field:

```java
private Long id;
private String userId;
private String videoId;
private boolean completed;
private LocalDateTime completedAt;
private LocalDateTime updatedAt;
```

Ã nghÄ©a:

| Field | Ã nghÄ©a |
|---|---|
| `id` | khÃ³a chÃ­nh |
| `userId` | id user láº¥y tá»« JWT qua Gateway |
| `videoId` | video nÃ o user Ä‘ang há»c |
| `completed` | Ä‘Ã£ hoÃ n thÃ nh hay chÆ°a |
| `completedAt` | hoÃ n thÃ nh lÃºc nÃ o |
| `updatedAt` | cáº­p nháº­t lÃºc nÃ o |

Unique constraint:

```java
uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "video_id"})
```

NghÄ©a lÃ  má»™t user khÃ´ng thá»ƒ cÃ³ 2 dÃ²ng progress cho cÃ¹ng má»™t video.

VÃ­ dá»¥:

```text
user_id = 123
video_id = bBC-nXj3Ng4
completed = true
```

NghÄ©a lÃ  user 123 Ä‘Ã£ há»c xong video Ä‘Ã³.

## 12. DTO Tráº£ Vá» Frontend

### `CourseDto.java`

`CourseDto` lÃ  dá»¯ liá»‡u cá»§a má»™t bÃ i há»c sau khi Ä‘Ã£ merge nhiá»u nguá»“n.

Nguá»“n 1: báº£ng `courses`

```text
title, category, difficulty, learningPath, description, sortOrder
```

Nguá»“n 2: YouTube API, náº¿u method hiện tại có gọi `YouTubeProvider.fetchSingleVideo(videoId)`

```text
thumbnailUrl, durationFormatted, viewCount, likeCount, channelTitle
```

Trong code hiện tại, `/academy/paths`, `/academy/courses` và update progress không lấy nguồn 2. Các field này có thể null và frontend vẫn dùng được nhờ title/description trong MySQL và fallback thumbnail theo `videoId`.

Nguá»“n 3: báº£ng `course_progress`, náº¿u user Ä‘Ã£ Ä‘Äƒng nháº­p

```text
completed, completedAt
```

Nguá»“n 4: tá»± build trong backend

```text
embedUrl = https://www.youtube.com/embed/{videoId}
watchUrl = https://www.youtube.com/watch?v={videoId}
```

ÄÃ¢y lÃ  lÃ½ do `CourseDto` nhÃ¬n dÃ i hÆ¡n `Course`.

### `LearningPathDto.java`

`LearningPathDto` Ä‘áº¡i diá»‡n cho má»™t lá»™ trÃ¬nh há»c.

```java
private String id;
private String title;
private String description;
private int totalCourses;
private int completedCourses;
private int progressPercent;
private List<CourseDto> courses;
```

VÃ­ dá»¥ response Ä‘Æ¡n giáº£n:

```json
{
  "id": "FOUNDATIONS",
  "title": "Crypto Foundations",
  "totalCourses": 6,
  "completedCourses": 2,
  "progressPercent": 33,
  "courses": []
}
```

Frontend dÃ¹ng object nÃ y Ä‘á»ƒ hiá»ƒn thá»‹ sidebar path vÃ  list video.

### `ProgressRequest.java`

Request body khi user tick hoÃ n thÃ nh:

```json
{
  "completed": true
}
```

## 13. Seeder: `AcademySeeder.java`

File:

```text
academy-service/src/main/java/com/cryptotrading/academy/config/AcademySeeder.java
```

Seeder cháº¡y khi service start.

VÃ¬ sao cáº§n seeder?

TrÆ°á»›c Ä‘Ã³ báº¡n xÃ³a MySQL/XAMPP nÃªn database rá»—ng. Náº¿u khÃ´ng cÃ³ seeder, trang Academy sáº½ khÃ´ng cÃ³ bÃ i há»c nÃ o. Seeder giÃºp service tá»± cÃ³ dá»¯ liá»‡u demo á»•n Ä‘á»‹nh.

Hiá»‡n seeder táº¡o 21 khÃ³a há»c.

Learning paths hiá»‡n táº¡i:

| Path ID | Title | Sá»‘ bÃ i |
|---|---|---|
| `FOUNDATIONS` | Crypto Foundations | 6 |
| `SECURITY_BASICS` | Wallet & Security | 4 |
| `DEFI_ALTCOINS` | DeFi & Altcoins | 6 |
| `TRADING_BASICS` | Trading Basics | 5 |

Seeder dÃ¹ng upsert:

```text
Náº¿u videoId Ä‘Ã£ tá»“n táº¡i -> update láº¡i dá»¯ liá»‡u
Náº¿u videoId chÆ°a tá»“n táº¡i -> insert má»›i
```

LÃ½ do dÃ¹ng upsert:

- DB rá»—ng thÃ¬ tá»± seed má»›i.
- DB Ä‘Ã£ cÃ³ dá»¯ liá»‡u cÅ© thÃ¬ tá»± cáº­p nháº­t.
- Khi sá»­a title/path/sortOrder trong code, restart service lÃ  DB cáº­p nháº­t theo.

Seeder cÅ©ng xÃ³a 3 video seed cÅ© bá»‹ há»ng:

```text
E5f_mAe4DyE
H2_B6GxCdRQ
3GJCBaahUc8
```

Ba ID nÃ y tá»«ng gÃ¢y thumbnail xÃ¡m/video lá»—i nÃªn Ä‘Ã£ Ä‘Æ°a vÃ o `BROKEN_SEED_VIDEO_IDS`.

## 14. Repository

### `CourseRepository.java`

File:

```text
academy-service/src/main/java/com/cryptotrading/academy/repository/CourseRepository.java
```

CÃ¡c method:

```java
Optional<Course> findByVideoId(String videoId);
Page<Course> findByCategory(String category, Pageable pageable);
Page<Course> findByDifficulty(Difficulty difficulty, Pageable pageable);
Page<Course> findByCategoryAndDifficulty(String category, Difficulty difficulty, Pageable pageable);
```

DÃ¹ng cho:

- tÃ¬m course theo videoId
- filter theo category
- filter theo difficulty
- filter cáº£ category vÃ  difficulty

### `CourseProgressRepository.java`

File:

```text
academy-service/src/main/java/com/cryptotrading/academy/repository/CourseProgressRepository.java
```

CÃ¡c method:

```java
Optional<CourseProgress> findByUserIdAndVideoId(String userId, String videoId);
List<CourseProgress> findByUserIdAndCompletedTrue(String userId);
```

DÃ¹ng cho:

- tÃ¬m progress cá»§a má»™t user á»Ÿ má»™t video
- láº¥y danh sÃ¡ch video user Ä‘Ã£ hoÃ n thÃ nh

## 15. YouTubeProvider: Pháº§n Dá»… GÃ¢y Rá»‘i

File:

```text
academy-service/src/main/java/com/cryptotrading/academy/provider/YouTubeProvider.java
```

HÃ£y hiá»ƒu Ä‘Æ¡n giáº£n:

```text
Database lÆ°u videoId vÃ  thÃ´ng tin quáº£n lÃ½.
YouTubeProvider chá»‰ bá»• sung metadata náº¿u cÃ³ thá»ƒ.
```

Metadata lÃ :

- thumbnail
- duration
- viewCount
- likeCount
- channelTitle
- publishedAt

Náº¿u khÃ´ng cÃ³ YouTube API key, service váº«n hoáº¡t Ä‘á»™ng. Khi Ä‘Ã³ card váº«n cÃ³ title/description tá»« DB seed vÃ  frontend tá»± fallback thumbnail báº±ng:

```text
https://i.ytimg.com/vi/{videoId}/hqdefault.jpg
```

### `fetchSingleVideo(videoId)`

Luồng hiện tại sau khi đã gỡ playlist:

```text
1. Nhận videoId từ AcademyService.
2. Kiểm tra cache theo chính videoId đó.
3. Nếu chưa có API key YouTube -> trả minimal DTO.
4. Nếu có API key -> gọi YouTube videos.list cho đúng 1 video.
5. Parse title, description, thumbnail, duration, viewCount, likeCount.
6. Cache metadata video.
7. Nếu API lỗi hoặc video không lấy được -> trả minimal DTO.
```

Service không còn `fetchPlaylistVideos()` nữa. Lý do xóa:

- Danh sách khóa học đã được quản lý bằng MySQL.
- Admin đã có chức năng thêm/sửa/xóa khóa học bằng link YouTube hoặc videoId.
- Playlist làm code dài hơn vì phải xử lý playlistItems, phân trang, batch nhiều video và cache toàn playlist.
- Hiệu quả không đáng kể trong đồ án này vì nhu cầu chính là quản lý khóa học rõ ràng trong database.

Minimal DTO vẫn có:

```text
embedUrl
watchUrl
```

VÃ¬ váº­y frontend váº«n cÃ³ thá»ƒ má»Ÿ video báº±ng URL.

## 16. AcademyService: TrÃ¡i Tim Logic

File:

```text
academy-service/src/main/java/com/cryptotrading/academy/service/AcademyService.java
```

ÄÃ¢y lÃ  file quan trá»ng nháº¥t.

### Tư duy chung

`AcademyService` hiện làm 3 việc lớn:

```text
1. Lấy course từ MySQL.
2. Gắn progress cá nhân nếu request có userId.
3. Chỉ lấy YouTube metadata khi thật sự cần một video cụ thể.
```

Cụ thể:

```text
getCourses() và getLearningPaths()
  -> không gọi YouTube API
  -> chỉ merge Course trong DB + progress

getCourseByVideoId(), previewCourse(), createCourse(), updateCourse()
  -> có gọi YouTubeProvider.fetchSingleVideo(videoId)
  -> nếu không có YOUTUBE_API_KEY thì vẫn trả minimal DTO
```

### `getCourses()`

Method nÃ y giá»¯ láº¡i API catalog cÅ©.

```text
getCourses(category, difficulty, page, size, userId)
```

Luồng:

```text
1. Tạo Pageable để phân trang.
2. Parse difficulty string sang enum.
3. Query DB theo filter category/difficulty.
4. Lấy progress của user nếu có userId.
5. Gọi merge(course, null, progress) cho từng course.
6. Trả PageResponse<CourseDto>.
```

Điểm quan trọng: method này không gọi YouTube API nữa. Thumbnail trên frontend có fallback theo `videoId`, còn metadata phụ như duration/viewCount chỉ có ở luồng detail/preview nếu có API key.

Hiá»‡n frontend Academy má»›i khÃ´ng dÃ¹ng chÃ­nh endpoint nÃ y, nhÆ°ng giá»¯ láº¡i Ä‘á»ƒ tÆ°Æ¡ng thÃ­ch vÃ  váº«n cÃ³ thá»ƒ test API.

### `getLearningPaths()`

ÄÃ¢y lÃ  method quan trá»ng nháº¥t vá»›i UI hiá»‡n táº¡i.

```text
getLearningPaths(userId)
```

Luá»“ng dá»… hiá»ƒu:

```text
1. Láº¥y táº¥t cáº£ courses tá»« database.
2. Sort theo thá»© tá»± path.
3. Trong má»—i path, sort theo sortOrder.
4. Merge tá»«ng course thÃ nh CourseDto.
5. Group cÃ¡c CourseDto theo learningPath.
6. Vá»›i má»—i group, táº¡o LearningPathDto.
7. TÃ­nh completedCourses vÃ  progressPercent.
```

VÃ­ dá»¥:

```text
courses:
  FOUNDATIONS bÃ i 1
  FOUNDATIONS bÃ i 2
  TRADING_BASICS bÃ i 1

Sau group:
  LearningPathDto FOUNDATIONS:
    courses = [bÃ i 1, bÃ i 2]

  LearningPathDto TRADING_BASICS:
    courses = [bÃ i 1]
```

### `updateProgress()`

Method nÃ y cháº¡y khi user báº¥m `HoÃ n thÃ nh`.

```text
updateProgress(userId, videoId, completed)
```

Luá»“ng:

```text
1. Náº¿u userId rá»—ng -> bÃ¡o lá»—i vÃ¬ progress cáº§n Ä‘Äƒng nháº­p.
2. Kiá»ƒm tra videoId cÃ³ tá»“n táº¡i trong courses khÃ´ng.
3. TÃ¬m course_progress theo userId + videoId.
4. Náº¿u chÆ°a cÃ³ -> táº¡o má»›i.
5. Set completed.
6. Náº¿u completed=true -> set completedAt.
7. Náº¿u completed=false -> completedAt = null.
8. Save vÃ o MySQL.
9. Tráº£ CourseDto má»›i cho frontend.
```

### `merge()`

ÄÃ¢y lÃ  method dá»… gÃ¢y rá»‘i nhÆ°ng ráº¥t quan trá»ng.

NÃ³ nháº­n:

```text
Course course
CourseDto youtube
Map<String, CourseProgress> progress
```

Rá»“i táº¡o ra `CourseDto` cuá»‘i cÃ¹ng cho frontend.

NÃ³i Ä‘Æ¡n giáº£n:

```text
CourseDto = Course trong DB + optional YouTube metadata + Progress của user
```

VÃ­ dá»¥:

```text
Course DB:
  title = "How Bitcoin Actually Works"
  videoId = "bBC-nXj3Ng4"
  learningPath = "FOUNDATIONS"

YouTube:
  thumbnailUrl = "..."
  durationFormatted = "26:21"

Progress:
  completed = true

CourseDto tráº£ frontend:
  title = "How Bitcoin Actually Works"
  thumbnailUrl = "..."
  durationFormatted = "26:21"
  completed = true
```

### `completedProgress()`

Náº¿u user chÆ°a Ä‘Äƒng nháº­p:

```text
return Map.of()
```

Náº¿u user Ä‘Ã£ Ä‘Äƒng nháº­p:

```text
láº¥y táº¥t cáº£ course_progress completed=true cá»§a user
map theo videoId
```

Nhá» váº­y `merge()` chá»‰ cáº§n kiá»ƒm tra:

```java
progress.get(course.getVideoId())
```

### `pathTitle()`, `pathDescription()`, `pathOrder()`

CÃ¡c method nÃ y map path ID ká»¹ thuáº­t sang ná»™i dung hiá»ƒn thá»‹.

VÃ­ dá»¥:

```text
FOUNDATIONS -> Crypto Foundations
SECURITY_BASICS -> Wallet & Security
DEFI_ALTCOINS -> DeFi & Altcoins
TRADING_BASICS -> Trading Basics
```

`pathOrder()` giÃºp path hiá»ƒn thá»‹ Ä‘Ãºng thá»© tá»±:

```text
1. Foundations
2. Wallet & Security
3. DeFi & Altcoins
4. Trading Basics
```

## 17. AcademyController

File:

```text
academy-service/src/main/java/com/cryptotrading/academy/controller/AcademyController.java
```

Controller expose API.

Endpoints:

| Method | Path | Auth | Ã nghÄ©a |
|---|---|---|---|
| GET | `/academy/health` | Public | Health check |
| GET | `/academy/courses` | Public/optional auth | Láº¥y course dáº¡ng paging/filter |
| GET | `/academy/courses/{videoId}` | Public/optional auth | Láº¥y chi tiáº¿t course |
| GET | `/academy/paths` | Public/optional auth | Láº¥y learning paths |
| PUT | `/academy/progress/{videoId}` | Required auth qua Gateway | Cập nhật tiến độ |
| POST | `/academy/admin/courses/preview` | Admin | Preview link YouTube/videoId |
| POST | `/academy/admin/courses` | Admin | Tạo course mới |
| PUT | `/academy/admin/courses/{id}` | Admin | Cập nhật course |
| DELETE | `/academy/admin/courses/{id}` | Admin | Xóa course và progress liên quan |

CORS trong `AppConfig.java` hiện cho phép các method REST mà frontend cần:

```text
GET, POST, PUT, DELETE, OPTIONS
```

Điểm này quan trọng vì Admin Panel dùng `POST` để preview/tạo course và `DELETE` để xóa course. Trước khi sửa CORS, POST preview từng bị Spring trả 403.
Controller cÃ³ dÃ²ng:

```java
@RequestHeader(value = "X-User-Id", required = false) String userId
```

Header nÃ y khÃ´ng pháº£i frontend tá»± gá»­i. API Gateway gá»­i xuá»‘ng sau khi verify JWT.

## 18. API Gateway VÃ  Auth

File:

```text
backend/api-gateway/server.js
```

Route hiá»‡n táº¡i:

```javascript
app.use('/api/academy/progress', authMiddleware, academyProxy);
app.use('/api/academy', optionalAuth, academyProxy);
```

Ã nghÄ©a:

- Xem khÃ³a há»c khÃ´ng cáº§n Ä‘Äƒng nháº­p.
- Náº¿u Ä‘Ã£ Ä‘Äƒng nháº­p, Gateway gá»­i `X-User-Id` xuá»‘ng Academy Ä‘á»ƒ tráº£ progress.
- Cáº­p nháº­t progress báº¯t buá»™c Ä‘Äƒng nháº­p.

Trong `academyProxy.onProxyReq`:

```javascript
if (req.userId) {
  proxyReq.setHeader('X-User-Id', req.userId);
}
```

ÄÃ¢y lÃ  cáº§u ná»‘i giá»¯a JWT á»Ÿ Gateway vÃ  `userId` trong Academy Service.

Path rewrite:

```text
/api/academy/paths -> /academy/paths
```

Gateway chá»‰ xÃ³a `/api`, giá»¯ `/academy` vÃ¬ Spring Controller cÃ³ prefix `/academy`.

## 19. Frontend Academy

File:

```text
frontend/src/pages/Academy.jsx
frontend/src/services/api.js
```

API helper:

```javascript
export const academyAPI = {
  getCourses: (params) => api.get('/academy/courses', { params }),
  getCourseById: (videoId) => api.get(`/academy/courses/${videoId}`),
  getPaths: () => api.get('/academy/paths'),
  updateProgress: (videoId, completed) => api.put(`/academy/progress/${videoId}`, { completed }),
  getHealth: () => api.get('/academy/health'),
};
```

Trang hiá»‡n dÃ¹ng chÃ­nh:

```text
GET /api/academy/paths
PUT /api/academy/progress/{videoId}
```

CÃ¡c component trong `Academy.jsx`:

| Component | Vai trÃ² |
|---|---|
| `PathButton` | nÃºt chá»n learning path bÃªn trÃ¡i |
| `CourseCard` | card video |
| `ProgressButton` | nÃºt HoÃ n thÃ nh / ÄÃ£ há»c |
| `VideoModal` | modal xem video |
| `ProgressBar` | thanh tiáº¿n Ä‘á»™ |

Luá»“ng frontend:

```text
1. Component mount.
2. loadPaths() gá»i academyAPI.getPaths().
3. LÆ°u paths vÃ o state.
4. Chá»n path Ä‘áº§u tiÃªn lÃ m active.
5. Render sidebar path.
6. Render courses cá»§a activePath.
7. User báº¥m course -> má»Ÿ VideoModal.
8. User báº¥m HoÃ n thÃ nh -> updateProgress().
9. Sau khi lÆ°u, gá»i loadPaths(false) Ä‘á»ƒ reload progress.
```

## 20. Luá»“ng Má»Ÿ Trang Academy

```text
1. User vÃ o /academy trÃªn frontend.
2. React gá»i GET /api/academy/paths.
3. Axios tá»± gáº¯n Authorization Bearer token náº¿u user Ä‘Ã£ login.
4. Gateway optionalAuth kiá»ƒm tra token náº¿u cÃ³.
5. Náº¿u token há»£p lá»‡, Gateway set X-User-Id.
6. Gateway forward sang Academy Service: GET /academy/paths.
7. Controller gá»i academyService.getLearningPaths(userId).
8. Service láº¥y courses tá»« MySQL.
9. Service láº¥y completed progress náº¿u cÃ³ userId.
10. Service group courses thÃ nh learning paths.
11. Frontend render lá»™ trÃ¬nh vÃ  video.

Ghi nhớ theo code hiện tại: luồng mở trang `/academy` không gọi YouTube API. YouTube metadata chỉ được dùng ở các luồng một video cụ thể như xem chi tiết, preview, tạo hoặc sửa course trong Admin.
```

## 21. Luá»“ng Tick HoÃ n ThÃ nh BÃ i

```text
1. User báº¥m nÃºt HoÃ n thÃ nh trÃªn CourseCard.
2. Frontend gá»i PUT /api/academy/progress/{videoId}.
3. Body gá»­i lÃªn: { "completed": true }.
4. Gateway cháº¡y authMiddleware.
5. Náº¿u khÃ´ng cÃ³ token -> tráº£ 401.
6. Náº¿u token há»£p lá»‡ -> set X-User-Id.
7. AcademyController gá»i updateProgress().
8. AcademyService kiá»ƒm tra course tá»“n táº¡i.
9. TÃ¬m hoáº·c táº¡o CourseProgress.
10. Save completed=true vÃ o MySQL.
11. Frontend reload paths Ä‘á»ƒ cáº­p nháº­t sá»‘ bÃ i Ä‘Ã£ há»c.
```

## 22. VÃ¬ Sao Code CÃ³ Cáº£ YouTube API VÃ  Seeder?

Hai pháº§n nÃ y phá»¥c vá»¥ hai má»¥c Ä‘Ã­ch khÃ¡c nhau.

Seeder:

```text
Äáº£m báº£o DB luÃ´n cÃ³ danh sÃ¡ch bÃ i há»c máº«u.
KhÃ´ng phá»¥ thuá»™c internet/API key.
```

YouTubeProvider:

```text
Bá»• sung metadata live náº¿u cÃ³ API key.
VÃ­ dá»¥ thumbnail tá»‘t hÆ¡n, duration, viewCount, channelTitle.
```

Náº¿u khÃ´ng cÃ³ YouTube API key:

```text
Academy váº«n cháº¡y.
Frontend váº«n cÃ³ title, description, category, path tá»« DB.
Thumbnail fallback báº±ng URL áº£nh YouTube public.
```

## 23. VÃ¬ Sao Frontend DÃ¹ng `/paths` Thay VÃ¬ `/courses`?

`/courses` tráº£ dá»¯ liá»‡u pháº³ng:

```text
[course1, course2, course3]
```

Frontend pháº£i tá»± group thÃ nh path.

`/paths` tráº£ dá»¯ liá»‡u Ä‘Ã£ Ä‘Æ°á»£c backend chuáº©n bá»‹:

```text
[
  {
    id: "FOUNDATIONS",
    title: "Crypto Foundations",
    progressPercent: 33,
    courses: [...]
  }
]
```

NhÆ° váº­y frontend Ä‘Æ¡n giáº£n hÆ¡n vÃ  logic group/progress náº±m á»Ÿ backend, nÆ¡i gáº§n database hÆ¡n.

## 24. Nhá»¯ng Äiá»ƒm ÄÃ£ Clean/Cáº£i Thiá»‡n

- ThÃªm báº£ng `course_progress` Ä‘á»ƒ lÆ°u tiáº¿n Ä‘á»™ há»c.
- ThÃªm `LearningPathDto` Ä‘á»ƒ backend tráº£ sáºµn path cho frontend.
- ThÃªm `ProgressRequest` nhá» gá»n cho update progress.
- ThÃªm `CourseProgressRepository`.
- `AcademyService` giá»¯ business logic, controller má»ng.
- Seeder chuyá»ƒn sang upsert, khÃ´ng phá»¥ thuá»™c DB rá»—ng.
- Seeder tÄƒng lÃªn 21 video.
- Seeder tá»± dá»n 3 video cÅ© bá»‹ há»ng.
- Gateway tÃ¡ch route public vÃ  route cáº§n auth.
- Frontend chuyá»ƒn sang learning path cÃ³ progress.
- Modal video Ä‘Ã£ cÄƒn láº¡i Ä‘á»ƒ khÃ´ng trÃ n mÃ n hÃ¬nh.
- Modal cÃ³ nÃºt má»Ÿ YouTube trá»±c tiáº¿p náº¿u embed bá»‹ cháº·n.
- Admin Panel cÃ³ tab KhÃ³a há»c Ä‘á»ƒ thÃªm/sá»­a/xÃ³a course báº±ng link YouTube hoáº·c videoId.
- ÄÃ£ bá» logic YouTube playlist/import playlist Ä‘á»ƒ service gá»n vÃ  dá»… review hÆ¡n.
- CORS Ä‘Ã£ cho phÃ©p `POST`, `PUT`, `DELETE` Ä‘á»ƒ Admin Preview/Create/Update/Delete cháº¡y qua Gateway.
- Script start khÃ´ng cÃ²n nháº¯c `YOUTUBE_PLAYLIST_ID` vÃ  khÃ´ng Ã©p MySQL password cá»©ng.

## 25. CÃ¡c Lá»—i/Dá»… Nháº§m Khi Há»c Service NÃ y

### Nháº§m 1: SOA lÃ  má»—i database chá»‰ cÃ³ má»™t báº£ng

KhÃ´ng Ä‘Ãºng.

ÄÃºng lÃ :

```text
Má»—i service sá»Ÿ há»¯u database riÃªng.
Database Ä‘Ã³ cÃ³ thá»ƒ cÃ³ nhiá»u báº£ng ná»™i bá»™.
```

### Nháº§m 2: CourseDto lÃ  báº£ng database

KhÃ´ng Ä‘Ãºng.

`CourseDto` chá»‰ lÃ  response object tráº£ frontend. Báº£ng database lÃ  `Course` vÃ  `CourseProgress`.

### Nháº§m 3: YouTube API lÃ  báº¯t buá»™c

KhÃ´ng Ä‘Ãºng.

Náº¿u YouTube API chÆ°a cáº¥u hÃ¬nh, service váº«n cháº¡y báº±ng dá»¯ liá»‡u seed.

### Nháº§m 4: Frontend tá»± biáº¿t userId

KhÃ´ng Ä‘Ãºng.

Frontend chá»‰ gá»­i JWT token. Gateway verify token rá»“i set `X-User-Id` cho Academy Service.

### Nháº§m 5: Progress nÃªn lÆ°u á»Ÿ User Service

KhÃ´ng nÃªn trong Ä‘á»“ Ã¡n nÃ y.

Progress nÃ y thuá»™c nghiá»‡p vá»¥ há»c táº­p, nÃªn Ä‘á»ƒ trong Academy Service lÃ  Ä‘Ãºng hÆ¡n.

## 26. Thá»© Tá»± Äá»c Code Äá»ƒ KhÃ´ng Bá»‹ Rá»‘i

Äá»c theo thá»© tá»± nÃ y:

1. `Course.java` - hiá»ƒu báº£ng khÃ³a há»c.
2. `CourseProgress.java` - hiá»ƒu báº£ng tiáº¿n Ä‘á»™.
3. `CourseDto.java` - hiá»ƒu dá»¯ liá»‡u tráº£ ra frontend.
4. `LearningPathDto.java` - hiá»ƒu lá»™ trÃ¬nh há»c.
5. `AcademySeeder.java` - hiá»ƒu 21 bÃ i há»c Ä‘Æ°á»£c táº¡o ra tháº¿ nÃ o.
6. `CourseRepository.java` - hiá»ƒu query course.
7. `CourseProgressRepository.java` - hiá»ƒu query progress.
8. `AcademyController.java` - xem API public.
9. `AcademyService.java` - Ä‘á»c logic tháº­t.
10. `YouTubeProvider.java` - Ä‘á»c sau cÃ¹ng vÃ¬ Ä‘Ã¢y lÃ  pháº§n bá»• sung metadata.
11. `backend/api-gateway/server.js` - hiá»ƒu auth/proxy.
12. `frontend/src/pages/Academy.jsx` - hiá»ƒu UI dÃ¹ng API.

Khi Ä‘á»c `AcademyService.java`, Ä‘á»c theo thá»© tá»± method nÃ y:

1. `getLearningPaths()`
2. `merge()`
3. `completedProgress()`
4. `toLearningPath()`
5. `updateProgress()`
6. `getCourses()`
7. `getCourseByVideoId()`

## 27. CÃ¢u TrÃ¬nh BÃ y Ngáº¯n Vá»›i Giáº£ng ViÃªn

Academy Service lÃ  má»™t Java Spring Boot service Ä‘á»™c láº­p trong há»‡ thá»‘ng SOA, sá»Ÿ há»¯u database MySQL riÃªng `crypto_academy`. Service lÆ°u danh sÃ¡ch khÃ³a há»c trong báº£ng `courses`, lÆ°u tiáº¿n Ä‘á»™ há»c theo user trong báº£ng `course_progress`, seed sáºµn 21 video crypto theo learning path, cÃ³ thá»ƒ láº¥y thÃªm metadata tá»« YouTube API, vÃ  expose API qua Gateway Ä‘á»ƒ frontend hiá»ƒn thá»‹ lá»™ trÃ¬nh há»c cÅ©ng nhÆ° lÆ°u tiáº¿n Ä‘á»™ cÃ¡ nhÃ¢n.

## 28. CÃ¢u TrÃ¬nh BÃ y DÃ i HÆ¡n

Trong Ä‘á»“ Ã¡n 2, em nÃ¢ng cáº¥p pháº§n Academy tá»« má»™t danh sÃ¡ch video Ä‘Æ¡n giáº£n thÃ nh má»™t service há»c táº­p cÃ³ lá»™ trÃ¬nh. Backend dÃ¹ng Spring Boot vÃ  MySQL. Báº£ng `courses` lÆ°u metadata quáº£n lÃ½ cá»§a bÃ i há»c nhÆ° videoId, title, category, difficulty, learningPath vÃ  sortOrder. Báº£ng `course_progress` lÆ°u tráº¡ng thÃ¡i há»c cá»§a tá»«ng user theo tá»«ng video. Khi frontend má»Ÿ trang Academy, nÃ³ gá»i `/api/academy/paths`; Gateway optional auth token, set `X-User-Id` náº¿u user Ä‘Ã£ Ä‘Äƒng nháº­p, rá»“i forward sang Academy Service. Service lấy courses từ MySQL, merge progress nếu có userId, group thành learning path và trả về frontend. Luồng `/paths` không gọi YouTube API nữa; YouTube metadata chỉ dùng ở detail/preview một video. Khi user báº¥m hoÃ n thÃ nh, frontend gá»i `/api/academy/progress/{videoId}`, Gateway báº¯t buá»™c Ä‘Äƒng nháº­p, sau Ä‘Ã³ Academy Service upsert progress vÃ o MySQL.

## 29. Báº£n Äá»“ Dá»¯ Liá»‡u: Tá»« Database Äáº¿n MÃ n HÃ¬nh

ÄÃ¢y lÃ  pháº§n quan trá»ng nháº¥t Ä‘á»ƒ háº¿t rá»‘i.

Má»™t card video trÃªn frontend khÃ´ng Ä‘áº¿n tá»« má»™t nÆ¡i duy nháº¥t. Trong luồng `/academy/paths` hiện tại, dữ liệu card chủ yếu được ghép từ MySQL và progress:

```text
courses table
  -> thÃ´ng tin quáº£n lÃ½: title, category, difficulty, learningPath, description

course_progress table
  -> thÃ´ng tin cÃ¡ nhÃ¢n: user nÃ y Ä‘Ã£ hoÃ n thÃ nh video chÆ°a

AcademyService.merge()
  -> ghÃ©p courses + progress thÃ nh CourseDto

Academy.jsx
  -> render CourseDto thÃ nh CourseCard
```

YouTubeProvider chỉ bổ sung thumbnail/duration/views/likes/channelTitle khi service đang xử lý một video cụ thể và có truyền `CourseDto youtube` vào `merge()`, ví dụ preview course hoặc xem chi tiết course. Trang learning path không phụ thuộc vào API này.

VÃ­ dá»¥ má»™t dÃ²ng trong báº£ng `courses`:

```text
id: 3
video_id: bBC-nXj3Ng4
title: How Bitcoin Actually Works
difficulty: INTERMEDIATE
category: BLOCKCHAIN
learning_path: FOUNDATIONS
description: A deeper visual explanation of transactions, hashes, and consensus.
sort_order: 3
```

Náº¿u user Ä‘Ã£ há»c xong video nÃ y, báº£ng `course_progress` cÃ³ thá»ƒ cÃ³:

```text
id: 10
user_id: 696213ae19b0e3c9dad5aafe
video_id: bBC-nXj3Ng4
completed: true
completed_at: 2026-05-30T22:54:38
```

Khi frontend gá»i `/academy/paths`, backend tráº£ vá» `CourseDto` gáº§n giá»‘ng:

```json
{
  "videoId": "bBC-nXj3Ng4",
  "title": "How Bitcoin Actually Works",
  "difficulty": "INTERMEDIATE",
  "category": "BLOCKCHAIN",
  "learningPath": "FOUNDATIONS",
  "description": "A deeper visual explanation of transactions, hashes, and consensus.",
  "sortOrder": 3,
  "embedUrl": "https://www.youtube.com/embed/bBC-nXj3Ng4",
  "watchUrl": "https://www.youtube.com/watch?v=bBC-nXj3Ng4",
  "completed": true,
  "completedAt": "2026-05-30T22:54:38"
}
```

Náº¿u YouTube API cÃ³ metadata, object trÃªn cÃ³ thÃªm:

```json
{
  "thumbnailUrl": "...",
  "durationFormatted": "26:21",
  "viewCount": "1234567",
  "likeCount": "45000",
  "channelTitle": "3Blue1Brown"
}
```

Náº¿u khÃ´ng cÃ³ YouTube API key, cÃ¡c field YouTube cÃ³ thá»ƒ null. Frontend váº«n hiá»ƒn thá»‹ Ä‘Æ°á»£c vÃ¬ Ä‘Ã£ cÃ³ fallback thumbnail vÃ  dá»¯ liá»‡u seed.

## 30. API Response Thá»±c Táº¿ Cá»§a `/academy/paths`

Frontend hiá»‡n dÃ¹ng API nÃ y nhiá»u nháº¥t.

Request:

```http
GET /api/academy/paths
```

Qua Gateway sáº½ thÃ nh:

```http
GET /academy/paths
```

Response Ä‘Æ°á»£c bá»c trong `ApiResponse`:

```json
{
  "success": true,
  "message": "Learning paths fetched successfully",
  "data": [
    {
      "id": "FOUNDATIONS",
      "title": "Crypto Foundations",
      "description": "Build the minimum crypto knowledge needed before using trading features.",
      "totalCourses": 6,
      "completedCourses": 0,
      "progressPercent": 0,
      "courses": [
        {
          "videoId": "GmOzih6I1zs",
          "title": "Bitcoin Mining Explained",
          "difficulty": "BEGINNER",
          "category": "BLOCKCHAIN",
          "learningPath": "FOUNDATIONS",
          "completed": false
        }
      ]
    }
  ],
  "timestamp": "2026-05-30T23:07:46"
}
```

Báº¡n cÃ³ thá»ƒ hiá»ƒu response nÃ y nhÆ° sau:

```text
data = danh sÃ¡ch lá»™ trÃ¬nh há»c
má»—i lá»™ trÃ¬nh cÃ³ courses
má»—i course Ä‘Ã£ cÃ³ Ä‘á»§ dá»¯ liá»‡u Ä‘á»ƒ render card
```

Frontend khÃ´ng cáº§n tá»± query tá»«ng course ná»¯a.

## 31. API Response Thá»±c Táº¿ Cá»§a `/academy/courses`

Endpoint nÃ y lÃ  API catalog cÅ©, váº«n giá»¯ Ä‘á»ƒ tÆ°Æ¡ng thÃ­ch.

Request:

```http
GET /api/academy/courses?page=0&size=12
```

Response:

```json
{
  "success": true,
  "message": "Courses fetched successfully",
  "data": {
    "content": [
      {
        "videoId": "GmOzih6I1zs",
        "title": "Bitcoin Mining Explained",
        "difficulty": "BEGINNER",
        "category": "BLOCKCHAIN",
        "learningPath": "FOUNDATIONS"
      }
    ],
    "page": 0,
    "size": 12,
    "totalElements": 21,
    "totalPages": 2,
    "last": false
  },
  "timestamp": "..."
}
```

Äiá»ƒm khÃ¡c nhau:

```text
/academy/courses -> tráº£ PageResponse, dá»¯ liá»‡u pháº³ng, cÃ³ phÃ¢n trang
/academy/paths   -> tráº£ List<LearningPathDto>, dá»¯ liá»‡u Ä‘Ã£ group theo lá»™ trÃ¬nh
```

UI má»›i dÃ¹ng `/paths` vÃ¬ há»£p vá»›i mÃ n hÃ¬nh learning path hÆ¡n.

## 32. API Cáº­p Nháº­t Progress

Request:

```http
PUT /api/academy/progress/bBC-nXj3Ng4
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "completed": true
}
```

Gateway kiá»ƒm tra JWT. Náº¿u token há»£p lá»‡, Gateway set header:

```http
X-User-Id: 696213ae19b0e3c9dad5aafe
```

Academy Service nháº­n:

```http
PUT /academy/progress/bBC-nXj3Ng4
X-User-Id: 696213ae19b0e3c9dad5aafe
```

Sau Ä‘Ã³ service lÆ°u vÃ o `course_progress`.

Náº¿u khÃ´ng Ä‘Äƒng nháº­p, Gateway tráº£:

```http
401 Unauthorized
```

VÃ¬ váº­y logic báº£o vá»‡ progress náº±m á»Ÿ Gateway, khÃ´ng pháº£i frontend.

## 33. Giáº£i ThÃ­ch CÃ¡c Annotation Hay Gáº·p

### `@Entity`

ÄÃ¡nh dáº¥u class lÃ  JPA entity, tá»©c lÃ  class nÃ y map vá»›i báº£ng database.

VÃ­ dá»¥:

```java
@Entity
@Table(name = "courses")
public class Course
```

### `@Table`

Chá»‰ Ä‘á»‹nh tÃªn báº£ng.

```java
@Table(name = "course_progress")
```

### `@Id`

ÄÃ¡nh dáº¥u khÃ³a chÃ­nh.

### `@GeneratedValue(strategy = GenerationType.IDENTITY)`

NÃ³i vá»›i Hibernate ráº±ng ID do MySQL tá»± tÄƒng.

TÆ°Æ¡ng Ä‘Æ°Æ¡ng:

```sql
AUTO_INCREMENT
```

### `@Column`

Cáº¥u hÃ¬nh column trong database.

VÃ­ dá»¥:

```java
@Column(name = "video_id", nullable = false, unique = true, length = 50)
private String videoId;
```

NghÄ©a lÃ :

```text
column name: video_id
khÃ´ng Ä‘Æ°á»£c null
khÃ´ng Ä‘Æ°á»£c trÃ¹ng
tá»‘i Ä‘a 50 kÃ½ tá»±
```

### `@Enumerated(EnumType.STRING)`

LÆ°u enum dÆ°á»›i dáº¡ng chuá»—i.

VÃ­ dá»¥:

```text
BEGINNER
INTERMEDIATE
ADVANCED
```

KhÃ´ng lÆ°u dáº¡ng sá»‘ `0`, `1`, `2`, vÃ¬ dáº¡ng sá»‘ khÃ³ Ä‘á»c vÃ  dá»… lá»—i náº¿u Ä‘á»•i thá»© tá»± enum.

### `@PrePersist`

Cháº¡y trÆ°á»›c khi insert record má»›i.

Trong `Course`, nÃ³ dÃ¹ng Ä‘á»ƒ set:

```java
createdAt = now
updatedAt = now
```

### `@PreUpdate`

Cháº¡y trÆ°á»›c khi update record.

DÃ¹ng Ä‘á»ƒ cáº­p nháº­t:

```java
updatedAt = now
```

### `@RestController`

ÄÃ¡nh dáº¥u class lÃ  controller tráº£ JSON.

### `@RequestMapping("/academy")`

Táº¥t cáº£ endpoint trong controller cÃ³ prefix `/academy`.

VÃ¬ váº­y:

```java
@GetMapping("/paths")
```

trá»Ÿ thÃ nh:

```text
GET /academy/paths
```

### `@RequiredArgsConstructor`

Lombok tá»± táº¡o constructor cho cÃ¡c field `final`.

Trong controller:

```java
private final AcademyService academyService;
```

Spring dÃ¹ng constructor Ä‘Ã³ Ä‘á»ƒ inject `AcademyService`.

### `@Builder`

Lombok giÃºp táº¡o object kiá»ƒu:

```java
CourseDto.builder()
    .videoId(...)
    .title(...)
    .build();
```

CÃ¡ch nÃ y dá»… Ä‘á»c hÆ¡n constructor dÃ i.

## 34. Giáº£i ThÃ­ch `AcademyService.getLearningPaths()` SÃ¢u HÆ¡n

ÄÃ¢y lÃ  method quan trá»ng nháº¥t.

Code logic cÃ³ thá»ƒ hiá»ƒu theo tá»«ng khá»‘i:

### Khối 1: Lấy dữ liệu phụ

```java
Map<String, CourseProgress> progress = completedProgress(userId);
```

Ý nghĩa:

```text
progress:
  key = videoId
  value = progress completed của user hiện tại
```

`getLearningPaths()` không gọi YouTube API nữa. Lý do là lộ trình học phải mở nhanh và ổn định, còn dữ liệu khóa học chính đã nằm trong MySQL.

Nếu user chưa đăng nhập:

```text
progress = empty map
```

### Khối 2: Lấy course từ DB và sort

```java
courseRepository.findAll().stream()
    .sorted(Comparator
        .comparingInt((Course course) -> pathOrder(pathId(course)))
        .thenComparing(course -> course.getSortOrder() == null ? 0 : course.getSortOrder())
        .thenComparing(Course::getId))
```

Sort theo 3 táº§ng:

1. Thá»© tá»± learning path.
2. Thá»© tá»± bÃ i trong path.
3. ID trong database Ä‘á»ƒ á»•n Ä‘á»‹nh náº¿u trÃ¹ng sortOrder.

### Khá»‘i 3: Merge tá»«ng course

```java
.map(course -> merge(course, null, progress))
```

Má»—i `Course` trong DB Ä‘Æ°á»£c biáº¿n thÃ nh `CourseDto`.

### Khá»‘i 4: Group theo learningPath

```java
.collect(Collectors.groupingBy(
    CourseDto::getLearningPath,
    LinkedHashMap::new,
    Collectors.toList()
))
```

`LinkedHashMap` giÃºp giá»¯ thá»© tá»± Ä‘Ã£ sort.

Náº¿u dÃ¹ng `HashMap`, thá»© tá»± path cÃ³ thá»ƒ bá»‹ Ä‘áº£o ngáº«u nhiÃªn.

### Khá»‘i 5: Táº¡o LearningPathDto

```java
return coursesByPath.entrySet().stream()
    .map(entry -> toLearningPath(entry.getKey(), entry.getValue()))
    .toList();
```

Má»—i group course Ä‘Æ°á»£c biáº¿n thÃ nh má»™t object lá»™ trÃ¬nh há»c.

## 35. Giáº£i ThÃ­ch `merge()` SÃ¢u HÆ¡n

`merge()` lÃ  nÆ¡i ghÃ©p dá»¯ liá»‡u.

NÃ³ báº¯t Ä‘áº§u báº±ng dá»¯ liá»‡u cháº¯c cháº¯n cÃ³ tá»« DB:

```java
CourseDto.builder()
    .id(course.getId())
    .videoId(course.getVideoId())
    .title(course.getTitle())
    .difficulty(...)
    .category(course.getCategory())
    .learningPath(pathId(course))
    .description(course.getDescription())
    .sortOrder(course.getSortOrder())
```

Sau Ä‘Ã³ tá»± build URL:

```java
.embedUrl("https://www.youtube.com/embed/" + course.getVideoId())
.watchUrl("https://www.youtube.com/watch?v=" + course.getVideoId())
```

Sau Ä‘Ã³ gáº¯n progress:

```java
.completed(courseProgress != null)
.completedAt(courseProgress == null ? null : courseProgress.getCompletedAt().toString())
```

á»ž Ä‘Ã¢y chá»‰ map progress completed. VÃ¬ `completedProgress(userId)` chá»‰ láº¥y cÃ¡c dÃ²ng `completed=true`.

Cuá»‘i cÃ¹ng, náº¿u cÃ³ YouTube data:

```java
if (youtube != null) {
    builder.thumbnailUrl(...)
           .duration(...)
           .durationFormatted(...)
           .viewCount(...)
           .likeCount(...)
           .publishedAt(...)
           .channelTitle(...);
}
```

Káº¿t quáº£ lÃ  frontend nháº­n má»™t object Ä‘áº§y Ä‘á»§ Ä‘á»ƒ render.

## 36. Giáº£i ThÃ­ch `updateProgress()` SÃ¢u HÆ¡n

Method nÃ y lÃ  upsert progress.

Upsert nghÄ©a lÃ :

```text
Náº¿u dÃ²ng Ä‘Ã£ tá»“n táº¡i -> update
Náº¿u dÃ²ng chÆ°a tá»“n táº¡i -> insert
```

Code tÃ¬m dÃ²ng cÅ©:

```java
progressRepository.findByUserIdAndVideoId(userId, videoId)
```

Náº¿u khÃ´ng cÃ³, táº¡o má»›i:

```java
.orElseGet(() -> CourseProgress.builder()
    .userId(userId)
    .videoId(videoId)
    .build())
```

Sau Ä‘Ã³ set tráº¡ng thÃ¡i:

```java
progress.setCompleted(completed);
progress.setCompletedAt(completed ? completedAt(progress) : null);
```

Náº¿u user tick hoÃ n thÃ nh:

```text
completed = true
completedAt = now náº¿u trÆ°á»›c Ä‘Ã³ chÆ°a cÃ³
```

Náº¿u user bá» hoÃ n thÃ nh:

```text
completed = false
completedAt = null
```

Sau Ä‘Ã³:

```java
progressRepository.save(progress);
```

Spring Data JPA sáº½ tá»± quyáº¿t Ä‘á»‹nh insert hay update dá»±a trÃªn entity cÃ³ ID hay chÆ°a.

## 37. Quan Há»‡ Giá»¯a Academy VÃ  User Service

Academy Service khÃ´ng query database cá»§a User Service.

NÃ³ chá»‰ nháº­n `userId` tá»« Gateway.

Luá»“ng Ä‘Ãºng SOA:

```text
User Ä‘Äƒng nháº­p
  -> User Service cáº¥p JWT
Frontend lÆ°u JWT
  -> gá»i /api/academy/progress
Gateway verify JWT
  -> láº¥y userId tá»« token
  -> set X-User-Id
Academy Service
  -> lÆ°u progress theo userId
```

Academy khÃ´ng cáº§n biáº¿t email, username, role cá»§a user. NÃ³ chá»‰ cáº§n `userId` Ä‘á»ƒ lÆ°u tiáº¿n Ä‘á»™.

ÄÃ¢y lÃ  cÃ¡ch giáº£m coupling giá»¯a services.

## 38. CÃ¡c CÃ¢u Há»i Giáº£ng ViÃªn CÃ³ Thá»ƒ Há»i

### VÃ¬ sao dÃ¹ng MySQL cho Academy?

VÃ¬ dá»¯ liá»‡u khÃ³a há»c vÃ  progress cÃ³ cáº¥u trÃºc rÃµ rÃ ng:

```text
courses: má»—i dÃ²ng lÃ  má»™t video
course_progress: má»—i dÃ²ng lÃ  progress cá»§a má»™t user vá»›i má»™t video
```

Quan há»‡ nÃ y phÃ¹ há»£p vá»›i relational database.

### VÃ¬ sao khÃ´ng lÆ°u course trong MongoDB nhÆ° cÃ¡c service Ä‘á»“ Ã¡n 1?

Äá»“ Ã¡n 2 muá»‘n thá»ƒ hiá»‡n SOA cÃ³ thá»ƒ dÃ¹ng cÃ´ng nghá»‡ khÃ¡c nhau cho tá»«ng service. Academy dÃ¹ng Java + MySQL Ä‘á»ƒ minh há»a polyglot persistence.

### VÃ¬ sao khÃ´ng gá»i YouTube trá»±c tiáº¿p tá»« frontend?

VÃ¬ backend cáº§n kiá»ƒm soÃ¡t danh sÃ¡ch video nÃ o Ä‘Æ°á»£c Ä‘Æ°a vÃ o há»‡ thá»‘ng. Náº¿u frontend tá»± gá»i YouTube, frontend sáº½ phá»¥ thuá»™c API key vÃ  khÃ³ quáº£n lÃ½ dá»¯ liá»‡u há»c táº­p.

### VÃ¬ sao cáº§n Seeder?

Äá»ƒ service tá»± cÃ³ dá»¯ liá»‡u demo á»•n Ä‘á»‹nh, Ä‘áº·c biá»‡t sau khi MySQL bá»‹ xÃ³a/cÃ i láº¡i.

### VÃ¬ sao progress route cáº§n auth?

VÃ¬ progress lÃ  dá»¯ liá»‡u cÃ¡ nhÃ¢n cá»§a user. KhÃ´ng thá»ƒ cho ngÆ°á»i chÆ°a Ä‘Äƒng nháº­p ghi tiáº¿n Ä‘á»™.

### VÃ¬ sao `/academy/paths` public?

VÃ¬ xem danh sÃ¡ch khÃ³a há»c lÃ  ná»™i dung cÃ´ng khai. NhÆ°ng náº¿u user cÃ³ token, backend sáº½ tráº£ thÃªm progress cÃ¡ nhÃ¢n.

### VÃ¬ sao khÃ´ng lÆ°u completed courses trong JWT?

JWT chá»‰ nÃªn chá»©a thÃ´ng tin xÃ¡c thá»±c cÆ¡ báº£n. Progress thay Ä‘á»•i thÆ°á»ng xuyÃªn, pháº£i lÆ°u trong database.

### VÃ¬ sao `course_progress` khÃ´ng cÃ³ foreign key tá»›i `courses.video_id`?

Code hiá»‡n táº¡i Ä‘áº£m báº£o video tá»“n táº¡i báº±ng:

```java
Course course = findCourse(videoId);
```

Tá»©c lÃ  kiá»ƒm tra á»Ÿ táº§ng service trÆ°á»›c khi lÆ°u progress. Vá»›i Ä‘á»“ Ã¡n nÃ y nhÆ° váº­y Ä‘á»§ gá»n vÃ  dá»… hiá»ƒu.

Náº¿u muá»‘n cháº·t hÆ¡n á»Ÿ má»©c database, cÃ³ thá»ƒ thÃªm quan há»‡ foreign key, nhÆ°ng code sáº½ phá»©c táº¡p hÆ¡n.

## 39. CÃ¡ch Tá»± Test Service Báº±ng API

### Health check

```powershell
Invoke-RestMethod http://localhost:3007/academy/health
```

Ká»³ vá»ng:

```json
{
  "status": "UP",
  "service": "academy-service",
  "version": "1.1.0"
}
```

### Láº¥y learning paths trá»±c tiáº¿p service

```powershell
Invoke-RestMethod http://localhost:3007/academy/paths
```

### Test progress trá»±c tiáº¿p service

Direct service cáº§n tá»± gá»­i `X-User-Id`:

```powershell
Invoke-RestMethod `
  -Method Put `
  -Uri http://localhost:3007/academy/progress/bBC-nXj3Ng4 `
  -Headers @{ "X-User-Id" = "test-user" } `
  -ContentType "application/json" `
  -Body '{"completed":true}'
```

Qua Gateway thÃ¬ khÃ´ng tá»± gá»­i `X-User-Id`; Gateway láº¥y tá»« JWT.

## 40. CÃ¡ch NhÃ¬n Nhanh Trong phpMyAdmin

Trong database `crypto_academy`:

### Báº£ng `courses`

Báº¡n nÃªn tháº¥y khoáº£ng 21 dÃ²ng seed.

CÃ¡c cá»™t Ä‘Ã¡ng xem:

```text
video_id
title
difficulty
category
learning_path
sort_order
```

### Báº£ng `course_progress`

Ban Ä‘áº§u cÃ³ thá»ƒ rá»—ng.

Khi user tick hoÃ n thÃ nh, báº£ng nÃ y cÃ³ dÃ²ng má»›i:

```text
user_id
video_id
completed
completed_at
```

Náº¿u báº¡n test báº±ng `test-user`, sau test cÃ³ thá»ƒ xÃ³a dÃ²ng Ä‘Ã³ Ä‘á»ƒ DB sáº¡ch.

## 41. Admin Course Management

Sau nÃ¢ng cáº¥p má»›i nháº¥t, Academy Service khÃ´ng chá»‰ seed course trong code ná»¯a. Admin Ä‘Ã£ cÃ³ thá»ƒ quáº£n lÃ½ khÃ³a há»c trá»±c tiáº¿p trong Admin Panel.

### Ã tÆ°á»Ÿng thiáº¿t káº¿

Nguá»“n dá»¯ liá»‡u chÃ­nh váº«n lÃ  MySQL:

```text
crypto_academy.courses
```

YouTube chá»‰ lÃ  nÆ¡i cung cáº¥p video vÃ  metadata. Playlist khÃ´ng pháº£i database chÃ­nh.

Luá»“ng Ä‘Ãºng hiá»‡n táº¡i:

```text
Admin dÃ¡n link YouTube hoáº·c nháº­p videoId
  -> Frontend gá»i API admin
  -> Gateway kiá»ƒm tra JWT + quyá»n admin
  -> Academy Service tÃ¡ch videoId
  -> LÆ°u course vÃ o MySQL
  -> YouTubeProvider lấy thêm thumbnail/thời lượng nếu có API key; nếu không có key thì vẫn lưu course bình thường
```

Vì vậy video admin thêm mới không cần nằm trong playlist. Project hiện tại đã bỏ chức năng playlist để code gọn hơn; mỗi khóa học được quản lý trực tiếp bằng một link YouTube hoặc videoId trong MySQL.

### API admin má»›i

CÃ¡c endpoint má»›i trong `AcademyController`:

| Method | Path | Vai trÃ² |
|---|---|---|
| POST | `/academy/admin/courses/preview` | Preview metadata tá»« link YouTube/videoId |
| POST | `/academy/admin/courses` | Táº¡o khÃ³a há»c má»›i |
| PUT | `/academy/admin/courses/{id}` | Cáº­p nháº­t khÃ³a há»c |
| DELETE | `/academy/admin/courses/{id}` | XÃ³a khÃ³a há»c |

Qua API Gateway:

```text
/api/academy/admin/*
```

Route nÃ y Ä‘Æ°á»£c báº£o vá»‡ trong `backend/api-gateway/server.js` báº±ng:

```text
authMiddleware + adminMiddleware
```

NghÄ©a lÃ  user thÆ°á»ng khÃ´ng thá»ƒ thÃªm/sá»­a/xÃ³a khÃ³a há»c.

### `CourseRequest.java`

File má»›i:

```text
academy-service/src/main/java/com/cryptotrading/academy/model/CourseRequest.java
```

ÄÃ¢y lÃ  request body admin gá»­i lÃªn khi táº¡o/sá»­a course:

```text
youtubeUrl
videoId
title
difficulty
category
learningPath
description
sortOrder
```

Admin cÃ³ thá»ƒ nháº­p `youtubeUrl` hoáº·c `videoId`. Backend sáº½ Æ°u tiÃªn láº¥y videoId tá»« dá»¯ liá»‡u gá»­i lÃªn.

CÃ¡c dáº¡ng link Ä‘Æ°á»£c há»— trá»£:

```text
https://www.youtube.com/watch?v=bBC-nXj3Ng4
https://youtu.be/bBC-nXj3Ng4
https://www.youtube.com/embed/bBC-nXj3Ng4
https://www.youtube.com/shorts/bBC-nXj3Ng4
bBC-nXj3Ng4
```

### Logic trong `AcademyService`

CÃ¡c method admin chÃ­nh:

```text
previewCourse()
createCourse()
updateCourse()
deleteCourse()
```

`previewCourse()`:

```text
Láº¥y videoId tá»« link
Gá»i YouTubeProvider.fetchSingleVideo(videoId)
Tráº£ CourseDto preview cho frontend
```

`createCourse()`:

```text
Validate videoId
Kiá»ƒm tra videoId Ä‘Ã£ tá»“n táº¡i chÆ°a
Táº¡o Course má»›i
LÆ°u vÃ o courses
Tráº£ CourseDto Ä‘Ã£ merge metadata YouTube
```

`updateCourse()`:

```text
TÃ¬m Course theo id
Náº¿u Ä‘á»•i videoId thÃ¬ kiá»ƒm tra trÃ¹ng
Cáº­p nháº­t title/category/difficulty/learningPath/description/sortOrder
LÆ°u láº¡i vÃ o courses
```

Náº¿u admin Ä‘á»•i videoId cá»§a course, service xÃ³a progress cÅ© theo videoId cÅ© Ä‘á»ƒ trÃ¡nh dá»¯ liá»‡u tiáº¿n Ä‘á»™ bá»‹ gáº¯n nháº§m sang video má»›i.

`deleteCourse()`:

```text
TÃ¬m course theo id
XÃ³a course_progress theo videoId
XÃ³a course
```

### Frontend Admin Panel

File:

```text
frontend/src/pages/Admin.jsx
```

Admin Panel hiá»‡n cÃ³ 2 tab:

```text
NgÆ°á»i dÃ¹ng
KhÃ³a há»c
```

Tab khÃ³a há»c cho phÃ©p:

- xem danh sÃ¡ch courses
- lá»c theo category/difficulty
- dÃ¡n link YouTube hoáº·c videoId
- preview metadata YouTube
- thÃªm khÃ³a há»c
- sá»­a khÃ³a há»c
- xÃ³a khÃ³a há»c
- má»Ÿ video trÃªn YouTube

API helper náº±m trong:

```text
frontend/src/services/api.js
```

CÃ¡c hÃ m má»›i:

```javascript
getAcademyCourses()
previewAcademyCourse()
createAcademyCourse()
updateAcademyCourse()
deleteAcademyCourse()
```

## 42. Káº¿t Luáº­n Dá»… Nhá»›

Náº¿u pháº£i nhá»› Academy Service báº±ng má»™t hÃ¬nh áº£nh, hÃ£y nhá»›:

```text
courses = giÃ¡o trÃ¬nh
course_progress = sá»• theo dÃµi há»c táº­p cá»§a tá»«ng user
AcademySeeder = ngÆ°á»i nháº­p sáºµn giÃ¡o trÃ¬nh máº«u
YouTubeProvider = ngÆ°á»i láº¥y thÃªm áº£nh/thá»i lÆ°á»£ng/lÆ°á»£t xem tá»« YouTube
AcademyService = ngÆ°á»i gom má»i thá»© láº¡i thÃ nh lá»™ trÃ¬nh há»c
AcademyController = cá»•ng API
API Gateway = ngÆ°á»i gÃ¡c cá»•ng xÃ¡c thá»±c
Academy.jsx = mÃ n hÃ¬nh hiá»ƒn thá»‹ cho user
```

Khi hiá»ƒu theo cÃ¡ch nÃ y, service khÃ´ng cÃ²n lÃ  má»™t Ä‘á»‘ng file rá»i ráº¡c ná»¯a. NÃ³ lÃ  má»™t luá»“ng ráº¥t rÃµ: seed khÃ³a há»c, láº¥y lá»™ trÃ¬nh, xem video, lÆ°u tiáº¿n Ä‘á»™.

## 43. Trạng Thái Sau Khi Dọn Code Mới Nhất

Những điểm đã chốt theo code hiện tại:

```text
- Không còn chức năng YouTube playlist/import playlist.
- Không còn cấu hình youtube.playlist-id trong application.yml.
- Không còn YOUTUBE_PLAYLIST_ID trong start.ps1.
- Không còn method invalidateCache() trong YouTubeProvider vì hiện không có endpoint nào gọi.
- backend/start-all-services.ps1 không ép MySQL password 123456 nữa; dùng DB_USERNAME/DB_PASSWORD, mặc định root/password rỗng.
```

Những phần vẫn giữ vì đang phục vụ chức năng:

```text
- YouTubeProvider.fetchSingleVideo(videoId): dùng cho preview/detail/tạo/sửa course.
- YouTubeResponse.java: map response của YouTube videos.list.
- CourseRequest.java: request body cho Admin tạo/sửa/preview course.
- CourseProgress.java và CourseProgressRepository.java: lưu tiến độ học theo user.
```

Kết luận hiện tại: dữ liệu khóa học chuẩn nằm trong MySQL. Admin quản lý course bằng link YouTube hoặc videoId. YouTube API chỉ là phần phụ để lấy metadata một video, không bắt buộc và không liên quan playlist.
