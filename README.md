# CryptoTrading SOA

He thong giao dich crypto ao duoc xay dung theo kien truc SOA. Project ban dau gom cac service cot loi cho dang ky, giao dich, danh muc, thi truong va thong bao. Do an 2 bo sung them 3 service moi: News Service, Sentiment Service va Academy Service.

## Tong Quan

Nguoi dung co the:

- Dang ky, dang nhap va nhan so du USDT ao.
- Xem gia crypto, bieu do, mua ban coin va xem lich su giao dich.
- Theo doi portfolio va loi/lo.
- Doc tin tuc crypto kem nhan sentiment.
- Xem goi y xu huong coin bang AI sentiment.
- Hoc crypto qua Academy, xem video YouTube va tu danh dau hoan thanh.
- Admin co the quan ly user va quan ly khoa hoc Academy.

He thong hien tai co 8 service doc lap:

- Node.js/Express: API Gateway va 5 service nghiep vu cua do an 1.
- Java Spring Boot: News Service va Academy Service.
- Python FastAPI: Sentiment Service.
- React/Vite: frontend.

## Kien Truc

Luon truy cap tu frontend di qua API Gateway:

```text
Frontend React (:5173)
        |
        v
API Gateway (:3000)
        |
        +-- User Service (:3001)          -> MongoDB
        +-- Market Service (:3002)        -> CoinGecko/CoinPaprika
        +-- Portfolio Service (:3003)     -> MongoDB
        +-- Trade Service (:3004)         -> MongoDB
        +-- Notification Service (:3005)  -> MongoDB + WebSocket
        +-- News Service (:3006)          -> CryptoCompare/NewsAPI + Gateway sentiment route
        +-- Academy Service (:3007)       -> MySQL crypto_academy
        +-- Sentiment Service (:3008)     -> FinBERT pretrained model
```

Consul duoc dung cho service discovery. API Gateway va cac backend service deu dang ky Consul; khi can goi service noi bo, luong request di qua Gateway va Gateway discover service dich qua Consul. Cac service nghiep vu khong goi thang nhau bang port noi bo; vi du News goi Sentiment qua `/api/sentiment/analyze`, Sentiment lay Market/News qua Gateway, Notification lay gia Market qua Gateway. Ngoai le hop le la API Gateway duoc proxy/orchestrate den service dich va service duoc goi API ben ngoai nhu CoinGecko, CryptoCompare, NewsAPI, YouTube hoac FinBERT model. Neu chay local ma Consul bi tat, mot so service van co co che fallback/static config tuy tung service, nhung de demo day du nen bat Consul truoc.

## Bang Service

| Service | Port | Cong nghe | Vai tro |
|---|---:|---|---|
| API Gateway | 3000 | Node.js, Express | Diem vao duy nhat, JWT, rate limit, proxy/orchestration |
| User Service | 3001 | Node.js, MongoDB | Dang ky, dang nhap, user/admin, wallet ao |
| Market Service | 3002 | Node.js | Lay gia coin, chart data, cache |
| Portfolio Service | 3003 | Node.js, MongoDB | Quan ly holdings, tinh portfolio |
| Trade Service | 3004 | Node.js, MongoDB | Luu lenh mua/ban va lich su giao dich |
| Notification Service | 3005 | Node.js, MongoDB, Socket.IO | Thong bao, price alert, cron job |
| News Service | 3006 | Java Spring Boot | Tin tuc crypto, cache, scheduler, sentiment badge |
| Academy Service | 3007 | Java Spring Boot, MySQL | Learning path, course video, progress, admin CRUD |
| Sentiment Service | 3008 | Python FastAPI, FinBERT | Phan tich sentiment va goi y xu huong coin |

## Diem Moi Cua Do An 2

### News Service

News Service lay tin tuc crypto tu API ngoai:

- Primary: CryptoCompare.
- Fallback: NewsAPI neu co `NEWSAPI_KEY`.
- Fallback cuoi: sample data de demo khi API ngoai loi hoac het quota.

Backend xu ly:

- Chuan hoa du lieu tin tuc ve model `News`.
- Gan sentiment cho moi bai tin bang Sentiment Service thong qua API Gateway.
- Neu Sentiment Service khong san sang, dung keyword fallback.
- Cache tin tuc bang Guava Cache.
- Co scheduler that su dung `@EnableScheduling` va `NewsFetchScheduler` de refresh dinh ky.

Tai lieu chi tiet:

- [docs/NEWS_SERVICE_EXPLAINED.md](docs/NEWS_SERVICE_EXPLAINED.md)
- [docs/details/NEWS_SERVICE.md](docs/details/NEWS_SERVICE.md)

### Sentiment Service

Sentiment Service la FastAPI service dung model pretrained `ProsusAI/finbert`. Service nay khong train du lieu trong project.

Backend xu ly:

- `POST /sentiment/analyze`: phan tich mot doan text.
- `POST /sentiment/analyze-batch`: phan tich nhieu doan text.
- `GET /sentiment/suggestion?symbol=BTC`: goi Market/News, tong hop sentiment va rule de tra ve xu huong.
- Tu dang ky Consul de API Gateway co the discover giong cac service khac.
- Tach code thanh `main.py`, `config.py`, `models.py`, `finbert_service.py`, `suggestion_service.py` de de review.

Tai lieu chi tiet:

- [docs/SENTIMENT_SERVICE_EXPLAINED.md](docs/SENTIMENT_SERVICE_EXPLAINED.md)
- [docs/details/SENTIMENT_SERVICE.md](docs/details/SENTIMENT_SERVICE.md)

### Academy Service

Academy Service hien tai quan ly khoa hoc/video truc tiep trong MySQL. Khong con chuc nang import playlist YouTube.

Backend xu ly:

- Bang `courses`: luu videoId, title, description, category, difficulty, learningPath, sortOrder.
- Bang `course_progress`: luu tien do hoan thanh theo `userId` va `videoId`.
- User xem learning path, danh sach khoa hoc, chi tiet khoa hoc va tu danh dau hoan thanh.
- Admin them, sua, xoa khoa hoc bang link YouTube hoac videoId.
- YouTube API v3 chi la phan phu de lay metadata cho mot video khi co `YOUTUBE_API_KEY`.
- Neu khong co YouTube API key, service van hoat dong bang du lieu admin nhap va seed trong MySQL.

Tai lieu chi tiet:

- [docs/ACADEMY_SERVICE_EXPLAINED.md](docs/ACADEMY_SERVICE_EXPLAINED.md)
- [docs/details/ACADEMY_SERVICE.md](docs/details/ACADEMY_SERVICE.md)

## Database

Do an nay van dung database theo bien gioi service:

- Cac service Node.js cua do an 1 dung MongoDB.
- Academy Service dung rieng MySQL database `crypto_academy`.
- News Service khong co database rieng, du lieu lay tu API ngoai va cache trong RAM.
- Sentiment Service khong co database, chi chay inference bang FinBERT va goi API noi bo khi can.

Trong MySQL `crypto_academy` co 2 bang la hop ly:

- `courses`: noi dung khoa hoc/video.
- `course_progress`: tien do hoc cua user.

Day khong vi pham SOA, vi 2 bang nay cung thuoc mot service va nam trong database rieng cua Academy Service.

## Cau Hinh Moi Truong

Tao/cap nhat file `.env` cho backend Node.js theo cau hinh hien co cua project. Cac bien quan trong cho 3 service do an 2:

```env
# News Service
CRYPTOCOMPARE_API_KEY=
NEWSAPI_KEY=
API_GATEWAY_URL=http://localhost:3000

# Academy Service
DB_USERNAME=root
DB_PASSWORD=
YOUTUBE_API_KEY=

# Internal
INTERNAL_SERVICE_KEY=cryptotrading-internal-svc-key-2026
JWT_SECRET=your-jwt-secret
```

Ghi chu:

- `CRYPTOCOMPARE_API_KEY` co the de trong khi demo free tier, tuy nhien co key se on dinh hon.
- `NEWSAPI_KEY` chi la fallback.
- `API_GATEWAY_URL` la dia chi Gateway de News/Sentiment goi service noi bo qua Gateway.
- `INTERNAL_SERVICE_KEY` dung cho request noi bo di qua Gateway, vi du News goi `/api/sentiment/analyze`.
- `YOUTUBE_API_KEY` la optional. Khong co key thi preview metadata co the khong day du, nhung them/sua/xoa course van dung neu admin nhap title/description.

## Cach Chay Local

Yeu cau:

- Node.js 18+
- Java 21+
- Python 3.10+
- MongoDB Atlas hoac MongoDB local tuy cau hinh project
- MySQL/XAMPP voi database `crypto_academy`
- Consul local tai `localhost:8500`

Chay cac service Node.js:

```powershell
cd backend
npm install
.\start-all-services.ps1
```

Chay News Service:

```powershell
cd news-service
.\mvnw.cmd spring-boot:run
```

Chay Academy Service:

```powershell
cd academy-service
.\mvnw.cmd spring-boot:run
```

Chay Sentiment Service:

```powershell
cd sentiment-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
.\start.ps1
```

Chay frontend:

```powershell
cd frontend
npm install
npm run dev
```

Frontend mac dinh: <http://localhost:5173>

## API Chinh

### News

| Method | Endpoint qua Gateway | Mo ta |
|---|---|---|
| GET | `/api/news` | Lay tin tuc co phan trang va sentiment |
| GET | `/api/news?symbol=BTC` | Loc tin theo coin |
| GET | `/api/news/trending` | Lay tin trending |
| GET | `/api/news/health` | Health check |

### Sentiment

| Method | Endpoint qua Gateway | Mo ta |
|---|---|---|
| GET | `/api/sentiment/health` | Health check va trang thai model |
| POST | `/api/sentiment/analyze` | Phan tich sentiment mot text |
| POST | `/api/sentiment/analyze-batch` | Phan tich sentiment nhieu text |
| GET | `/api/sentiment/suggestion?symbol=BTC` | Goi y xu huong coin |

### Academy

| Method | Endpoint qua Gateway | Mo ta |
|---|---|---|
| GET | `/api/academy/health` | Health check |
| GET | `/api/academy/paths` | Lay learning path va tien do user |
| GET | `/api/academy/courses` | Lay danh sach course co phan trang/loc |
| GET | `/api/academy/courses/{videoId}` | Lay chi tiet course |
| PUT | `/api/academy/progress/{videoId}` | Tu danh dau hoan thanh/chua hoan thanh |
| POST | `/api/academy/admin/courses/preview` | Admin preview video metadata |
| POST | `/api/academy/admin/courses` | Admin them course |
| PUT | `/api/academy/admin/courses/{id}` | Admin sua course |
| DELETE | `/api/academy/admin/courses/{id}` | Admin xoa course |

## Cau Truc Thu Muc Quan Trong

```text
CryptoTradingSOA/
+-- backend/
|   +-- api-gateway/
|   +-- services/
|       +-- user-service/
|       +-- market-service/
|       +-- portfolio-service/
|       +-- trade-service/
|       +-- notification-service/
+-- news-service/
|   +-- src/main/java/com/cryptotrading/news/
+-- academy-service/
|   +-- src/main/java/com/cryptotrading/academy/
+-- sentiment-service/
|   +-- main.py
|   +-- config.py
|   +-- models.py
|   +-- finbert_service.py
|   +-- suggestion_service.py
+-- frontend/
|   +-- src/
+-- docs/
|   +-- NEWS_SERVICE_EXPLAINED.md
|   +-- SENTIMENT_SERVICE_EXPLAINED.md
|   +-- ACADEMY_SERVICE_EXPLAINED.md
|   +-- details/
+-- springboot_docs/
    +-- SPRING_BOOT_COMPLETE_GUIDE.md
```

## Kiem Tra Nhanh

```powershell
# Java services
cd news-service
.\mvnw.cmd test

cd ..\academy-service
.\mvnw.cmd test

# Python service
cd ..\sentiment-service
python -m compileall -q .

# Frontend
cd ..\frontend
npm run build
```

Health check khi da chay day du:

```powershell
Invoke-WebRequest http://localhost:3006/news/health
Invoke-WebRequest http://localhost:3007/academy/health
Invoke-WebRequest http://localhost:3000/api/sentiment/health
```

## Thu Tu Nen Hoc 3 Service Moi

De de review va trinh bay voi giang vien, nen hoc theo thu tu:

1. Sentiment Service: nam FinBERT, analyze text va suggestion logic.
2. News Service: hieu cach lay tin, cache, scheduler va goi Sentiment qua API Gateway.
3. Academy Service: hieu MySQL, JPA, course CRUD, progress va admin flow.

Thu tu doc code goi y:

1. Doc file explained trong `docs/`.
2. Doc file detail trong `docs/details/`.
3. Doc controller de nam endpoint.
4. Doc service de nam nghiep vu.
5. Doc model/repository/provider.
6. Doc frontend page tuong ung.

## Tai Lieu Bo Sung

- [docs/NEWS_SERVICE_EXPLAINED.md](docs/NEWS_SERVICE_EXPLAINED.md)
- [docs/SENTIMENT_SERVICE_EXPLAINED.md](docs/SENTIMENT_SERVICE_EXPLAINED.md)
- [docs/ACADEMY_SERVICE_EXPLAINED.md](docs/ACADEMY_SERVICE_EXPLAINED.md)
- [docs/details/NEWS_SERVICE.md](docs/details/NEWS_SERVICE.md)
- [docs/details/SENTIMENT_SERVICE.md](docs/details/SENTIMENT_SERVICE.md)
- [docs/details/ACADEMY_SERVICE.md](docs/details/ACADEMY_SERVICE.md)
- [springboot_docs/SPRING_BOOT_COMPLETE_GUIDE.md](springboot_docs/SPRING_BOOT_COMPLETE_GUIDE.md)

## Tac Gia

Doan The Tin
