# 👥 PHÂN CÔNG NHIỆM VỤ NHÓM - CryptoTradingSOA

> **Cập nhật:** 17/12/2025  
> **Nhóm:** 3 thành viên  
> **Timeline:** 6 tuần

---

## 📋 TÓM TẮT PHÂN CÔNG

| Thành viên                     | Services                                                   | Lines of Code | Độ khó               | Thời gian |
| ------------------------------ | ---------------------------------------------------------- | ------------- | -------------------- | --------- |
| **Thành viên 3**               | Trade Service                                              | ~280 lines    | ⭐⭐ Dễ              | 3-4 ngày  |
| **Thành viên 2**               | Market + Notification                                      | ~800 lines    | ⭐⭐⭐ Trung bình    | 6-8 ngày  |
| **Thành viên 1 (Nhóm trưởng)** | User + Portfolio + API Gateway + Frontend + Infrastructure | ~5000+ lines  | ⭐⭐⭐⭐⭐⭐ Rất khó | 3-4 tuần  |

---

## 👤 THÀNH VIÊN 3 - TRADE SERVICE

### 📦 Phạm vi công việc

**1 SERVICE:** Trade Service (CRUD đơn giản)

### 📁 Files cần implement

```
backend/services/trade-service/
├── models/
│   └── Trade.js                      (~50 lines)
├── controllers/
│   └── tradeController.js            (~100 lines)
├── routes/
│   └── tradeRoutes.js                (~20 lines)
├── utils/
│   └── registerService.js            (~30 lines)
└── server.js                         (~80 lines)
```

### 📝 Nhiệm vụ chi tiết

#### 1. Trade Model (models/Trade.js)

**Schema cần có:**

```javascript
{
  userId: ObjectId,
  type: String,           // 'buy' hoặc 'sell'
  symbol: String,         // 'BTC', 'ETH'
  coinId: String,         // 'bitcoin', 'ethereum'
  coinName: String,       // 'Bitcoin', 'Ethereum'
  amount: Number,         // Số lượng coin
  price: Number,          // Giá tại thời điểm giao dịch
  totalCost: Number,      // Tổng giá trị
  fee: Number,            // Phí giao dịch
  feePercentage: Number,  // % phí
  balanceBefore: Number,  // Số dư trước giao dịch
  balanceAfter: Number,   // Số dư sau giao dịch
  createdAt: Date
}
```

#### 2. Controller (controllers/tradeController.js)

**Endpoints cần implement:**

**a) POST /** - Create trade record

- Input: Trade data từ API Gateway
- Output: Trade record đã lưu
- **LƯU Ý:** Endpoint này CHỈ lưu record, KHÔNG thực hiện trade logic

**b) GET /history** - Get user's trade history

- Input: userId từ header `X-User-Id`
- Query params:
  - `page` (default: 1)
  - `limit` (default: 20)
  - `type` (optional: 'buy' hoặc 'sell')
  - `symbol` (optional: filter by coin)
- Output: Paginated trade list
- Sort: Mới nhất trên đầu (executedAt: -1)

#### 3. Routes (routes/tradeRoutes.js)

```javascript
POST    /              // createTrade
GET     /history       // getTradeHistory
```

#### 4. Server Setup (server.js)

- Express server trên port từ .env
- Connect MongoDB
- Register với Consul
- Error handling middleware

### ✅ Checklist hoàn thành

- [ ] Trade model với đầy đủ fields
- [ ] POST / - Create trade (test với Postman)
- [ ] GET /history - List trades với pagination
- [ ] Register service với Consul
- [ ] Error handling middleware
- [ ] Test tất cả endpoints
- [ ] Code có comments rõ ràng
- [ ] Viết README.md cho Trade Service
- [ ] Create Pull Request để review

### ⏱️ Timeline

- **Ngày 1-2:** Setup + Model + Basic CRUD
- **Ngày 3:** Aggregation + Pagination
- **Ngày 4:** Testing + Documentation

### 🎓 Mục tiêu học tập

- Mongoose schema & validation
- Express routing & controllers
- MongoDB aggregation pipeline
- Pagination implementation
- Error handling

---

## 👤 THÀNH VIÊN 2 - MARKET SERVICE & NOTIFICATION SERVICE

### 📦 Phạm vi công việc

**2 SERVICES:** Market Service + Notification Service

---

### 🌍 MARKET SERVICE (Làm trước - DỄ HƠN)

#### 📁 Files cần implement

```
backend/services/market-service/
├── controllers/
│   └── marketController.js           (~200 lines)
├── providers/
│   └── coinPaprikaProvider.js        (~80 lines)
├── routes/
│   └── marketRoutes.js               (~30 lines)
├── utils/
│   └── registerService.js            (~30 lines)
└── server.js                         (~80 lines)
```

#### 📝 Nhiệm vụ chi tiết

**1. Market Controller (controllers/marketController.js)**

**Endpoints:**

**a) GET /prices** - Giá tất cả coins

- Call CoinGecko API: `https://api.coingecko.com/api/v3/simple/price`
- Params: `ids=bitcoin,ethereum,...&vs_currencies=usd`
- Cache: 2 phút (NodeCache)
- Response: Array of coins với price, 24h change

**b) GET /price/:coinId** - Single coin price

- Call CoinGecko: `https://api.coingecko.com/api/v3/simple/price`
- Params: `ids=${coinId}&vs_currencies=usd`
- Cache: 2 phút
- Response: `{ price: Number, name: String }`

**c) GET /chart/:coinId** - Chart data (7 days)

- Call CoinGecko: `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`
- Params: `vs_currency=usd&days=7`
- Cache: 5 phút (dài hơn vì ít thay đổi)
- Response: Array of [timestamp, price]

**2. Caching Strategy**

```javascript
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 120 }); // 2 phút

// Trong controller
const cachedData = cache.get(cacheKey);
if (cachedData) {
  return res.json(cachedData);
}
// ... call API ...
cache.set(cacheKey, data);
```

**3. Fallback Provider (providers/coinPaprikaProvider.js)**

- Nếu CoinGecko fail → call CoinPaprika API
- Backup URL: `https://api.coinpaprika.com/v1/`
- Transform response về format giống CoinGecko

#### ✅ Checklist Market Service

- [x] GET /prices - All supported coins prices
- [ ] GET /price/:coinId - Single price
- [ ] GET /chart/:coinId - 7 days chart
- [ ] NodeCache implementation (2 min cho price, 5 min cho chart)
- [ ] Fallback provider (CoinPaprika)
- [ ] Error handling cho external API
- [ ] Register với Consul
- [ ] Test tất cả endpoints
- [ ] Documentation

---

### 🔔 NOTIFICATION SERVICE (Làm sau - PHỨC TẠP HƠN)

#### 📁 Files cần implement

```
backend/services/notification-service/
├── models/
│   ├── Notification.js               (~40 lines)
│   └── PriceAlert.js                 (~50 lines)
├── controllers/
│   └── notificationController.js     (~250 lines)
├── routes/
│   └── notificationRoutes.js         (~40 lines)
├── utils/
│   ├── priceAlertChecker.js         (~100 lines)
│   └── registerService.js            (~30 lines)
└── server.js                         (~100 lines)
```

#### 📝 Nhiệm vụ chi tiết

**1. Models**

**Notification.js:**

```javascript
{
  userId: ObjectId,
  type: String,        // 'trade', 'alert', 'system'
  title: String,
  message: String,
  data: Object,        // Additional data
  isRead: Boolean,
  createdAt: Date
}
```

**PriceAlert.js:**

```javascript
{
  userId: ObjectId,
  coinId: String,      // 'bitcoin', 'ethereum'
  symbol: String,      // 'BTC', 'ETH'
  targetPrice: Number,
  condition: String,   // 'above' hoặc 'below'
  isActive: Boolean,   // ⚠️ QUAN TRỌNG: Dùng isActive, KHÔNG phải status
  triggeredAt: Date,
  createdAt: Date
}
```

**⚠️ LƯU Ý QUAN TRỌNG:**

- PriceAlert model KHÔNG CÓ field `status`
- Dùng `isActive: Boolean` thay vì `status`
- Đã có 2 bugs trong code cũ (đã được fix):
  - Line 259: Bỏ field 'status' khi create
  - Line 295: Filter bằng 'isActive' không phải 'status'

**2. Controller (controllers/notificationController.js)**

**Endpoints:**

**a) POST /send** - Tạo notification

- Input: `{ userId, type, title, message, data }`
- Output: Notification đã lưu
- Side effect: Emit qua WebSocket

**b) GET /** - Lấy notifications của user

- Input: userId từ header
- Query: `isRead` (optional filter)
- Output: Array notifications, sort by createdAt desc

**c) PUT /:id/read** - Đánh dấu đã đọc

- Input: notificationId
- Output: Updated notification

**d) POST /price-alert** - Tạo price alert

- Input: `{ coinId, symbol, targetPrice, condition }`
- Validate: condition phải là 'above' hoặc 'below'
- Output: Price alert đã lưu

**e) GET /price-alerts** - Lấy price alerts

- Input: userId từ header
- Query: `isActive` (optional)
- Output: Array price alerts

**f) PUT /price-alert/:id** - Update price alert

- Input: alertId, `{ targetPrice, condition, isActive }`
- Output: Updated alert

**g) DELETE /price-alert/:id** - Xóa price alert

- Input: alertId
- Output: Success message

**3. Cron Job (utils/priceAlertChecker.js) - QUAN TRỌNG!**

**Setup:**

```javascript
const cron = require("node-cron");

// Chạy mỗi 1 phút
cron.schedule("* * * * *", async () => {
  await checkPriceAlerts();
});
```

**Logic checkPriceAlerts():**

```
1. Lấy tất cả active alerts (isActive = true)
2. Với mỗi alert:
   a. Gọi Market Service để lấy current price
   b. Check condition:
      - 'above': currentPrice >= targetPrice
      - 'below': currentPrice <= targetPrice
   c. Nếu trigger:
      - Tạo Notification
      - Emit qua WebSocket: global.io.to(`user_${userId}`).emit('price_alert', data)
      - Set alert.isActive = false (để không spam)
      - Lưu alert.triggeredAt = now
3. Log kết quả
```

**4. WebSocket Integration**

Trong controller, sau khi create notification:

```javascript
// Send real-time notification
if (global.io) {
  global.io.to(`user_${userId}`).emit("notification", {
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
  });
}
```

#### ✅ Checklist Notification Service

- [ ] Notification model (KHÔNG có field status)
- [ ] PriceAlert model (dùng isActive)
- [ ] POST /send - Create notification + WebSocket emit
- [ ] GET / - List notifications với filter
- [ ] PUT /:id/read - Mark as read
- [ ] POST /price-alert - Create alert với validation
- [ ] GET /price-alerts - List alerts
- [ ] PUT /price-alert/:id - Update alert
- [ ] DELETE /price-alert/:id - Delete alert
- [ ] Cron job chạy mỗi 1 phút
- [ ] priceAlertChecker logic hoàn chỉnh
- [ ] WebSocket emit khi trigger alert
- [ ] Test tất cả flows
- [ ] KHÔNG CÓ BUG về field status/isActive
- [ ] Documentation

### ⏱️ Timeline Thành viên 2

**Tuần 1 (3-4 ngày):**

- Market Service hoàn chỉnh
- Testing Market Service

**Tuần 2 (4-5 ngày):**

- Notification Service (models + CRUD)
- Cron job + WebSocket
- Testing toàn bộ

### 🎓 Mục tiêu học tập

- External API integration
- Caching strategies
- Cron jobs
- WebSocket real-time communication
- Complex business logic

---

## 👨‍💼 THÀNH VIÊN 1 (NHÓM TRƯỞNG) - CORE SYSTEM

### 📦 Phạm vi công việc

- **User Service** (Authentication & Balance)
- **Portfolio Service** (DCA & P&L)
- **API Gateway** (Orchestration & Routing)
- **Shared Utilities** (Foundation)
- **Toàn bộ Frontend** (React)
- **Project Infrastructure** (Database, Config, Deployment)

---

### 🔐 USER SERVICE

#### 📁 Files

```
backend/services/user-service/
├── models/User.js
├── controllers/userController.js
├── routes/userRoutes.js
├── utils/registerService.js
└── server.js
```

#### 📝 Nhiệm vụ chính

**1. User Model:**

- bcrypt password hashing
- Balance management
- Balance history subdocuments
- Role-based access (user, admin)

**2. Authentication:**

- Register với validation
- Login với JWT token
- Password reset (optional)

**3. Balance Management:**

- Get balance
- Update balance (add/subtract)
- Balance history tracking

**4. Admin Functions:**

- List all users
- Update user role
- Delete user

---

### 💼 PORTFOLIO SERVICE

#### 📁 Files

```
backend/services/portfolio-service/
├── models/Portfolio.js
├── controllers/portfolioController.js
├── routes/portfolioRoutes.js
├── utils/registerService.js
└── server.js
```

#### 📝 Nhiệm vụ chính

**1. DCA Calculation (Quan trọng!):**

```javascript
// Khi add coin:
newAvgPrice = (oldAmount * oldAvgPrice + newAmount * newPrice) / totalAmount;
```

**2. Holdings Management:**

- Add coin (tự động calculate DCA)
- Remove coin
- Get portfolio với P&L

**3. Statistics:**

- Total value
- Total invested
- Total profit/loss
- Profit percentage

---

### 🌐 API GATEWAY (QUAN TRỌNG NHẤT!)

#### 📁 Files

```
backend/api-gateway/
├── server.js                         (~300 lines)
├── orchestration/
│   ├── tradeOrchestration.js        (~750 lines)
│   └── portfolioOrchestration.js    (~180 lines)
```

#### 📝 Nhiệm vụ chính

**1. Server Setup (server.js):**

- Helmet security headers
- CORS configuration
- Morgan + Winston logging
- Rate limiting (global, login, register)
- Dynamic proxy với service discovery
- Path rewriting
- WebSocket setup
- Routing configuration

**2. Trade Orchestration (CỰC KỲ QUAN TRỌNG!):**

**Buy Coin Flow (7 bước):**

```
1. Get price từ Market Service
2. Check balance từ User Service
3. Deduct balance (trừ tiền)
4. Add holding vào Portfolio
5. Create trade record
6. Send notification
7. WebSocket real-time update

NẾU LỖI → ROLLBACK:
- Remove holding (nếu đã thêm)
- Refund balance (nếu đã trừ)
```

**Sell Coin Flow (7 bước):**

```
1. Check portfolio (đủ coin không)
2. Get price từ Market Service
3. Get balance hiện tại
4. Add balance (cộng tiền)
5. Reduce holding từ Portfolio
6. Create trade record
7. Send notification + WebSocket

NẾU LỖI → ROLLBACK:
- Add holding back (nếu đã trừ)
- Deduct balance (nếu đã cộng)
```

**3. Portfolio Orchestration:**

- Get portfolio từ Portfolio Service
- Get prices SONG SONG từ Market Service (Promise.all)
- Calculate enriched data (P&L, percentages)
- Fallback prices nếu Market Service fail

---

### 🔧 SHARED UTILITIES

#### 📁 Files

```
backend/shared/
├── config/
│   ├── db.js                  // MongoDB connection
│   └── services.js            // Service configuration
├── middleware/
│   ├── auth.js                // JWT middleware
│   └── errorHandler.js        // Error handling
└── utils/
    ├── logger.js              // Winston logger
    ├── circuitBreaker.js      // Opossum wrapper
    ├── serviceDiscovery.js    // Consul integration
    ├── websocket.js           // Socket.IO helpers
    └── emailService.js        // Nodemailer setup
```

**Ưu tiên implement trước để TV2, TV3 dùng!**

---

### ⚛️ FRONTEND (React)

#### 📁 Structure

```
frontend/src/
├── main.jsx                   // Entry point
├── App.jsx                    // Routes
├── services/
│   ├── api.js                 // Axios instance
│   └── websocket.js           // Socket.IO client
├── context/
│   └── AuthContext.jsx        // Auth state
├── hooks/
│   └── useAuth.js             // Auth hook
├── components/
│   ├── Layout.jsx
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── Toast.jsx
└── pages/
    ├── Auth.jsx               // Login/Register
    ├── Dashboard.jsx          // Overview
    ├── Trade.jsx              // Buy/Sell
    ├── Portfolio.jsx          // Holdings
    ├── History.jsx            // Trades
    ├── Notifications.jsx      // Alerts
    ├── CoinDetail.jsx         // Coin info
    ├── Settings.jsx           // User settings
    └── Admin.jsx              // Admin panel
```

#### 📝 Nhiệm vụ chính

**1. Core Setup:**

- Axios instance với interceptors
- JWT token management
- WebSocket connection
- AuthContext với login/logout

**2. Key Pages:**

- **Trade.jsx:** Buy/Sell với real-time price updates
- **Portfolio.jsx:** Holdings với P&L, WebSocket updates
- **Dashboard.jsx:** Overview statistics

**3. Real-time Features:**

- Price updates qua WebSocket
- Trade confirmations
- Notifications
- Balance updates

---

### 🏗️ PROJECT INFRASTRUCTURE

**Nhiệm vụ:**

- Database schema design
- Environment configuration (.env templates)
- Docker setup (optional)
- Documentation (README, API docs)
- Code review cho TV2, TV3
- Integration testing
- Deployment guide

---

### ⏱️ Timeline Thành viên 1

**Tuần 1:**

- Shared utilities setup
- Database setup
- Documentation cho TV2, TV3

**Tuần 2:**

- User Service
- Portfolio Service
- Review TV2, TV3 code

**Tuần 3:**

- API Gateway routing
- Review TV2 Notification Service

**Tuần 4:**

- Trade Orchestration (rollback mechanism)
- Portfolio Orchestration
- Integration testing

**Tuần 5-6:**

- Frontend TOÀN BỘ
- UI/UX polish
- Final testing
- Deployment

---

## 📅 TIMELINE TỔNG THỂ

### Tuần 1: Setup & Foundation

**Thành viên 1:**

- [ ] Setup MongoDB
- [ ] Implement shared utilities (logger, db, auth)
- [ ] Git repo + branch protection
- [ ] Documentation cho TV2, TV3

**Thành viên 2:**

- [ ] Đọc hiểu Market Service
- [ ] Setup local environment
- [ ] Test CoinGecko API

**Thành viên 3:**

- [ ] Đọc hiểu Trade Service
- [ ] Setup local environment
- [ ] Thiết kế Trade schema

---

### Tuần 2: Backend Development - Round 1

**Thành viên 1:**

- [ ] User Service (authentication + balance)
- [ ] Review code TV2, TV3

**Thành viên 2:**

- [ ] Implement Market Service HOÀN CHỈNH
- [ ] Testing endpoints
- [ ] Documentation

**Thành viên 3:**

- [ ] Implement Trade Service HOÀN CHỈNH
- [ ] Testing endpoints
- [ ] Documentation

---

### Tuần 3: Backend Development - Round 2

**Thành viên 1:**

- [ ] Portfolio Service
- [ ] API Gateway setup (routes, proxy)
- [ ] Review Notification Service

**Thành viên 2:**

- [ ] Implement Notification Service
- [ ] Setup cron job
- [ ] WebSocket integration
- [ ] Testing

**Thành viên 3:**

- [ ] Testing Trade Service
- [ ] Fix bugs
- [ ] Hỗ trợ testing integration

---

### Tuần 4: API Gateway & Orchestration

**Thành viên 1:**

- [ ] Trade Orchestration (buy/sell + rollback)
- [ ] Portfolio Orchestration
- [ ] Circuit breaker integration
- [ ] Integration testing

**Thành viên 2 & 3:**

- [ ] Bug fixing
- [ ] Testing với API Gateway
- [ ] Hỗ trợ test orchestration

---

### Tuần 5: Frontend - Core

**Thành viên 1:**

- [ ] Frontend setup (routing, API, WebSocket)
- [ ] Auth pages
- [ ] Dashboard
- [ ] Layout components

**Thành viên 2 & 3:**

- [ ] Testing backend integration
- [ ] Bug reporting
- [ ] User Acceptance Testing

---

### Tuần 6: Frontend - Features & Polish

**Thành viên 1:**

- [ ] Trade page (Buy/Sell)
- [ ] Portfolio page
- [ ] History & Notifications
- [ ] UI/UX polish
- [ ] Final testing

**Thành viên 2 & 3:**

- [ ] UAT
- [ ] Bug fixes
- [ ] Documentation updates

---

## ✅ DEFINITION OF DONE (DoD)

### Mỗi Service phải có:

- [ ] ✅ Code implement đầy đủ chức năng
- [ ] ✅ Tất cả endpoints test thành công
- [ ] ✅ Error handling đầy đủ
- [ ] ✅ Register với Consul thành công
- [ ] ✅ Code có comments rõ ràng
- [ ] ✅ README.md với API documentation
- [ ] ✅ Pass code review
- [ ] ✅ No critical bugs
- [ ] ✅ Merged vào branch dev

---

## 🔄 GIT WORKFLOW

### Branch Structure:

```
main (protected - production)
  └── dev (protected - integration)
      ├── feature/trade-service (TV3)
      ├── feature/market-service (TV2)
      ├── feature/notification-service (TV2)
      ├── feature/user-service (TV1)
      ├── feature/portfolio-service (TV1)
      ├── feature/api-gateway (TV1)
      └── feature/frontend (TV1)
```

### Pull Request Process:

1. Create feature branch
2. Commit regularly với clear messages
3. Push to remote
4. Create PR to `dev`
5. Request review từ Thành viên 1
6. Address review comments
7. Merge sau khi approve
8. Delete feature branch

### Commit Message Format:

```
[Service] Type: Short description

Examples:
[Trade] feat: Add create trade endpoint
[Market] fix: Fix caching issue for price data
[Notification] refactor: Improve cron job performance
```

---

## 📞 COMMUNICATION

### Daily Standup (15 phút mỗi sáng):

**Format:**

- Yesterday: Làm được gì?
- Today: Sẽ làm gì?
- Blockers: Gặp vấn đề gì?

### Code Review:

- Tất cả PR phải qua Thành viên 1 review
- Review trong vòng 24h
- Merge sau khi pass review + tests

### Issue Tracking:

- Tạo GitHub Issues cho bugs
- Label: bug, feature, documentation
- Assign người chịu trách nhiệm

---

## 🆘 TROUBLESHOOTING

### Thành viên 2 & 3 gặp vấn đề:

1. ✅ Check documentation trước
2. ✅ Google/StackOverflow
3. ✅ Ask in team chat
4. ✅ Schedule 1-on-1 với Thành viên 1

### Common Issues:

**MongoDB Connection:**

```bash
# Check MongoDB running
mongo --version
# Start MongoDB
mongod
```

**Consul Service Discovery:**

```bash
# Check Consul running
consul version
# Start Consul
consul agent -dev
```

**Port Already in Use:**

```bash
# Kill process on port
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

---

## 📚 RESOURCES

### Documentation:

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [React Docs](https://react.dev/)
- [Socket.IO Docs](https://socket.io/)

### Learning Resources:

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Patterns](https://reactpatterns.com/)

---

## 🎯 SUCCESS CRITERIA

### Project hoàn thành khi:

- [ ] ✅ Tất cả 5 microservices chạy thành công
- [ ] ✅ API Gateway orchestration hoạt động (buy/sell/rollback)
- [ ] ✅ Frontend connect được backend
- [ ] ✅ WebSocket real-time updates hoạt động
- [ ] ✅ Không có critical bugs
- [ ] ✅ Code coverage >= 70% (optional)
- [ ] ✅ Documentation đầy đủ
- [ ] ✅ Demo thành công

---

## 📝 NOTES

### Quan trọng:

- **Code quality > Speed:** Không rush, code phải clean
- **Communication is key:** Hỏi khi không hiểu
- **Test thoroughly:** Mỗi endpoint test ít nhất 3-5 cases
- **Document everything:** README, comments, API docs

### Lưu ý cho TV2, TV3:

- ⚠️ **Notification Service:** KHÔNG dùng field `status`, dùng `isActive`
- ⚠️ **Market Service:** Remember caching TTL (2min vs 5min)
- ⚠️ **Trade Service:** Validate userId trong mọi endpoint

---

**Good luck team! 🚀**

> **Liên hệ Nhóm trưởng (Thành viên 1) nếu có bất kỳ thắc mắc nào!**
