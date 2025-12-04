# 👥 Phân công nhiệm vụ Backend (20% - 20% - 60%)

> Tài liệu phân công công việc cho 3 thành viên trong project CryptoTrading SOA

---

## 📊 Tổng quan phân công

| Thành viên | Tỷ lệ | Nhiệm vụ chính | Số files |
|------------|-------|----------------|----------|
| **Thành viên 1** | 20% | Notification Service + Logger/Email | 7 files |
| **Thành viên 2** | 20% | User Service + Trade Service | 9 files |
| **Leader (Bạn)** | 60% | API Gateway + Core Services + Shared | ~22 files |

---

## 📐 Sơ đồ phân công

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND STRUCTURE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    👑 LEADER (60%)                        │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ API Gateway         │ Market Service                │ │   │
│  │  │ - server.js         │ - External API (CoinGecko)    │ │   │
│  │  │ - tradeOrchestration│ - Caching (NodeCache)         │ │   │
│  │  │ - portfolioOrch.    │ - Fallback (CoinPaprika)      │ │   │
│  │  ├─────────────────────┼───────────────────────────────┤ │   │
│  │  │ Portfolio Service   │ Shared Core Modules           │ │   │
│  │  │ - Holdings          │ - serviceDiscovery.js  ⭐     │ │   │
│  │  │ - P&L calculation   │ - circuitBreaker.js    ⭐     │ │   │
│  │  │                     │ - auth.js, db.js, websocket   │ │   │
│  │  └─────────────────────┴───────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────┐  ┌───────────────────────────┐  │
│  │   👤 THÀNH VIÊN 2 (20%)    │  │  👤 THÀNH VIÊN 1 (20%)    │  │
│  │                            │  │                           │  │
│  │  User Service              │  │  Notification Service     │  │
│  │  - User Model (auth)       │  │  - Notification Model     │  │
│  │  - Register/Login          │  │  - PriceAlert Model       │  │
│  │  - JWT Token               │  │  - CRUD operations        │  │
│  │  - Admin functions         │  │  - registerService        │  │
│  │                            │  │                           │  │
│  │  Trade Service             │  │  Shared Utils             │  │
│  │  - Trade Model             │  │  - logger.js              │  │
│  │  - History & Stats         │  │  - emailService.js        │  │
│  └────────────────────────────┘  └───────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👤 Thành viên 1: 20%

### Nhiệm vụ: **Notification Service + Shared Utils**

### 📁 Danh sách files (7 files)

| # | File | Đường dẫn | Mô tả |
|---|------|-----------|-------|
| 1 | `server.js` | `services/notification-service/server.js` | Khởi động service |
| 2 | `Notification.js` | `services/notification-service/models/Notification.js` | Schema thông báo |
| 3 | `PriceAlert.js` | `services/notification-service/models/PriceAlert.js` | Schema cảnh báo giá |
| 4 | `notificationRoutes.js` | `services/notification-service/routes/notificationRoutes.js` | Định nghĩa routes |
| 5 | `notificationController.js` | `services/notification-service/controllers/notificationController.js` | Logic xử lý |
| 6 | `registerService.js` | `services/notification-service/utils/registerService.js` | Đăng ký Consul |
| 7 | `logger.js` | `shared/utils/logger.js` | Winston logging |
| 8 | `emailService.js` | `shared/utils/emailService.js` | Gửi email |

### 📂 Cấu trúc thư mục

```
services/notification-service/
├── server.js                    ✅
├── models/
│   ├── Notification.js          ✅
│   └── PriceAlert.js            ✅
├── routes/
│   └── notificationRoutes.js    ✅
├── controllers/
│   └── notificationController.js ✅
└── utils/
    └── registerService.js       ✅

shared/utils/
├── logger.js                    ✅
└── emailService.js              ✅
```

### 📝 Nội dung cần nắm

#### 1. Notification Model
```javascript
// Các trường chính:
{
  userId: ObjectId,      // Ref đến User
  type: String,          // 'trade' | 'price_alert' | 'system'
  title: String,
  message: String,
  status: String,        // 'unread' | 'read' | 'archived'
  priority: String,      // 'low' | 'medium' | 'high' | 'urgent'
}
```

#### 2. PriceAlert Model
```javascript
// Các trường chính:
{
  userId: ObjectId,
  symbol: String,        // 'BTC', 'ETH', ...
  targetPrice: Number,   // Giá mục tiêu
  condition: String,     // 'above' | 'below'
  isActive: Boolean,     // Đang hoạt động?
  triggered: Boolean,    // Đã kích hoạt?
}
```

#### 3. API Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Lấy danh sách notifications |
| PUT | `/:id/read` | Đánh dấu đã đọc |
| PUT | `/read-all` | Đánh dấu tất cả đã đọc |
| POST | `/alert` | Tạo price alert mới |
| GET | `/alerts` | Lấy danh sách alerts |
| DELETE | `/alert/:id` | Xóa alert |

### ✅ Checklist hoàn thành

- [ ] Hiểu Notification Model và các trường
- [ ] Hiểu PriceAlert Model và condition (above/below)
- [ ] Giải thích được các API endpoints
- [ ] Hiểu cách service đăng ký với Consul
- [ ] Hiểu Logger: các log levels (info, warn, error)
- [ ] Hiểu Email Service: cách gửi email thông báo

### ❓ Câu hỏi có thể được hỏi

1. Notification có những trường nào? Giải thích ý nghĩa?
2. PriceAlert hoạt động như thế nào? Condition "above" và "below" là gì?
3. Làm sao để đánh dấu tất cả notification đã đọc?
4. Service đăng ký với Consul như thế nào?
5. Logger có những level nào? Khi nào dùng level nào?

---

## 👤 Thành viên 2: 20%

### Nhiệm vụ: **User Service + Trade Service**

### 📁 Danh sách files (9 files)

| # | File | Đường dẫn | Mô tả |
|---|------|-----------|-------|
| 1 | `server.js` | `services/user-service/server.js` | Khởi động User service |
| 2 | `User.js` | `services/user-service/models/User.js` | Schema người dùng |
| 3 | `userRoutes.js` | `services/user-service/routes/userRoutes.js` | Định nghĩa routes |
| 4 | `userController.js` | `services/user-service/controllers/userController.js` | Logic xử lý |
| 5 | `registerService.js` | `services/user-service/utils/registerService.js` | Đăng ký Consul |
| 6 | `server.js` | `services/trade-service/server.js` | Khởi động Trade service |
| 7 | `Trade.js` | `services/trade-service/models/Trade.js` | Schema giao dịch |
| 8 | `tradeRoutes.js` | `services/trade-service/routes/tradeRoutes.js` | Định nghĩa routes |
| 9 | `tradeController.js` | `services/trade-service/controllers/tradeController.js` | Logic xử lý |

### 📂 Cấu trúc thư mục

```
services/user-service/
├── server.js                    ✅
├── models/
│   └── User.js                  ✅
├── routes/
│   └── userRoutes.js            ✅
├── controllers/
│   └── userController.js        ✅
└── utils/
    └── registerService.js       ✅

services/trade-service/
├── server.js                    ✅
├── models/
│   └── Trade.js                 ✅
├── routes/
│   └── tradeRoutes.js           ✅
└── controllers/
    └── tradeController.js       ✅
```

### 📝 Nội dung cần nắm

#### 1. User Model
```javascript
// Các trường chính:
{
  email: String,         // Unique, lowercase
  password: String,      // Hashed với bcrypt
  fullName: String,
  role: String,          // 'user' | 'admin'
  balance: Number,       // Số dư USDT (default: 1000)
  isActive: Boolean,     // Trạng thái tài khoản
  balanceHistory: [{     // Lịch sử thay đổi số dư
    amount: Number,
    type: String,        // 'deposit' | 'withdraw' | 'trade'
    description: String,
    timestamp: Date
  }]
}
```

#### 2. Trade Model
```javascript
// Các trường chính:
{
  userId: ObjectId,
  type: String,          // 'buy' | 'sell'
  symbol: String,        // 'BTC', 'ETH', ...
  amount: Number,        // Số lượng coin
  price: Number,         // Giá tại thời điểm GD
  totalCost: Number,     // = amount * price
  fee: Number,           // Phí (0.1%)
  status: String,        // 'completed' | 'failed'
  balanceBefore: Number,
  balanceAfter: Number,
}
```

#### 3. User API Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/register` | Đăng ký tài khoản |
| POST | `/login` | Đăng nhập |
| GET | `/profile` | Lấy thông tin profile |
| PUT | `/profile` | Cập nhật profile |
| GET | `/balance` | Lấy số dư |
| GET | `/admin/users` | [Admin] Danh sách users |
| PUT | `/admin/users/:id/toggle` | [Admin] Khóa/Mở user |
| PUT | `/admin/users/:id/balance` | [Admin] Reset số dư |

#### 4. Trade API Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/history` | Lấy lịch sử giao dịch |
| GET | `/stats` | Lấy thống kê |
| POST | `/` | Tạo trade record (internal) |

#### 5. JWT Authentication
```javascript
// Tạo token khi login:
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Token được gửi trong header:
// Authorization: Bearer <token>
```

### ✅ Checklist hoàn thành

- [ ] Hiểu User Model và các trường
- [ ] Hiểu cách hash password với bcrypt
- [ ] Hiểu JWT token: tạo và verify
- [ ] Hiểu Trade Model và các trường
- [ ] Giải thích được các API endpoints
- [ ] Hiểu cách tính thống kê giao dịch

### ❓ Câu hỏi có thể được hỏi

1. User Model có những trường nào? Balance history để làm gì?
2. Password được hash như thế nào? Tại sao phải hash?
3. JWT token là gì? Tạo ở đâu? Verify ở đâu?
4. Trade record lưu những thông tin gì?
5. API thống kê giao dịch trả về những gì?
6. Phân biệt role 'user' và 'admin'?

---

## 👑 Leader: 60%

### Nhiệm vụ: **API Gateway + Core Services + Shared Modules**

### 📁 Danh sách files (~22 files)

#### API Gateway (3 files) ⭐⭐⭐
| # | File | Đường dẫn | Mô tả |
|---|------|-----------|-------|
| 1 | `server.js` | `api-gateway/server.js` | Entry point, proxy, WebSocket |
| 2 | `tradeOrchestration.js` | `api-gateway/orchestration/tradeOrchestration.js` | Buy/Sell 7 steps |
| 3 | `portfolioOrchestration.js` | `api-gateway/orchestration/portfolioOrchestration.js` | Enrich portfolio |

#### Market Service (5 files) ⭐⭐
| # | File | Đường dẫn | Mô tả |
|---|------|-----------|-------|
| 4 | `server.js` | `services/market-service/server.js` | Khởi động service |
| 5 | `marketController.js` | `services/market-service/controllers/marketController.js` | Get prices, chart |
| 6 | `marketRoutes.js` | `services/market-service/routes/marketRoutes.js` | Routes |
| 7 | `coinPaprikaProvider.js` | `services/market-service/providers/coinPaprikaProvider.js` | Fallback API |
| 8 | `registerService.js` | `services/market-service/utils/registerService.js` | Đăng ký Consul |

#### Portfolio Service (5 files) ⭐⭐
| # | File | Đường dẫn | Mô tả |
|---|------|-----------|-------|
| 9 | `server.js` | `services/portfolio-service/server.js` | Khởi động service |
| 10 | `Portfolio.js` | `services/portfolio-service/models/Portfolio.js` | Schema portfolio |
| 11 | `portfolioController.js` | `services/portfolio-service/controllers/portfolioController.js` | Holdings, P&L |
| 12 | `portfolioRoutes.js` | `services/portfolio-service/routes/portfolioRoutes.js` | Routes |
| 13 | `registerService.js` | `services/portfolio-service/utils/registerService.js` | Đăng ký Consul |

#### Shared Core (8 files) ⭐⭐⭐
| # | File | Đường dẫn | Mô tả |
|---|------|-----------|-------|
| 14 | `serviceDiscovery.js` | `shared/utils/serviceDiscovery.js` | Consul integration |
| 15 | `circuitBreaker.js` | `shared/utils/circuitBreaker.js` | Opossum pattern |
| 16 | `auth.js` | `shared/middleware/auth.js` | JWT middleware |
| 17 | `errorHandler.js` | `shared/middleware/errorHandler.js` | Error handling |
| 18 | `db.js` | `shared/config/db.js` | MongoDB connection |
| 19 | `services.js` | `shared/config/services.js` | Service configs |
| 20 | `websocket.js` | `shared/utils/websocket.js` | Socket.IO |
| 21 | `httpClient.js` | `shared/utils/httpClient.js` | Axios wrapper |

#### Notification Cron (1 file)
| # | File | Đường dẫn | Mô tả |
|---|------|-----------|-------|
| 22 | `priceAlertChecker.js` | `services/notification-service/utils/priceAlertChecker.js` | Cron job |

### 📂 Cấu trúc thư mục

```
api-gateway/
├── server.js                    ⭐⭐⭐
└── orchestration/
    ├── tradeOrchestration.js    ⭐⭐⭐
    └── portfolioOrchestration.js ⭐

services/market-service/
├── server.js                    ⭐
├── controllers/marketController.js ⭐⭐
├── routes/marketRoutes.js       ⭐
├── providers/coinPaprikaProvider.js ⭐
└── utils/registerService.js     ⭐

services/portfolio-service/
├── server.js                    ⭐
├── models/Portfolio.js          ⭐⭐
├── controllers/portfolioController.js ⭐⭐
├── routes/portfolioRoutes.js    ⭐
└── utils/registerService.js     ⭐

shared/
├── config/
│   ├── db.js                    ⭐⭐
│   └── services.js              ⭐
├── middleware/
│   ├── auth.js                  ⭐⭐⭐
│   └── errorHandler.js          ⭐
└── utils/
    ├── serviceDiscovery.js      ⭐⭐⭐
    ├── circuitBreaker.js        ⭐⭐⭐
    ├── websocket.js             ⭐⭐
    └── httpClient.js            ⭐

services/notification-service/utils/
└── priceAlertChecker.js         ⭐⭐
```

### 📝 Nội dung cần nắm (Core Concepts)

#### 1. Trade Orchestration - 7 Steps ⭐⭐⭐

```
┌─────────────────────────────────────────────────────────────┐
│                    BUY COIN FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Get current price      → Market Service            │
│  Step 2: Check user balance     → User Service              │
│  Step 3: Deduct balance         → User Service              │
│  Step 4: Add holding            → Portfolio Service         │
│  Step 5: Create trade record    → Trade Service             │
│  Step 6: Send notification      → Notification Service      │
│  Step 7: Emit WebSocket         → Real-time update          │
│                                                              │
│  ⚠️ If Step 3-5 fails → ROLLBACK:                           │
│     - Refund user balance                                   │
│     - Remove holding                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Service Discovery với Consul ⭐⭐⭐

```
┌──────────────┐     (1) Register          ┌──────────────┐
│              │ ─────────────────────────►│              │
│  Services    │     {name, host, port}    │    CONSUL    │
│  (3001-3005) │                           │    (:8500)   │
│              │◄───────────────────────── │              │
└──────────────┘     Health Check (10s)    └──────────────┘
                                                  ▲
                                                  │ (2) Query
                                                  │
                                           ┌──────┴───────┐
                                           │ API GATEWAY  │
                                           └──────────────┘
                                                  │
                                                  │ (3) Response
                                                  ▼
                                           "localhost:3001"
```

#### 3. Circuit Breaker Pattern ⭐⭐⭐

```
        ┌─────────┐
        │ CLOSED  │ ← Bình thường, requests đi qua
        └────┬────┘
             │ Failures > threshold
             ▼
        ┌─────────┐
        │  OPEN   │ ← Chặn requests, fail fast
        └────┬────┘
             │ After 30s
             ▼
        ┌─────────┐
        │HALF-OPEN│ ← Thử 1 request
        └────┬────┘
             │
      Success│ Fail
         ┌───┴───┐
         ▼       ▼
      CLOSED    OPEN
```

#### 4. Portfolio P&L Calculation

```javascript
// Average Buy Price (khi mua thêm)
newAvgPrice = (oldAmount * oldAvgPrice + newAmount * newPrice) / totalAmount

// Profit/Loss
profit = currentValue - totalInvested
profitPercentage = (profit / totalInvested) * 100
```

### ✅ Checklist hoàn thành

- [ ] Hiểu kiến trúc SOA tổng quan
- [ ] Hiểu API Gateway: proxy, auth, rate limit
- [ ] Hiểu Trade Orchestration 7 steps
- [ ] Hiểu Rollback mechanism khi lỗi
- [ ] Hiểu Service Discovery với Consul
- [ ] Hiểu Circuit Breaker: 3 states
- [ ] Hiểu Market Service: CoinGecko + Cache + Fallback
- [ ] Hiểu Portfolio: Holdings, P&L calculation
- [ ] Hiểu Auth Middleware: JWT verify
- [ ] Hiểu WebSocket: real-time events
- [ ] Hiểu Price Alert Cron job

### ❓ Câu hỏi có thể được hỏi

1. Giải thích kiến trúc SOA của project?
2. Trade Orchestration có mấy bước? Giải thích từng bước?
3. Rollback hoạt động như thế nào khi giao dịch thất bại?
4. Service Discovery là gì? Consul hoạt động như nào?
5. Circuit Breaker là gì? 3 trạng thái là gì?
6. Market Service lấy giá từ đâu? Cache như thế nào?
7. Portfolio tính lãi/lỗ như thế nào?
8. WebSocket dùng để làm gì trong project?

---

## 📊 Tổng kết

### Số files theo thành viên

| Thành viên | Số files | Tỷ lệ |
|------------|----------|-------|
| Thành viên 1 | 7 files | 20% |
| Thành viên 2 | 9 files | 20% |
| Leader | ~22 files | 60% |
| **Tổng** | **~38 files** | **100%** |

### Độ khó theo thành viên

| Thành viên | Độ khó | Lý do |
|------------|--------|-------|
| Thành viên 1 | ⭐ Dễ | CRUD đơn giản, không phụ thuộc service khác |
| Thành viên 2 | ⭐⭐ Dễ-TB | Auth cơ bản, JWT phổ biến |
| Leader | ⭐⭐⭐ Khó | Orchestration, Patterns, Core modules |

### Timeline đề xuất

| Tuần | Thành viên 1 | Thành viên 2 | Leader |
|------|--------------|--------------|--------|
| 1 | Đọc hiểu Models | Đọc hiểu Models | Setup project, Shared modules |
| 2 | Routes & Controller | Routes & Controller | API Gateway, Orchestration |
| 3 | Test API, viết docs | Test API, viết docs | Market & Portfolio Service |
| 4 | Chuẩn bị thuyết trình | Chuẩn bị thuyết trình | Review, Integration test |

---

## 📞 Liên hệ & Hỗ trợ

- Khi gặp khó khăn, liên hệ **Leader** để được hỗ trợ
- Mỗi tuần họp 1 lần để sync tiến độ
- Deadline: [Điền deadline]

---

**Lưu ý:** Tài liệu này dùng để theo dõi tiến độ và phân công. Mỗi thành viên cần đánh dấu ✅ vào checklist khi hoàn thành.
