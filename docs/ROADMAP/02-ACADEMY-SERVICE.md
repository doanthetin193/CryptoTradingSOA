# KẾ HOẠCH PHÁT TRIỂN ACADEMY SERVICE (YOUTUBE EDITION)

**Ngày lập:** 03/04/2026  
**Phiên bản:** 1.0  
**Trạng thái:** Chuẩn bị phát triển

---

## I. MỤC TIÊU CỦA ACADEMY SERVICE

### 1.1. Mục tiêu chính

- Cung cấp **khóa học crypto từ YouTube** cho người dùng
- Giáo dục: Giúp người dùng hiểu rõ kiến thức crypto trước khi giao dịch
- Gamification: Hoàn thành video + quiz → badge, score tracking
- Tăng **engagement** & **retention** của ứng dụng

### 1.2. Mục tiêu phụ

- Tích hợp YouTube API (show cách gọi external API)
- Service độc lập, không ảnh hưởng services khác
- Lightweight database (metadata only cache)
- Easy to scale (thêm video = chỉ thêm row DB)

---

## II. PHẠM VI (SCOPE)

### 2.1. Chức năng chính

1. **Danh sách khóa học (Courses List)**
   - Fetch video từ YouTube Playlist
   - Cache metadata (24h TTL)
   - Display: title, thumbnail, duration, order

2. **YouTube Integration**
   - Call YouTube API mỗi lần user request (hoặc periodically)
   - Parse video metadata
   - Embed YouTube player link trong response

3. **Quiz per Video**
   - Mỗi video có 5-10 câu hỏi
   - Multiple choice
   - Score calculation
   - Store user score

4. **User Progress Tracking**
   - Track: video nào xem rồi, quiz score
   - Calculate total progress %
   - Badge system (hoàn thành 5 video → badge)

5. **API Endpoints**
   - GET `/courses` - List all courses
   - GET `/courses/{videoId}` - Get course detail + YouTube link
   - GET `/courses/{videoId}/quiz` - Get quiz questions
   - POST `/courses/{videoId}/submit-quiz` - Submit answers & get score
   - GET `/progress` - User progress tracking
   - GET `/health` - Health check

### 2.2. Chức năng không bao gồm

- ❌ Video upload (chỉ link YouTube)
- ❌ Streaming video (YouTube handle)
- ❌ Live comments on videos
- ❌ Leaderboard (có thể thêm sau)
- ❌ Certificate generation (future feature)

---

## III. KIẾN TRÚC KỸ THUẬT

### 3.1. Tech Stack

| Thành phần            | Công nghệ            | Phiên bản | Lý do                         |
| --------------------- | -------------------- | --------- | ----------------------------- |
| **Language**          | JavaScript (Node.js) | 18+ LTS   | Consistency với hiện tại      |
| **Framework**         | Express.js           | 4.18+     | Lightweight, familiar         |
| **Database**          | MongoDB              | 6.x       | Same as other services        |
| **External API**      | YouTube Data API v3  | Latest    | Free tier, 10K quota/day      |
| **Cache**             | node-cache + MongoDB | -         | Simple in-memory + persistent |
| **Service Discovery** | Consul               | Latest    | Same as other services        |

### 3.2. Sơ đồ Kiến Trúc Tích Hợp

```
┌─────────────────────────────────────────────────────┐
│                    REACT FRONTEND                   │
│                   (Port 5173)                       │
└────────────────────────┬────────────────────────────┘
                         │ HTTP
                         ▼
┌─────────────────────────────────────────────────────┐
│              API GATEWAY (Node.js)                  │
│              (Port 3000)                            │
│  ┌───────────────────────────────────────────────┐ │
│  │ /api/academy/... → proxy to Academy Service  │ │
│  └───────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│         ACADEMY SERVICE (Node.js)                   │
│         Port: 3007                                  │
│  ┌────────────────────────────────────────────────┐│
│  │ AcademyController                              ││
│  │ ├── GET /courses → List videos                 ││
│  │ ├── GET /courses/{id} → Detail + YouTube link  ││
│  │ ├── GET /courses/{id}/quiz → Quiz questions    ││
│  │ ├── POST /courses/{id}/submit-quiz → Score     ││
│  │ └── GET /progress → User progress              ││
│  ├────────────────────────────────────────────────┤│
│  │ AcademyService                                  ││
│  │ ├── fetchCoursesFromYouTube()                   ││
│  │ ├── getCoursesFromCache()                       ││
│  │ ├── calculateQuizScore()                        ││
│  │ └── trackUserProgress()                         ││
│  ├────────────────────────────────────────────────┤│
│  │ YouTubeProvider                                 ││
│  │ └── callYouTubeAPI()                            ││
│  ├────────────────────────────────────────────────┤│
│  │ node-cache (In-memory)                          ││
│  │ └── Cache course metadata (24h TTL)             ││
│  └────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
    ┌─────────┐  ┌────────────┐  ┌─────────────┐
    │ MongoDB │  │   YouTube  │  │   Consul    │
    │ (DB)    │  │ Data API   │  │ (Discovery) │
    └─────────┘  └────────────┘  └─────────────┘
```

### 3.3. Service Discovery via Consul

**Registration Config:**

```yaml
# application.yml (tương tự các services khác)
spring:
  application:
    name: academy-service

# hoặc trong khi start service:
const consul = require('consul');
consul.agent.service.register({
  id: 'academy-service-3007',
  name: 'academy-service',
  address: 'localhost',
  port: 3007,
  check: {
    http: 'http://localhost:3007/health',
    interval: '10s'
  }
});
```

---

## IV. API DESIGN

### 4.1. API Endpoints

#### 4.1.1. GET /courses - Danh sách khóa học

**Request:**

```http
GET /courses?page=1&limit=10
```

**Query Parameters:**
| Tham số | Kiểu | Mặc định | Mô tả |
|--------|-----|---------|-------|
| page | int | 1 | Trang (1-based) |
| limit | int | 10 | Khóa học trên trang (max 50) |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "videoId": "dQw4w9WgXcQ",
        "title": "Bitcoin 101 - What is Bitcoin?",
        "description": "Learn the basics of Bitcoin",
        "duration": 600,
        "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg",
        "youtubeUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ",
        "channelTitle": "Crypto Academy",
        "order": 1,
        "publishedAt": "2026-01-15T10:00:00Z",
        "completed": false,
        "userScore": null
      },
      {
        "videoId": "xyz789",
        "title": "Ethereum Smart Contracts Explained",
        "description": "Deep dive into Ethereum smart contracts",
        "duration": 1200,
        "thumbnail": "https://...",
        "youtubeUrl": "https://youtube.com/watch?v=xyz789",
        "channelTitle": "Crypto Academy",
        "order": 2,
        "publishedAt": "2026-01-16T10:00:00Z",
        "completed": true,
        "userScore": 90
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "pages": 2,
      "hasNext": true
    },
    "cachedAt": "2026-04-03T10:30:00Z",
    "cacheExpiry": "2026-04-04T10:30:00Z"
  }
}
```

**Response (503 Service Unavailable):**

```json
{
  "success": false,
  "message": "YouTube API temporarily unavailable",
  "error": "quota_exceeded"
}
```

---

#### 4.1.2. GET /courses/{videoId} - Chi tiết khóa học

**Request:**

```http
GET /courses/dQw4w9WgXcQ
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Bitcoin 101 - What is Bitcoin?",
    "description": "Learn the basics of Bitcoin",
    "duration": 600,
    "thumbnail": "https://...",
    "youtubeUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "channelTitle": "Crypto Academy",
    "order": 1,
    "publishedAt": "2026-01-15T10:00:00Z",
    "tags": ["bitcoin", "crypto", "beginner"]
  }
}
```

---

#### 4.1.3. GET /courses/{videoId}/quiz - Lấy câu hỏi quiz

**Request:**

```http
GET /courses/dQw4w9WgXcQ/quiz
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Bitcoin 101 - Quiz",
    "passingScore": 70,
    "questions": [
      {
        "id": 1,
        "question": "Bitcoin được tạo ra năm nào?",
        "options": ["2008", "2009", "2010", "2011"],
        "hint": "Ngay sau cuộc khủng hoảng tài chính toàn cầu"
      },
      {
        "id": 2,
        "question": "Ai là tác giả của Bitcoin?",
        "options": [
          "Vitalik Buterin",
          "Satoshi Nakamoto",
          "Charlie Lee",
          "Andreas M. Antonopoulos"
        ]
      },
      {
        "id": 3,
        "question": "Bitcoin sử dụng công nghệ gì?",
        "options": ["Database", "Blockchain", "API", "Cloud Storage"]
      },
      {
        "id": 4,
        "question": "Một Bitcoin gồm bao nhiêu Satoshi?",
        "options": ["100,000", "1,000,000", "10,000,000", "100,000,000"]
      },
      {
        "id": 5,
        "question": "Bitcoin có giới hạn supply bao nhiêu coins?",
        "options": ["10 triệu", "21 triệu", "100 triệu", "Không giới hạn"]
      }
    ]
  }
}
```

---

#### 4.1.4. POST /courses/{videoId}/submit-quiz - Nộp bài quiz

**Request:**

```http
POST /courses/dQw4w9WgXcQ/submit-quiz
Content-Type: application/json

{
  "answers": [2, 2, 2, 4, 2]  // Index của đáp án trong options array
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "videoId": "dQw4w9WgXcQ",
    "totalQuestions": 5,
    "correctAnswers": 4,
    "score": 80,
    "passed": true,
    "passingScore": 70,
    "feedback": "Rất tốt! Bạn vượt qua bài kiểm tra.",
    "badge": {
      "earned": true,
      "name": "Bitcoin Explorer",
      "icon": "🔍",
      "description": "Hoàn thành khóa học Bitcoin 101"
    },
    "nextCourse": {
      "videoId": "xyz789",
      "title": "Ethereum Smart Contracts Explained"
    }
  }
}
```

**Response (200 OK - Failed):**

```json
{
  "success": true,
  "data": {
    "score": 60,
    "passed": false,
    "feedback": "Chưa đạt yêu cầu. Hãy xem lại video và thử lại."
  }
}
```

---

#### 4.1.5. GET /progress - Tiến độ người dùng

**Request:**

```http
GET /progress
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "totalCourses": 15,
    "completedCourses": 5,
    "progressPercentage": 33.3,
    "totalXP": 450,
    "badges": [
      {
        "name": "Bitcoin Explorer",
        "earnedAt": "2026-04-01T14:30:00Z"
      },
      {
        "name": "Ethereum Master",
        "earnedAt": "2026-04-02T10:15:00Z"
      }
    ],
    "courseProgress": [
      {
        "videoId": "dQw4w9WgXcQ",
        "title": "Bitcoin 101",
        "completed": true,
        "score": 95,
        "completedAt": "2026-04-01T14:30:00Z"
      },
      {
        "videoId": "xyz789",
        "title": "Ethereum Smart Contracts",
        "completed": true,
        "score": 85,
        "completedAt": "2026-04-02T10:15:00Z"
      },
      {
        "videoId": "abc123",
        "title": "DeFi Basics",
        "completed": false,
        "score": null
      }
    ]
  }
}
```

---

#### 4.1.6. GET /health - Health Check

**Request:**

```http
GET /health
```

**Response (200 OK):**

```json
{
  "status": "UP",
  "service": "academy-service",
  "version": "1.0.0",
  "timestamp": "2026-04-03T10:40:00Z",
  "youtube": {
    "status": "connected",
    "quotaUsed": 450,
    "quotaRemaining": 9550,
    "resetTime": "2026-04-04T00:00:00Z"
  },
  "cache": {
    "coursesCount": 15,
    "lastFetched": "2026-04-03T10:30:00Z",
    "nextRefresh": "2026-04-04T10:30:00Z"
  }
}
```

---

## V. YOUTUBE API INTEGRATION

### 5.1. Setup YouTube API

**Step 1: Google Cloud Console**

```
1. Go to: https://console.cloud.google.com
2. Create new project: "CryptoTradingSOA"
3. Search for: "YouTube Data API v3"
4. Click "Enable"
5. Create credentials:
   - Type: API Key
   - Copy key → add to .env
```

**Step 2: Create YouTube Playlist**

```
1. Go to: https://youtube.com/
2. Create playlist: "Crypto Academy"
3. Add 15-20 videos:
   - Search: "Bitcoin explained", "Ethereum tutorial", etc.
   - Add video → Playlist
4. Copy Playlist ID from URL:
   - URL: https://youtube.com/playlist?list=PLxxxxx
   - ID: PLxxxxx
```

**Step 3: .env configuration**

```bash
# .env (backend folder)
YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx
YOUTUBE_PLAYLIST_ID=PLxxxxx
YOUTUBE_CACHE_TTL=86400  # 24 hours
```

### 5.2. YouTube API Quota

**Free Tier Quota:**

- 10,000 units per day
- 1 request = 1-3 units typically

**Estimate Usage:**

```
Per user per day:
- List courses: 1 unit
- Get quiz: 1 unit
- Submit quiz: 1 unit (max)
Total: ~3 units

For 1000 users/day:
- ~3,000 quota needed
- ✅ Within free limit!
```

### 5.3. Code Example - Call YouTube API

```javascript
// academy-service/providers/youtubeProvider.js

const axios = require("axios");
const logger = require("../../../shared/utils/logger");

class YouTubeProvider {
  async fetchPlaylist() {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const PLAYLIST_ID = process.env.YOUTUBE_PLAYLIST_ID;

    try {
      logger.info(`🎥 Fetching YouTube playlist: ${PLAYLIST_ID}`);

      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/playlistItems",
        {
          params: {
            playlistId: PLAYLIST_ID,
            part: "snippet,contentDetails",
            maxResults: 50,
            key: API_KEY,
          },
        },
      );

      const courses = response.data.items.map((item, idx) => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default.url,
        youtubeUrl: `https://youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
        channelTitle: item.snippet.channelTitle,
        order: idx + 1,
        publishedAt: item.snippet.publishedAt,
      }));

      logger.info(`✅ Fetched ${courses.length} videos from YouTube`);
      return courses;
    } catch (error) {
      logger.error(`❌ YouTube API error: ${error.message}`);
      throw new Error("Failed to fetch YouTube playlist");
    }
  }

  async getVideoDetails(videoId) {
    const API_KEY = process.env.YOUTUBE_API_KEY;

    try {
      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/videos",
        {
          params: {
            id: videoId,
            part: "snippet,contentDetails,statistics",
            key: API_KEY,
          },
        },
      );

      return response.data.items[0];
    } catch (error) {
      logger.error(`Failed to get video details: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new YouTubeProvider();
```

---

## VI. DATABASE DESIGN

### 6.1. Collections

#### academy_courses (Metadata cache)

```javascript
// Collection: academy_courses
{
  _id: ObjectId,
  videoId: "dQw4w9WgXcQ",
  title: "Bitcoin 101 - What is Bitcoin?",
  description: "Learn the basics of Bitcoin",
  duration: 600,
  thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg",
  youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
  channelTitle: "Crypto Academy",
  order: 1,
  publishedAt: "2026-01-15T10:00:00Z",
  tags: ["bitcoin", "crypto", "beginner"],
  createdAt: "2026-04-03T10:00:00Z",
  updatedAt: "2026-04-03T10:00:00Z"
}
```

**Index:** `db.academy_courses.createIndex({ "videoId": 1 })`

---

#### academy_quizzes (Câu hỏi)

```javascript
// Collection: academy_quizzes
{
  _id: ObjectId,
  videoId: "dQw4w9WgXcQ",
  title: "Bitcoin 101 - Quiz",
  passingScore: 70,
  questions: [
    {
      id: 1,
      question: "Bitcoin được tạo ra năm nào?",
      options: ["2008", "2009", "2010", "2011"],
      correct: 1,  // Index of correct answer
      hint: "Ngay sau cuộc khủng hoảng tài chính"
    },
    {
      id: 2,
      question: "Ai là tác giả của Bitcoin?",
      options: ["Vitalik Buterin", "Satoshi Nakamoto", "Charlie Lee", "Andreas M. Antonopoulos"],
      correct: 1
    },
    // ... more questions
  ],
  createdAt: "2026-04-03T10:00:00Z"
}
```

**Index:** `db.academy_quizzes.createIndex({ "videoId": 1 })`

---

#### academy_user_progress (Progress tracking)

```javascript
// Collection: academy_user_progress
{
  _id: ObjectId,
  userId: "user123",
  videoId: "dQw4w9WgXcQ",
  completed: true,
  score: 95,
  attempts: 1,
  completedAt: "2026-04-01T14:30:00Z",
  createdAt: "2026-04-01T14:00:00Z",
  updatedAt: "2026-04-01T14:30:00Z"
}
```

**Index:** `db.academy_user_progress.createIndex({ "userId": 1, "videoId": 1 })`

---

#### academy_badges (Badge definitions)

```javascript
// Collection: academy_badges
{
  _id: ObjectId,
  badgeId: "bitcoin-explorer",
  name: "Bitcoin Explorer",
  description: "Hoàn thành khóa học Bitcoin 101",
  icon: "🔍",
  requirement: {
    type: "complete_course",
    videoId: "dQw4w9WgXcQ"
  },
  createdAt: "2026-04-03T10:00:00Z"
}
```

---

#### academy_user_badges (User earned badges)

```javascript
// Collection: academy_user_badges
{
  _id: ObjectId,
  userId: "user123",
  badgeId: "bitcoin-explorer",
  earnedAt: "2026-04-01T14:30:00Z"
}
```

**Index:** `db.academy_user_badges.createIndex({ "userId": 1 })`

---

### 6.2. Database Size Estimate

| Collection                              | Entries | Size/Entry | Total     |
| --------------------------------------- | ------- | ---------- | --------- |
| academy_courses                         | 15      | ~400 bytes | 6 KB      |
| academy_quizzes                         | 15      | ~1.5 KB    | 22.5 KB   |
| academy_badges                          | 10      | ~200 bytes | 2 KB      |
| user_progress (1000 users × 15 courses) | 15,000  | ~300 bytes | 4.5 MB    |
| user_badges (1000 users × avg 3)        | 3,000   | ~150 bytes | 450 KB    |
| **TOTAL**                               | -       | -          | **~5 MB** |

✅ **Siêu nhẹ!** (so với full text content)

---

## VII. IMPLEMENTATION PLAN

### 7.1. Timeline (Chi tiết)

#### Phase 1: Setup & YouTube Integration (1 ngày)

**Day 1 - Setup Project**

| Công việc                                               | Thời gian   | Kết quả                      |
| ------------------------------------------------------- | ----------- | ---------------------------- |
| Create Express project folder                           | 30 phút     | ✅ `academy-service/` ready  |
| Install dependencies (express, mongoose, axios, dotenv) | 30 phút     | ✅ package.json configured   |
| Setup .env (YouTube API key, Playlist ID)               | 30 phút     | ✅ .env file created         |
| Setup Consul registration                               | 30 phút     | ✅ Service discoverable      |
| Setup logging                                           | 30 phút     | ✅ Winston logger configured |
| **Total Day 1:**                                        | **2.5 giờ** |                              |

---

#### Phase 2: Core Development (2-2.5 ngày)

**Day 2 - Models & YouTube Provider**

| Công việc                                       | Thời gian | Kết quả                     |
| ----------------------------------------------- | --------- | --------------------------- |
| Create Course, Quiz, Badge, UserProgress models | 1.5 giờ   | ✅ Mongoose schemas defined |
| Implement YouTubeProvider (fetch playlist)      | 1.5 giờ   | ✅ API call working         |
| Setup in-memory cache (node-cache)              | 1 giờ     | ✅ Cache 24h TTL            |
| Test YouTube API call                           | 1 giờ     | ✅ Real data fetched        |
| **Subtotal Day 2:**                             | **5 giờ** |                             |

**Day 3 - Controllers & Services**

| Công việc                                 | Thời gian   | Kết quả              |
| ----------------------------------------- | ----------- | -------------------- |
| Implement AcademyService (business logic) | 1.5 giờ     | ✅ Services coded    |
| Implement AcademyController (endpoints)   | 2 giờ       | ✅ All 6 endpoints   |
| Quiz scoring logic                        | 1 giờ       | ✅ Score calculation |
| User progress tracking                    | 1 giờ       | ✅ Progress saved    |
| **Subtotal Day 3:**                       | **5.5 giờ** |                      |

**Day 4 - Exception Handling & Validation**

| Công việc                | Thời gian | Kết quả              |
| ------------------------ | --------- | -------------------- |
| Global exception handler | 1 giờ     | ✅ Error handling    |
| Input validation (Joi)   | 1 giờ     | ✅ Validate requests |
| YouTube quota monitoring | 1 giờ     | ✅ Quota tracked     |
| Health check & metrics   | 1 giờ     | ✅ /health endpoint  |
| **Subtotal Day 4:**      | **4 giờ** |                      |

---

#### Phase 3: Testing & Integration (1-1.5 ngày)

**Day 5 - Testing & Gateway Integration**

| Công việc                                      | Thời gian | Kết quả                      |
| ---------------------------------------------- | --------- | ---------------------------- |
| Unit tests (services, providers)               | 1.5 giờ   | ✅ Tests pass                |
| Controller integration tests                   | 1.5 giờ   | ✅ API endpoints verified    |
| Setup Gateway proxy routing (Node.js)          | 30 phút   | ✅ ~15 lines added           |
| End-to-end test (Frontend → Gateway → Service) | 1 giờ     | ✅ Full flow working         |
| Performance test                               | 1 giờ     | ✅ Response time < 100ms     |
| Consul health check verify                     | 30 phút   | ✅ Service appears in Consul |
| **Subtotal Day 5:**                            | **6 giờ** |                              |

---

#### Phase 4: Frontend Integration & Polish (1 ngày)

**Day 6 - UI & Documentation**

| Công việc                             | Thời gian | Kết quả                    |
| ------------------------------------- | --------- | -------------------------- |
| Create Academy page component (React) | 2 giờ     | ✅ /academy page renders   |
| Course list display + thumbnail       | 1.5 giờ   | ✅ Grid/list view          |
| YouTube embedded player integration   | 1.5 giờ   | ✅ Video plays             |
| Quiz UI component                     | 1.5 giờ   | ✅ Quiz form + submit      |
| Progress dashboard                    | 1 giờ     | ✅ Show badges & score     |
| API integration (hooks)               | 1 giờ     | ✅ useEffect calls working |
| Write API documentation               | 1 giờ     | ✅ README updated          |
| **Subtotal Day 6:**                   | **9 giờ** |                            |

---

### 7.2. Total Timeline Summary

| Phase                  | Ngày       | Giờ        |
| ---------------------- | ---------- | ---------- |
| Setup & Infrastructure | Day 1      | 2.5        |
| Core Development       | Day 2-4    | 14.5       |
| Testing & Integration  | Day 5      | 6          |
| Frontend + Polish      | Day 6      | 9          |
| **TOTAL**              | **6 ngày** | **32 giờ** |

**Real-world estimate:** 1 tuần (40-45 giờ) bao gồm debugging + refinement

---

## VIII. PROJECT STRUCTURE

```
academy-service/
├── server.js                          (Entry point)
├── package.json
├── .env.example
├── src/
│   ├── controllers/
│   │   └── academyController.js      (Route handlers)
│   ├── services/
│   │   └── academyService.js         (Business logic)
│   ├── providers/
│   │   └── youtubeProvider.js        (YouTube API caller)
│   ├── models/
│   │   ├── Course.js                 (Mongoose schema)
│   │   ├── Quiz.js
│   │   ├── Badge.js
│   │   ├── UserProgress.js
│   │   └── UserBadge.js
│   ├── routes/
│   │   └── academyRoutes.js          (Express routes)
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validation.js
│   └── utils/
│       ├── logger.js
│       └── cacheManager.js
├── tests/
│   ├── academyService.test.js
│   ├── academyController.test.js
│   └── youtubeProvider.test.js
└── README.md
```

---

## IX. KEY IMPLEMENTATION FILES

### 9.1. server.js

```javascript
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const academyRoutes = require("./src/routes/academyRoutes");
const logger = require("../../shared/utils/logger");
const ServiceRegistry = require("./utils/registerService");

const app = express();
const PORT = process.env.ACADEMY_SERVICE_PORT || 3007;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", academyRoutes);

// Error handler
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Connect MongoDB & Start Server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.ACADEMY_DB_URI);
    logger.info("✅ MongoDB connected");

    app.listen(PORT, () => {
      logger.info(`🎓 Academy Service started on port ${PORT}`);

      // Register with Consul
      const registry = new ServiceRegistry({
        name: "academy-service",
        host: "localhost",
        port: PORT,
        healthCheck: "/health",
        tags: ["education", "academy", "youtube"],
      });
      registry.register();
    });
  } catch (error) {
    logger.error(`❌ Failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();
module.exports = app;
```

### 9.2. academyService.js (Core Logic)

```javascript
// src/services/academyService.js

const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const UserProgress = require('../models/UserProgress');
const Badge = require('../models/Badge');
const YouTubeProvider = require('../providers/youtubeProvider');
const cache = require('node-cache');
const logger = require('../../../shared/utils/logger');

class AcademyService {
  constructor() {
    this.cache = new cache({ stdTTL: 86400 });  // 24h TTL
  }

  async getCourses(page = 1, limit = 10) {
    try {
      // Check cache first
      const cached = this.cache.get('all_courses');
      if (cached) {
        logger.info('📚 Returning cached courses');
        return this.paginateCourses(cached, page, limit);
      }

      // Fetch from YouTube
      let courses = await Course.find().sort('order');
      if (courses.length === 0) {
        // First time: fetch from YouTube
        const youtubeVideos = await YouTubeProvider.fetchPlaylist();
        courses = await Course.insertMany(youtubeVideos);
      }

      // Cache it
      this.cache.set('all_courses', courses);

      return this.paginateCourses(courses, page, limit);
    } catch (error) {
      logger.error(`Error getting courses: ${error.message}`);
      throw error;
    }
  }

  async getQuiz(videoId) {
    const quiz = await Quiz.findOne({ videoId });
    if (!quiz) throw new Error('Quiz not found');
    return quiz;
  }

  async submitQuiz(userId, videoId, answers) {
    try {
      const quiz = await Quiz.findOne({ videoId });

      // Calculate score
      let correctCount = 0;
      answers.forEach((answer, idx) => {
        if (answer === quiz.questions[idx].correct) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / quiz.questions.length) * 100);
      const passed = score >= quiz.passingScore;

      // Save progress
      const progress = await UserProgress.findOneAndUpdate(
        { userId, videoId },
        {
          completed: passed,
          score,
          attempts: { $inc: 1 },
          completedAt: new Date()
        },
        { upsert: true, new: true }
      );

      // Check for badges
      let badge = null;
      if (passed) {
        const badgeDef = await Badge.findOne({ 'requirement.videoId': videoId });
        if (badgeDef) {
          badge = await this.earnBadge(userId, badgeDef.badgeId);
        }
      }

      return { score, passed, badge };
    } catch (error) {
      logger.error(`Error submitting quiz: ${error.message}`);
      throw error;
    }
  }

  async getUserProgress(userId) {
    const progresses = await UserProgress.find({ userId });
    const badges = await Badge.find({ userId });
    const totalCourses = await Course.countDocuments();
    const completedCourses = progresses.filter(p => p.completed).length;

    return {
      userId,
      totalCourses,
      completedCourses,
      progressPercentage: (completedCourses / totalCourses * 100).toFixed(1),
      badges,
      courseProgress: progresses
    };
  }

  private paginateCourses(courses, page, limit) {
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      courses: courses.slice(start, end),
      pagination: {
        page,
        limit,
        total: courses.length,
        pages: Math.ceil(courses.length / limit)
      }
    };
  }
}

module.exports = new AcademyService();
```

---

## X. GATEWAY INTEGRATION

### Add to: `backend/api-gateway/server.js`

```javascript
// Around line 120, thêm sau các proxy khác:

// ACADEMY SERVICE (Learning Hub)
const academyProxy = createServiceProxy("academy-service", "academy");

// ... Trong phần routes:

// ACADEMY SERVICE
app.use("/api/academy", authMiddleware, academyProxy);
```

**Total:** ~5 dòng code

---

## XI. FRONTEND COMPONENTS

### New Components Needed

```
frontend/src/
├── pages/
│   └── Academy.jsx                    (Main page)
├── components/
│   ├── CourseCard.jsx                 (Course thumbnail)
│   ├── CoursePlayer.jsx               (YouTube embed)
│   ├── QuizModal.jsx                  (Quiz dialog)
│   ├── ProgressBar.jsx                (User progress)
│   └── BadgeDisplay.jsx               (Badges earned)
└── hooks/
    └── useAcademy.js                  (Custom hook)
```

### API Calls

```javascript
// frontend/src/services/api.js (thêm)

export const academyAPI = {
  getCourses: (page = 1, limit = 10) =>
    instance.get("/academy/courses", { params: { page, limit } }),
  getCourse: (videoId) => instance.get(`/academy/courses/${videoId}`),
  getQuiz: (videoId) => instance.get(`/academy/courses/${videoId}/quiz`),
  submitQuiz: (videoId, answers) =>
    instance.post(`/academy/courses/${videoId}/submit-quiz`, { answers }),
  getProgress: () => instance.get("/academy/progress"),
};
```

---

## XII. TESTING STRATEGY

### 12.1. Unit Tests

**Test Cases:**

- ✅ Quiz score calculation
- ✅ Badge earning logic
- ✅ Cache hit/miss
- ✅ Pagination

### 12.2. Integration Tests

**Test Cases:**

- ✅ GET /courses endpoint
- ✅ POST /courses/{id}/submit-quiz
- ✅ GET /progress

### 12.3. Manual Testing

**Postman Collection:**

```
Academy Service Tests
├── GET /courses
├── GET /courses/{videoId}
├── GET /courses/{videoId}/quiz
├── POST /courses/{videoId}/submit-quiz
├── GET /progress
└── GET /health
```

---

## XIII. DEPLOYMENT & RUNNING

### 13.1. Local Development

```bash
# Setup
cd backend/academy-service
npm install

# .env file
YOUTUBE_API_KEY=AIzaSyxxxxxx
YOUTUBE_PLAYLIST_ID=PLxxxxx
ACADEMY_DB_URI=mongodb://localhost:27017/crypto_academy
ACADEMY_SERVICE_PORT=3007
NODE_ENV=development

# Run
npm start

# Expected: Service starts, registers with Consul
```

### 13.2. Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3007
CMD ["node", "server.js"]
```

---

## XIV. KIỂM THỬ & DEMO CHECKLIST

### 14.1. Pre-Demo Checklist

- [ ] Service chạy stable (no errors in logs)
- [ ] Consul discovery working
- [ ] YouTube API connected (quota showing)
- [ ] Cache working (TTL 24h)
- [ ] Quiz score calculation correct
- [ ] Gateway proxy routing working
- [ ] Frontend page renders properly
- [ ] All endpoints respond < 100ms
- [ ] No breaking changes với services khác

### 14.2. Demo Flow (5-7 phút với Giảng viên)

**1. Show architecture (1 phút)**

```
"Đây là Academy Service - dùng YouTube API để cung cấp khóa học crypto"
"Service tự register với Consul, tích hợp qua Gateway"
```

**2. Live demo - Backend (2 phút)**

```
- Mở Postman
- GET /api/academy/courses → hiển thị 15 videos
- GET /api/academy/courses/dQw4w9WgXcQ/quiz → hiển thị 5 câu hỏi
- POST /submit-quiz với answers → score = 80
```

**3. Live demo - Frontend (2-3 phút)**

```
- Mở Academy page
- Scroll courses, xem YouTube embedded
- Click "Take Quiz"
- Answer questions → submit → show score + badge
- Check progress page
```

**4. Q&A Giáo viên**

```
"Quota thế nào?" → "10K units/day, free tier, đủ cơm"
"Database nặng không?" → "Chỉ ~5MB, metadata only"
"Lưu text không?" → "Không, YouTube host videos, ta chỉ lưu link"
```

---

## XV. RISK & MITIGATION

| Risk                     | Likelihood | Impact              | Mitigation                 |
| ------------------------ | ---------- | ------------------- | -------------------------- |
| YouTube API quota exceed | Low        | Service down        | Monitor quota, add alert   |
| Playlist video deleted   | Medium     | Missing course      | Link checker, notification |
| YouTube API rate limit   | Low        | Slow response       | Increase cache TTL         |
| MongoDB down             | Low        | Can't save progress | Have backup DB             |

---

## XVI. CONFIGURATION

### .env.example

```bash
# Academy Service
ACADEMY_SERVICE_PORT=3007
ACADEMY_DB_URI=mongodb://localhost:27017/crypto_academy

# YouTube API
YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
YOUTUBE_PLAYLIST_ID=PLxxxxx

# Cache
ACADEMY_CACHE_TTL=86400

# Environment
NODE_ENV=development
```

---

## XVII. DOCUMENTATION

### README.md Template

```markdown
# Academy Service (Learning Hub)

## Overview

Microservice providing crypto education via YouTube integration.

## Tech Stack

- Node.js + Express.js
- MongoDB
- YouTube Data API v3
- node-cache

## Running

npm install
npm start

## API Endpoints

- GET /courses - List all courses
- GET /courses/{id} - Get course detail
- GET /courses/{id}/quiz - Get quiz
- POST /courses/{id}/submit-quiz - Submit answers
- GET /progress - User progress
- GET /health - Health check

## YouTube Playlist Setup

1. Create playlist "Crypto Academy"
2. Add 15-20 videos
3. Get Playlist ID → add to .env

## Configuration

See .env.example for all variables.
```

---

## XVIII. SUCCESS CRITERIA

✅ **Academy Service chạy stable**

- Fetch YouTube videos thành công
- Quiz scoring chính xác
- Progress tracking working
- Zero breaking changes

✅ **Database lightweight**

- < 10 MB total (metadata only)
- Fast queries

✅ **Demo smooth**

- 5 phút setup complete
- All operations < 100ms

✅ **Developer friendly**

- Clear code structure
- Good documentation
- Easy to extend (thêm video = thêm row DB)

---

**End of Document**

---

_Prepared by: AI Assistant_  
_Last updated: 03/04/2026_  
_Status: Ready for development_
