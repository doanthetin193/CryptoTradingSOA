# 🔄 FRONTEND → BACKEND FLOWS

> **Tổng cộng:** 28 REST Endpoints + 3 WebSocket Events được sử dụng

---

## 📊 THỐNG KÊ

| Loại              | Số lượng           |
| ----------------- | ------------------ |
| Auth APIs         | 3                  |
| User APIs         | 2                  |
| Market APIs       | 4                  |
| Portfolio APIs    | 1                  |
| Trade APIs        | 3                  |
| Notification APIs | 7                  |
| Admin APIs        | 5                  |
| WebSocket Events  | 3                  |
| **TỔNG**          | **28 REST + 3 WS** |

---

## 🔐 1. AUTHENTICATION (3 endpoints)

### 1.1 POST /users/register

```
Frontend:  Auth.jsx (handleRegister)
  ↓        api.js → authAPI.register()
Gateway:   server.js line 194 → registerLimiter (3/hour) → userProxy
Service:   User Service → userController.register()
  ↓        - Check email exists
  ↓        - bcrypt hash password
  ↓        - Generate JWT token
Response:  { token, user }
Frontend:  Save token → AuthContext → Navigate /dashboard
```

### 1.2 POST /users/login

```
Frontend:  Auth.jsx (handleLogin)
  ↓        api.js → authAPI.login()
Gateway:   server.js line 193 → loginLimiter (5 fail/15min) → userProxy
Service:   User Service → userController.login()
  ↓        - Compare password
  ↓        - Generate JWT
Response:  { token, user }
Frontend:  Save token → AuthContext → Navigate /dashboard
```

### 1.3 GET /users/profile

```
Frontend:  AuthContext.jsx (fetchUserProfile)
  ↓        api.js → authAPI.getProfile()
Gateway:   server.js line 199 → authMiddleware → userProxy
Service:   User Service → userController.getProfile()
  ↓        - Get user by req.userId
Response:  { user }
Frontend:  AuthContext.setUser()
```

---

## 👤 2. USER (2 endpoints)

### 2.1 GET /users/balance

```
Frontend:  AuthContext.jsx (fetchUserProfile fallback)
  ↓        api.js → userAPI.getBalance()
Gateway:   server.js line 199 → authMiddleware → userProxy
Service:   User Service → userController.getBalance()
Response:  { balance }
Frontend:  Update balance state
```

### 2.2 PUT /users/profile

```
Frontend:  Settings.jsx (handleUpdateProfile)
  ↓        api.js → userAPI.updateProfile()
Gateway:   server.js line 199 → authMiddleware → userProxy
Service:   User Service → userController.updateProfile()
  ↓        - Update username, email
Response:  { user }
Frontend:  toast.success() → fetchUserProfile()
```

---

## 📈 3. MARKET (4 endpoints)

### 3.1 GET /market/prices

```
Frontend:  Dashboard.jsx, Trade.jsx (useEffect)
  ↓        api.js → marketAPI.getPrices()
Gateway:   server.js line 208 → optionalAuth → marketProxy
Service:   Market Service → marketController.getPrices()
  ↓        - Check NodeCache (2min TTL)
  ↓        - Call CoinGecko API
Response:  [{ id, symbol, name, price, change24h }]
Frontend:  setMarketData() → Render
```

### 3.2 GET /market/price/:coinId

```
Frontend:  CoinDetail.jsx (useEffect)
  ↓        api.js → marketAPI.getCoinPrice(coinId)
Gateway:   server.js line 208 → optionalAuth → marketProxy
Service:   Market Service → marketController.getCoinPrice()
  ↓        - Check cache
  ↓        - Call CoinGecko
Response:  { price, name, change24h }
Frontend:  setCoinData()
```

### 3.3 GET /market/chart/:coinId

```
Frontend:  CoinDetail.jsx (useEffect)
  ↓        api.js → marketAPI.getChartData(coinId)
Gateway:   server.js line 208 → optionalAuth → marketProxy
Service:   Market Service → marketController.getChartData()
  ↓        - Check cache (5min TTL)
  ↓        - Call CoinGecko /market_chart
Response:  [[timestamp, price], ...]
Frontend:  setChartData() → Render chart
```

---

## 💼 4. PORTFOLIO (1 endpoint - ORCHESTRATION)

### 4.1 GET /portfolio

```
Frontend:  Dashboard.jsx, Portfolio.jsx (useEffect)
  ↓        api.js → portfolioAPI.getPortfolio()
Gateway:   server.js line 211 → authMiddleware
  ↓        → portfolioOrchestration.getEnrichedPortfolio() ⭐

Orchestration (portfolioOrchestration.js):
  STEP 1:  Call Portfolio Service → GET /
    ↓      holdings: [{ symbol, amount, averageBuyPrice }]

  STEP 2:  Call Market Service PARALLEL → GET /price/:coinId
    ↓      Promise.all([getPrice('bitcoin'), getPrice('ethereum')])

  STEP 3:  Calculate enriched data
    ↓      currentValue = amount × currentPrice
    ↓      profit = currentValue - invested
    ↓      profitPercentage = (profit / invested) × 100

Response:  { holdings: [{ ...holding, currentPrice, profit, profitPercentage }], totalValue, totalProfit }
Frontend:  setPortfolio() → Render table với P&L
```

---

## 💰 5. TRADE (3 endpoints - 2 ORCHESTRATION)

### 5.1 POST /trade/buy ⭐⭐⭐

```
Frontend:  Trade.jsx (handleBuySubmit)
  ↓        api.js → tradeAPI.buy({ symbol, coinId, amount })
Gateway:   server.js line 217 → express.json() → authMiddleware
  ↓        → tradeOrchestration.buyCoin() ⭐

Orchestration (tradeOrchestration.js - 7 STEPS):
  STEP 1:  Market Service → GET /price/:coinId
    ↓      Calculate: totalCost, fee, finalCost

  STEP 2:  User Service → GET /balance
    ↓      Check đủ tiền không

  STEP 3:  User Service → PUT /balance { amount: -finalCost }
    ↓      transactionState.balanceDeducted = true

  STEP 4:  Portfolio Service → POST /holding
    ↓      Add coin, calculate DCA
    ↓      transactionState.holdingAdded = true

  STEP 5:  Trade Service → POST /
    ↓      Record trade history

  STEP 6:  Notification Service → POST /send (non-blocking)

  STEP 7:  WebSocket → global.io.emit('trade_confirmation')

  ERROR:   ROLLBACK
    ↓      - Remove holding (nếu đã thêm)
    ↓      - Refund balance (nếu đã trừ)

Response:  { trade, newBalance }
Frontend:  toast.success() → fetchBalance() → navigate('/portfolio')
```

### 5.2 POST /trade/sell ⭐⭐⭐

```
Frontend:  Trade.jsx (handleSellSubmit)
  ↓        api.js → tradeAPI.sell({ symbol, amount })
Gateway:   server.js line 218 → express.json() → authMiddleware
  ↓        → tradeOrchestration.sellCoin() ⭐

Orchestration (tradeOrchestration.js - 7 STEPS NGƯỢC):
  STEP 1:  Portfolio Service → GET /
    ↓      Check đủ coin không

  STEP 2:  Market Service → GET /price/:coinId

  STEP 3:  User Service → GET /balance (để log)

  STEP 4:  User Service → PUT /balance { amount: +finalProceeds }
    ↓      transactionState.balanceAdded = true

  STEP 5:  Portfolio Service → PUT /holding (reduce)
    ↓      transactionState.holdingReduced = true

  STEP 6:  Trade Service → POST /

  STEP 7:  Notification + WebSocket

  ERROR:   ROLLBACK
    ↓      - Add holding back
    ↓      - Deduct balance

Response:  { trade, newBalance }
Frontend:  toast.success() → fetchBalance() → navigate('/portfolio')
```

### 5.3 GET /trade/history

```
Frontend:  History.jsx (useEffect)
  ↓        api.js → tradeAPI.getHistory()
Gateway:   server.js line 223 → authMiddleware → tradeProxy
Service:   Trade Service → tradeController.getHistory()
  ↓        - Find by userId
  ↓        - Pagination, sort by date desc
Response:  [{ type, symbol, amount, price, createdAt }]
Frontend:  setTrades() → Render table
```

---

## 🔔 6. NOTIFICATION (7 endpoints)

### 6.1 GET /notifications

```
Frontend:  Navbar.jsx (fetchNotifications)
           Notifications.jsx (useEffect)
  ↓        api.js → notificationAPI.getNotifications()
Gateway:   server.js line 226 → authMiddleware → notificationProxy
Service:   Notification Service → notificationController.getNotifications()
  ↓        - Find by userId, filter isRead
Response:  [{ type, title, message, isRead, createdAt }]
Frontend:  setNotifications()
```

### 6.2 GET /notifications/unread-count

```
Frontend:  Navbar.jsx (useEffect - interval 30s)
  ↓        api.js → notificationAPI.getUnreadCount()
Gateway:   server.js line 226 → authMiddleware → notificationProxy
Service:   Notification Service → Count({ userId, isRead: false })
Response:  { count }
Frontend:  setUnreadCount() → Badge display
```

### 6.3 PUT /notifications/:id/read

```
Frontend:  Navbar.jsx, Notifications.jsx (handleMarkAsRead)
  ↓        api.js → notificationAPI.markAsRead(id)
Gateway:   server.js line 226 → authMiddleware → notificationProxy
Service:   Notification Service → Update({ _id, userId }, { isRead: true })
Response:  { notification }
Frontend:  fetchNotifications() → Decrease unreadCount
```

### 6.4 PUT /notifications/read-all

```
Frontend:  Notifications.jsx (handleMarkAllAsRead)
  ↓        api.js → notificationAPI.markAllAsRead()
Gateway:   server.js line 226 → authMiddleware → notificationProxy
Service:   Notification Service → Update many({ userId, isRead: false })
Response:  { modifiedCount }
Frontend:  fetchNotifications() → setUnreadCount(0)
```

### 6.5 DELETE /notifications/:id

```
Frontend:  Navbar.jsx, Notifications.jsx (handleDelete)
  ↓        api.js → notificationAPI.deleteNotification(id)
Gateway:   server.js line 226 → authMiddleware → notificationProxy
Service:   Notification Service → Delete({ _id, userId })
Response:  { success }
Frontend:  fetchNotifications()
```

### 6.6 POST /notifications/alert

```
Frontend:  Settings.jsx (handleCreateAlert)
  ↓        api.js → notificationAPI.createPriceAlert()
Gateway:   server.js line 226 → authMiddleware → notificationProxy
Service:   Notification Service → Create PriceAlert
  ↓        { userId, coinId, targetPrice, condition: 'above'/'below', isActive: true }

Background (priceAlertChecker.js - CRON JOB mỗi 1 phút):
  ↓        Get active alerts
  ↓        Get current prices từ Market Service
  ↓        Check condition trigger
  ↓        Create notification + WebSocket + Set isActive = false

Response:  { alert }
Frontend:  fetchAlerts()
```

### 6.7 GET /notifications/alerts

```
Frontend:  Settings.jsx (useEffect)
  ↓        api.js → notificationAPI.getPriceAlerts()
Gateway:   server.js line 226 → authMiddleware → notificationProxy
Service:   Notification Service → Find PriceAlerts by userId
Response:  [{ coinId, targetPrice, condition, isActive }]
Frontend:  setAlerts() → Render list
```

### 6.8 DELETE /notifications/alert/:id

```
Frontend:  Settings.jsx (handleDeleteAlert)
  ↓        api.js → notificationAPI.deletePriceAlert(id)
Gateway:   server.js line 226 → authMiddleware → notificationProxy
Service:   Notification Service → Delete PriceAlert({ _id, userId })
Response:  { success }
Frontend:  fetchAlerts()
```

---

## 👨‍💼 7. ADMIN (5 endpoints)

### 7.1 GET /users/admin/stats

```
Frontend:  Admin.jsx (useEffect)
  ↓        api.js → adminAPI.getSystemStats()
Gateway:   server.js line 196 → authMiddleware → adminMiddleware → userProxy
Service:   User Service → userController.getSystemStats()
  ↓        - Count users, total balance, aggregations
Response:  { totalUsers, activeUsers, totalBalance, ... }
Frontend:  setStats() → Render cards
```

### 7.2 GET /users/admin/users

```
Frontend:  Admin.jsx (useEffect)
  ↓        api.js → adminAPI.getAllUsers()
Gateway:   server.js line 196 → authMiddleware → adminMiddleware → userProxy
Service:   User Service → userController.getAllUsers()
Response:  [{ username, email, balance, role, isActive }]
Frontend:  setUsers() → Render table
```

### 7.3 PUT /users/admin/users/:userId/toggle

```
Frontend:  Admin.jsx (handleToggleStatus)
  ↓        api.js → adminAPI.toggleUserStatus(userId)
Gateway:   server.js line 196 → authMiddleware → adminMiddleware → userProxy
Service:   User Service → Update({ _id }, { isActive: !isActive })
Response:  { user }
Frontend:  fetchUsers()
```

### 7.4 PUT /users/admin/users/:userId/balance

```
Frontend:  Admin.jsx (handleBalanceUpdate)
  ↓        api.js → adminAPI.updateUserBalance(userId, { amount })
Gateway:   server.js line 196 → authMiddleware → adminMiddleware → userProxy
Service:   User Service → Update balance + balanceHistory
Response:  { user }
Frontend:  fetchUsers()
```

### 7.5 DELETE /users/admin/users/:userId

```
Frontend:  Admin.jsx (handleDeleteUser)
  ↓        api.js → adminAPI.deleteUser(userId)
Gateway:   server.js line 196 → authMiddleware → adminMiddleware → userProxy
Service:   User Service → Delete user
Response:  { success }
Frontend:  fetchUsers()
```

---

## 🔌 8. WEBSOCKET EVENTS (3 events)

### 8.1 trade_confirmation

```
Backend:   tradeOrchestration.js (sau buy/sell thành công)
  ↓        global.io.to(`user_${userId}`).emit('trade_confirmation', data)

Frontend:  Dashboard.jsx (useEffect)
  ↓        socket.on('trade_confirmation', (data) => {
  ↓          toast.success(`${data.type} ${data.amount} ${data.symbol}`)
  ↓          fetchBalance()
  ↓          fetchPortfolio()
  ↓        })
```

### 8.2 price_alert

```
Backend:   priceAlertChecker.js (cron job mỗi 1 phút)
  ↓        Check price triggers
  ↓        global.io.to(`user_${userId}`).emit('price_alert', data)

Frontend:  Dashboard.jsx
  ↓        socket.on('price_alert', (data) => {
  ↓          toast.warning(`${data.coinId} đạt ${data.targetPrice}!`)
  ↓          fetchNotifications()
  ↓        })
```

### 8.3 price_update

```
Backend:   Market Service / Background job
  ↓        global.io.emit('price_update', { bitcoin: 65000, ... })

Frontend:  Dashboard.jsx
  ↓        socket.on('price_update', (data) => {
  ↓          setMarketData(prevData =>
  ↓            prevData.map(coin => ({
  ↓              ...coin,
  ↓              price: data[coin.id] || coin.price
  ↓            }))
  ↓          )
  ↓        })
```

---

## 📁 FILE MAPPING

### Frontend Files

```
src/
├── services/
│   ├── api.js           → Axios instance, all API wrappers
│   └── websocket.js     → Socket.IO client
├── context/
│   └── AuthContext.jsx  → Auth state, user, balance
├── pages/
│   ├── Auth.jsx         → Login, Register
│   ├── Dashboard.jsx    → Market prices, Portfolio summary, WebSocket
│   ├── Trade.jsx        → Buy/Sell coins
│   ├── Portfolio.jsx    → Holdings với P&L
│   ├── History.jsx      → Trade history
│   ├── CoinDetail.jsx   → Coin price + chart
│   ├── Notifications.jsx→ Notifications CRUD
│   ├── Settings.jsx     → Profile, Price alerts
│   └── Admin.jsx        → Admin dashboard
└── components/
    └── Navbar.jsx       → Notifications dropdown, unread count
```

### Backend Files

```
backend/
├── api-gateway/
│   ├── server.js                        → Routes, middleware, proxy
│   └── orchestration/
│       ├── tradeOrchestration.js        → Buy/Sell 7 steps + rollback
│       └── portfolioOrchestration.js    → Enriched portfolio
└── services/
    ├── user-service/
    │   └── controllers/userController.js
    ├── market-service/
    │   └── controllers/marketController.js
    ├── portfolio-service/
    │   └── controllers/portfolioController.js
    ├── trade-service/
    │   └── controllers/tradeController.js
    └── notification-service/
        ├── controllers/notificationController.js
        └── utils/priceAlertChecker.js   → Cron job
```

---

## 🎯 PATTERN TỔNG QUÁT

```
📱 FRONTEND Component
  ↓ call function
🔧 services/api.js (axios wrapper)
  ↓ HTTP request
🌐 API Gateway (server.js)
  ↓ middleware chain: rate limit → auth → proxy/orchestration
📊 ORCHESTRATION (trade, portfolio) HOẶC
📦 DIRECT PROXY (user, market, notification, admin)
  ↓ business logic
💾 Database (MongoDB)
  ↓ response
📱 FRONTEND receive
  ↓ update state
🎨 UI re-render
```

---

## 🔑 KEY POINTS

1. **Authentication:** JWT token lưu localStorage, gửi qua `Authorization: Bearer <token>`
2. **Orchestration:** Trade (buy/sell) và Portfolio cần gọi nhiều services → orchestrate tại API Gateway
3. **Rollback:** Trade orchestration có transaction state tracking để rollback khi lỗi
4. **WebSocket:** Real-time updates cho trade confirmation, price alerts, price updates
5. **Admin:** Cần middleware `adminMiddleware` để check role
6. **Rate Limiting:** Login (5/15min), Register (3/1hour), Global (1000/15min)
7. **Caching:** Market prices (2min TTL), Chart data (5min TTL)
8. **Cron Job:** Price alert checker chạy mỗi 1 phút

---

**Total Flows:** 28 REST + 3 WebSocket = **31 endpoints**
