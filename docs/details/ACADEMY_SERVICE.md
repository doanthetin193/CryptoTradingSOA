# Academy Service - Detail Notes

Tai lieu nay mo ta `academy-service` theo dung source hien tai sau khi da clean cho Do an 2.

## 1. Muc Tieu

Academy Service la Java Spring Boot service chay o port `3007`, phu trach:

- Quan ly danh sach video/khoa hoc crypto.
- Luu course trong MySQL database rieng `crypto_academy`.
- Luu tien do hoc cua tung user.
- Gom course thanh learning path.
- Seed san 21 video mau khi DB rong.
- Cho admin them/sua/xoa course bang link YouTube hoac videoId.
- Lay them metadata cua mot video tu YouTube API neu co `YOUTUBE_API_KEY`.

Day la service stateful vi can luu course va progress ben vung.

## 2. Database Va SOA

Database:

```text
crypto_academy
```

Bang:

```text
courses
course_progress
```

Dieu nay khong vi pham SOA. SOA khong bat buoc moi service chi co mot bang. Nguyen tac dung la moi service so huu database/schema rieng va service khac khong truy cap truc tiep database do.

## 3. Source Chinh

```text
academy-service/
  src/main/java/com/cryptotrading/academy/
    AcademyServiceApplication.java
    config/AcademySeeder.java
    config/AppConfig.java
    controller/AcademyController.java
    model/Course.java
    model/CourseProgress.java
    model/CourseDto.java
    model/CourseRequest.java
    model/LearningPathDto.java
    model/PageResponse.java
    model/ProgressRequest.java
    model/YouTubeResponse.java
    provider/YouTubeProvider.java
    repository/CourseRepository.java
    repository/CourseProgressRepository.java
    service/AcademyService.java
    exception/*
  src/main/resources/application.yml
```

Thu tu doc de de hieu:

1. `Course.java`
2. `CourseProgress.java`
3. `AcademySeeder.java`
4. `CourseRepository.java`
5. `CourseProgressRepository.java`
6. `AcademyController.java`
7. `AcademyService.java`
8. `YouTubeProvider.java`
9. `frontend/src/pages/Academy.jsx`
10. `frontend/src/pages/Admin.jsx`

## 4. Luong Trang Academy

```text
Frontend /academy
  -> GET /api/academy/paths
API Gateway
  -> optionalAuth
  -> neu co JWT thi set X-User-Id
  -> GET /academy/paths
AcademyController
  -> academyService.getLearningPaths(userId)
AcademyService
  -> lay courses tu MySQL
  -> lay completed progress neu co userId
  -> merge Course + Progress thanh CourseDto
  -> group theo learningPath
Frontend
  -> render learning path + course cards
```

Quan trong: `/academy/paths` hien tai khong goi YouTube API. Trang hoc mo nhanh va on dinh nho du lieu chinh nam trong MySQL.

## 5. Entity `Course`

Map voi bang `courses`.

Field chinh:

```text
id
videoId
title
difficulty     - BEGINNER | INTERMEDIATE | ADVANCED
category       - BLOCKCHAIN, SECURITY, DEFI...
learningPath   - FOUNDATIONS, SECURITY_BASICS...
description
sortOrder
createdAt
updatedAt
```

`videoId` la ID 11 ky tu cua YouTube, vi du:

```text
bBC-nXj3Ng4
```

## 6. Entity `CourseProgress`

Map voi bang `course_progress`.

Field chinh:

```text
id
userId
videoId
completed
completedAt
updatedAt
```

Unique constraint:

```text
user_id + video_id
```

Nghia la mot user chi co mot dong progress cho mot video.

## 7. Seeder

File:

```text
AcademySeeder.java
```

Seeder chay khi service start bang `CommandLineRunner`.

Trach nhiem:

- Neu DB chua co course thi seed du lieu mau.
- Seed 21 course chia theo learning path.
- Bo qua cac videoId trong `BROKEN_SEED_VIDEO_IDS`.
- Khong phai scheduled task.

Vi seeder khong phai scheduler nen Academy khong can `@EnableScheduling`.

## 8. `AcademyService`

File trung tam:

```text
AcademyService.java
```

Method chinh:

```text
getCourses()
  -> lay courses dang paging/filter
  -> khong goi YouTube API

getLearningPaths()
  -> lay tat ca courses
  -> merge progress
  -> group thanh learning path
  -> khong goi YouTube API

getCourseByVideoId()
  -> lay course chi tiet
  -> co goi YouTubeProvider.fetchSingleVideo(videoId)

updateProgress()
  -> yeu cau userId
  -> upsert course_progress
  -> khong goi YouTube API

previewCourse()
  -> admin preview link/videoId
  -> co goi YouTubeProvider.fetchSingleVideo(videoId)

createCourse()
  -> admin tao course
  -> luu MySQL
  -> co the lay metadata single video neu co key

updateCourse()
  -> admin sua course
  -> neu doi videoId thi xoa progress cu cua video cu

deleteCourse()
  -> xoa course
  -> xoa progress lien quan
```

## 9. YouTubeProvider

File:

```text
YouTubeProvider.java
```

Trang thai hien tai:

- Chi con `fetchSingleVideo(videoId)`.
- Khong con playlist import.
- Khong con `fetchPlaylistVideos()`.
- Khong con `invalidateCache()`.
- Khong can `YOUTUBE_PLAYLIST_ID`.
- Khong co `youtube.playlist-id` trong `application.yml`.

Neu co `YOUTUBE_API_KEY`, provider goi:

```text
GET https://www.googleapis.com/youtube/v3/videos
```

De lay metadata:

```text
title
description
thumbnailUrl
duration
durationFormatted
viewCount
likeCount
publishedAt
channelTitle
```

Neu khong co key hoac API loi, service van tra minimal DTO:

```text
videoId
embedUrl
watchUrl
```

Vi du: Admin van co the luu course bang title/description nhap tay.

## 10. Admin Course Management

Endpoint service:

```text
POST   /academy/admin/courses/preview
POST   /academy/admin/courses
PUT    /academy/admin/courses/{id}
DELETE /academy/admin/courses/{id}
```

Qua Gateway:

```text
/api/academy/admin/*
```

Gateway bao ve route admin bang:

```text
authMiddleware + adminMiddleware
```

Frontend:

```text
frontend/src/pages/Admin.jsx
```

Admin co the:

- Dan link YouTube hoac nhap videoId.
- Preview metadata neu co API key.
- Nhap/sua title, difficulty, category, learningPath, sortOrder, description.
- Them course.
- Sua course.
- Xoa course.
- Loc danh sach course.
- Phan trang danh sach course trong admin.

## 11. API Public

Service port:

```text
GET /academy/health
GET /academy/courses
GET /academy/courses/{videoId}
GET /academy/paths
PUT /academy/progress/{videoId}
```

Gateway:

```text
GET /api/academy/health
GET /api/academy/courses
GET /api/academy/courses/{videoId}
GET /api/academy/paths
PUT /api/academy/progress/{videoId}
```

Route progress bat buoc dang nhap. Gateway set `X-User-Id`, frontend khong tu set header nay.

## 12. Config

```yaml
server:
  port: 3007

spring:
  application:
    name: academy-service
  datasource:
    url: jdbc:mysql://localhost:3306/crypto_academy...
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

`DB_PASSWORD` mac dinh rong de hop voi XAMPP MySQL local.

## 13. CORS

`AppConfig.java` hien cho phep:

```text
GET, POST, PUT, DELETE, OPTIONS
```

Dieu nay can cho Admin Panel vi preview/create/update/delete dung POST/PUT/DELETE.

## 14. Test Va Trang Thai Hien Tai

Da kiem tra:

```text
academy-service: mvnw test pass
GET http://localhost:3007/academy/health -> 200
GET http://localhost:3000/api/academy/health -> 200
GET http://localhost:3000/api/academy/paths -> 200
```

Frontend build pass. Warning chunk lon cua Vite khong phai loi chay app.

## 15. Nhung Thu Khong Con Dung

Academy Service hien tai khong dung:

- YouTube playlist import.
- `YOUTUBE_PLAYLIST_ID`.
- `youtube.playlist-id`.
- `fetchPlaylistVideos()`.
- `playlistItems`.
- `invalidateCache()`.

Admin quan ly course truc tiep trong MySQL bang link YouTube/videoId. Day la cach gon va de trinh bay hon playlist.

## 16. Cau Trinh Bay Ngan

Academy Service la Java Spring Boot service so huu database MySQL `crypto_academy`, luu danh sach khoa hoc trong `courses` va tien do user trong `course_progress`. Frontend dung `/api/academy/paths` de lay lo trinh hoc, Gateway truyen `X-User-Id` neu user da dang nhap de service gan progress. Admin co CRUD course bang link YouTube/videoId. YouTube API chi la phan phu de lay metadata cho mot video khi preview/detail/create/update, khong bat buoc va khong con playlist.
