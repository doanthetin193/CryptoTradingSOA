# 📚 Hướng dẫn Tìm hiểu Project CryptoTrading SOA

> Tài liệu này hướng dẫn bạn tìm hiểu project theo thứ tự từ cơ bản đến nâng cao, giúp nắm vững kiến trúc SOA và cách các thành phần tương tác với nhau.

## 🎯 Mục tiêu học tập

Sau khi hoàn thành, bạn sẽ hiểu:
- Kiến trúc SOA (Service-Oriented Architecture)
- Cách các Microservices giao tiếp
- Service Discovery với Consul
- Circuit Breaker Pattern
- JWT Authentication
- Real-time với WebSocket
- Trade Orchestration (điều phối giao dịch)

---

## 📋 Lộ trình học tập

### Tổng quan các Phase

| Phase | Nội dung | Thời gian |
|-------|----------|-----------|
| 1 | Hiểu tổng quan kiến trúc | 30 phút |
| 2 | Shared modules (nền tảng) | 1-2 giờ |
| 3 | Từng Microservice | 2-3 giờ |
| 4 | API Gateway & Orchestration | 1-2 giờ |
| 5 | Frontend | 1-2 giờ |
| 6 | Chạy thử & Debug | 1 giờ |

---

## 🚀 Phase 1: Hiểu tổng quan kiến trúc (30 phút)

### 1.1. Đọc README.md
```
📁 CryptoTradingSOA/
└── README.md  ← Đọc trước
```

**Nắm được:**
- Mục đích project
- Sơ đồ kiến trúc tổng quan
- Các services và ports
- Luồng Service Discovery

### 1.2. Hiểu luồng request

```
Client (React)
    │
    ▼
API Gateway (:3000)     ◄──── JWT Authentication
    │                         Rate Limiting
    │
    ├── Query Consul (:8500) ──► "user-service ở đâu?"
    │                              ▼
    │                         "localhost:3001"
    │
    ▼
Microservice (User/Market/Portfolio/Trade/Notification)
    │
    ▼
MongoDB
```

### 1.3. Hiểu các service

| Service | Chức năng chính | Database Collections |
|---------|-----------------|---------------------|
| User Service | Auth, Balance, Admin | users |
| Market Service | Giá coin, Chart | (Cache only) |
| Portfolio Service | Holdings, P&L | portfolios |
| Trade Service | Lịch sử giao dịch | trades |
| Notification Service | Thông báo, Alerts | notifications, pricealerts |

---

## 🔧 Phase 2: Shared Modules - Nền tảng (1-2 giờ)

> Đây là phần **quan trọng nhất**, các modules này được dùng chung bởi tất cả services.

### 2.1. Thứ tự đọc

```
📁 backend/shared/
├── config/
│   ├── 1️⃣ db.js              ← Kết nối MongoDB
│   └── 2️⃣ services.js        ← Config ports các service (fallback)
│
├── middleware/
│   ├── 3️⃣ auth.js            ← JWT middleware (quan trọng!)
│   └── 4️⃣ errorHandler.js    ← Xử lý lỗi tập trung
│
└── utils/
    ├── 5️⃣ logger.js          ← Winston logging
    ├── 6️⃣ serviceDiscovery.js ← Consul integration (quan trọng!)
    ├── 7️⃣ circuitBreaker.js  ← Opossum circuit breaker
    ├── 8️⃣ websocket.js       ← Socket.IO utilities
    └── 9️⃣ emailService.js    ← Gửi email
```

### 2.2. Chi tiết từng file

#### 1️⃣ `config/db.js` - Kết nối MongoDB
```javascript
// Học được:
// - Cách kết nối MongoDB với Mongoose
// - Graceful shutdown
// - Connection event handlers
```

#### 2️⃣ `config/services.js` - Service Configuration
```javascript
// Học được:
// - Cấu hình ports các services
// - Fallback addresses khi Consul không hoạt động
```

#### 3️⃣ `middleware/auth.js` - JWT Authentication ⭐
```javascript
// Học được:
// - Cách verify JWT token
// - authMiddleware - bắt buộc đăng nhập
// - optionalAuth - optional authentication
// - adminMiddleware - kiểm tra quyền admin
// - Cách truyền userId qua header X-User-Id
```

#### 4️⃣ `middleware/errorHandler.js` - Error Handling
```javascript
// Học được:
// - Centralized error handling
// - Custom error responses
// - 404 handler
```

#### 5️⃣ `utils/logger.js` - Logging
```javascript
// Học được:
// - Winston logger configuration
// - Log levels (info, warn, error)
// - Log file rotation
```

#### 6️⃣ `utils/serviceDiscovery.js` - Consul Integration ⭐⭐
```javascript
// Học được:
// - Cách query Consul để lấy địa chỉ service
// - Caching service addresses
// - Fallback khi Consul down
// - Health check
```

#### 7️⃣ `utils/circuitBreaker.js` - Circuit Breaker Pattern ⭐⭐
```javascript
// Học được:
// - Opossum library
// - Circuit states: CLOSED → OPEN → HALF-OPEN
// - Timeout, error threshold, reset timeout
// - Event listeners (open, close, halfOpen)
```

#### 8️⃣ `utils/websocket.js` - Real-time
```javascript
// Học được:
// - Socket.IO server utilities
// - Emit events to specific users
// - Broadcast events
```

---

## 🔌 Phase 3: Microservices (2-3 giờ)

> Học từng service theo thứ tự từ đơn giản đến phức tạp.

### 3.1. Thứ tự học các Services

```
1️⃣ User Service      ← Đơn giản nhất, auth cơ bản
2️⃣ Market Service    ← External API, caching
3️⃣ Trade Service     ← CRUD đơn giản
4️⃣ Portfolio Service ← Tính toán P&L
5️⃣ Notification Service ← Cron job, alerts
```

### 3.2. Cấu trúc mỗi Service

```
📁 services/[service-name]/
├── server.js           ← Entry point, Express setup
├── controllers/        ← Business logic
│   └── xxxController.js
├── models/             ← Mongoose schemas
│   └── Xxx.js
├── routes/             ← API routes
│   └── xxxRoutes.js
└── utils/
    └── registerService.js  ← Đăng ký với Consul
```

### 3.3. User Service (Port 3001) - Học đầu tiên

```
📁 services/user-service/
├── server.js
├── controllers/
│   └── userController.js  ← register, login, profile, admin functions
├── models/
│   └── User.js            ← Schema: email, password, balance, role
├── routes/
│   └── userRoutes.js
└── utils/
    └── registerService.js
```

**Thứ tự đọc:**
1. `models/User.js` - Hiểu schema
2. `routes/userRoutes.js` - Các endpoints
3. `controllers/userController.js` - Logic xử lý
4. `server.js` - Cách khởi động service
5. `utils/registerService.js` - Đăng ký Consul

**Học được:**
- User registration với bcrypt
- Login và JWT token generation
- Balance management
- Admin functions

### 3.4. Market Service (Port 3002)

```
📁 services/market-service/
├── server.js
├── controllers/
│   └── marketController.js
├── providers/
│   └── coinPaprikaProvider.js  ← Fallback API
├── routes/
│   └── marketRoutes.js
└── utils/
    └── registerService.js
```

**Học được:**
- Gọi External API (CoinGecko)
- NodeCache caching (TTL 2 phút)
- Fallback provider pattern
- Rate limiting handling

### 3.5. Trade Service (Port 3004)

```
📁 services/trade-service/
├── server.js
├── controllers/
│   └── tradeController.js
├── models/
│   └── Trade.js
├── routes/
│   └── tradeRoutes.js
└── utils/
    └── registerService.js
```

**Học được:**
- Trade record schema
- History pagination
- Statistics aggregation

### 3.6. Portfolio Service (Port 3003)

```
📁 services/portfolio-service/
├── server.js
├── controllers/
│   └── portfolioController.js
├── models/
│   └── Portfolio.js
├── routes/
│   └── portfolioRoutes.js
└── utils/
    └── registerService.js
```

**Học được:**
- Holdings management
- Average buy price calculation
- Profit/Loss calculation

### 3.7. Notification Service (Port 3005)

```
📁 services/notification-service/
├── server.js
├── controllers/
│   └── notificationController.js
├── models/
│   ├── Notification.js
│   └── PriceAlert.js
├── routes/
│   └── notificationRoutes.js
└── utils/
    ├── registerService.js
    └── priceAlertChecker.js  ← Cron job logic
```

**Học được:**
- Notification system
- Price alerts với cron job (mỗi phút)
- Trigger conditions (above/below)

---

## 🚪 Phase 4: API Gateway & Orchestration (1-2 giờ)

> Đây là **trái tim** của hệ thống SOA.

### 4.1. Cấu trúc

```
📁 api-gateway/
├── server.js                    ← Main entry, proxy setup
└── orchestration/
    ├── tradeOrchestration.js    ← Buy/Sell logic (quan trọng nhất!)
    └── portfolioOrchestration.js
```

### 4.2. Thứ tự đọc

```
1️⃣ server.js (phần 1)
   - Middleware setup (cors, helmet, rate limit)
   - JWT authentication
   
2️⃣ server.js (phần 2)
   - Service proxy configuration
   - createProxyMiddleware setup
   
3️⃣ server.js (phần 3)
   - WebSocket setup (Socket.IO)
   - Health check endpoint

4️⃣ tradeOrchestration.js ⭐⭐⭐
   - Circuit Breaker cho mỗi service
   - Buy flow (7 steps)
   - Sell flow (7 steps)
   - Rollback mechanism

5️⃣ portfolioOrchestration.js
   - Enrich portfolio với current prices
```

### 4.3. Trade Orchestration - Luồng Mua Coin

```javascript
// 7 STEPS trong executeBuy():

Step 1: Lấy giá hiện tại     → Market Service
Step 2: Kiểm tra số dư       → User Service  
Step 3: Trừ tiền user        → User Service
Step 4: Thêm holding         → Portfolio Service
Step 5: Tạo trade record     → Trade Service
Step 6: Gửi notification     → Notification Service (async)
Step 7: Emit WebSocket       → Real-time update

// Nếu Step 3-5 lỗi → ROLLBACK:
- Hoàn tiền cho user
- Xóa holding đã thêm
```

### 4.4. Circuit Breaker trong Orchestration

```javascript
// Mỗi service có 1 circuit breaker riêng
const SERVICE_BREAKERS = {
  USER: createCircuitBreaker('UserService'),
  MARKET: createCircuitBreaker('MarketService'),
  PORTFOLIO: createCircuitBreaker('PortfolioService'),
  TRADE: createCircuitBreaker('TradeService'),
  NOTIFICATION: createCircuitBreaker('NotificationService'),
};

// Khi gọi service:
// 1. Check circuit state
// 2. Nếu OPEN → reject ngay, không gọi
// 3. Nếu CLOSED → gọi service
// 4. Nếu timeout/error nhiều → chuyển sang OPEN
```

---

## 💻 Phase 5: Frontend (1-2 giờ)

### 5.1. Cấu trúc

```
📁 frontend/src/
├── main.jsx              ← Entry point
├── App.jsx               ← Router setup
│
├── context/
│   └── AuthContext.jsx   ← Global auth state
│
├── hooks/
│   └── useAuth.js        ← Auth hook
│
├── services/
│   ├── api.js            ← Axios instance + interceptors
│   └── websocket.js      ← Socket.IO client
│
├── components/
│   ├── Layout.jsx        ← Main layout wrapper
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── Toast.jsx
│
└── pages/
    ├── Auth.jsx          ← Login/Register
    ├── Dashboard.jsx     ← Trang chủ
    ├── Trade.jsx         ← Mua/Bán
    ├── Portfolio.jsx     ← Danh mục
    ├── History.jsx       ← Lịch sử GD
    ├── Notifications.jsx
    ├── Settings.jsx      ← Price Alerts
    ├── CoinDetail.jsx
    └── Admin.jsx
```

### 5.2. Thứ tự đọc

```
1️⃣ services/api.js
   - Axios instance
   - JWT token interceptor
   - Error handling

2️⃣ services/websocket.js
   - Socket.IO connection
   - Event listeners

3️⃣ context/AuthContext.jsx
   - Global auth state
   - Login/Logout functions
   - Token persistence

4️⃣ App.jsx
   - React Router setup
   - Protected routes

5️⃣ pages/Auth.jsx
   - Login/Register forms

6️⃣ pages/Trade.jsx
   - Buy/Sell logic
   - Real-time price display

7️⃣ pages/Portfolio.jsx
   - Holdings display
   - Pie chart
```

---

## 🧪 Phase 6: Chạy thử & Debug (1 giờ)

### 6.1. Khởi động hệ thống

```powershell
# Terminal 1: MongoDB
mongod

# Terminal 2: Consul (optional)
consul agent -dev

# Terminal 3: Backend services
cd backend
.\start-all-services.ps1

# Terminal 4: Frontend
cd frontend
npm run dev
```

### 6.2. Test các luồng chính

| # | Luồng | Kiểm tra |
|---|-------|----------|
| 1 | Đăng ký | Tạo user mới với 1000 USDT |
| 2 | Đăng nhập | Nhận JWT token |
| 3 | Xem giá | Market Service trả về 8 coins |
| 4 | Mua coin | Orchestration 7 steps |
| 5 | Xem Portfolio | Holdings + P&L |
| 6 | Bán coin | Rollback nếu lỗi |
| 7 | Price Alert | Cron job trigger |

### 6.3. Debug tips

```javascript
// Xem logs của từng service
// Mỗi service log ra console với format:
// [timestamp] [level] [service] message

// Kiểm tra Consul UI
// http://localhost:8500

// Kiểm tra Circuit Breaker state
// Log sẽ hiện: 🔴 Circuit OPENED / 🟢 Circuit CLOSED
```

---

## 📖 Tài liệu bổ sung

### Đọc thêm trong project

| File | Nội dung |
|------|----------|
| `CIRCUIT_BREAKER_GUIDE.md` | Chi tiết về Circuit Breaker |
| `README.md` | Tổng quan và API docs |

### Công nghệ cần tìm hiểu thêm

| Công nghệ | Link |
|-----------|------|
| Express.js | https://expressjs.com/ |
| Mongoose | https://mongoosejs.com/ |
| JWT | https://jwt.io/ |
| Consul | https://www.consul.io/ |
| Opossum | https://nodeshift.dev/opossum/ |
| Socket.IO | https://socket.io/ |
| React | https://react.dev/ |
| TailwindCSS | https://tailwindcss.com/ |

---

## ✅ Checklist hoàn thành

- [ ] Hiểu kiến trúc SOA tổng quan
- [ ] Đọc hiểu shared modules (db, auth, serviceDiscovery, circuitBreaker)
- [ ] Hiểu cách User Service hoạt động
- [ ] Hiểu Market Service và caching
- [ ] Hiểu Trade/Portfolio/Notification Services
- [ ] Hiểu API Gateway và proxy
- [ ] Hiểu Trade Orchestration (7 steps + rollback)
- [ ] Hiểu Frontend structure và auth flow
- [ ] Chạy thử và test các luồng chính
- [ ] Debug và đọc logs

---

## 💡 Tips

1. **Đừng cố đọc hết một lần** - Chia nhỏ theo phases
2. **Chạy code khi đọc** - Debug để hiểu flow thực tế
3. **Đọc logs** - Logs giúp hiểu luồng request/response
4. **Tập trung vào Orchestration** - Đây là điểm khác biệt của SOA
5. **Hiểu Circuit Breaker** - Pattern quan trọng cho microservices

---

**Happy Learning! 🚀**
