# 📚 TIẾN ĐỘ HỌC API - CryptoTradingSOA

> **Cập nhật:** 24/12/2024  
> **Tham khảo:** `API_DOCUMENTATION.md`, `FRONTEND_BACKEND_FLOWS.md`

---

## 📁 CẤU TRÚC PROJECT

```
CryptoTradingSOA/
├── frontend/                           # React + Vite + TailwindCSS
│   └── src/
│       ├── App.jsx                     # Routes, ProtectedRoute
│       ├── main.jsx                    # Entry point
│       ├── services/
│       │   ├── api.js                  # Axios API wrappers
│       │   └── websocket.js            # Socket.IO client
│       ├── context/
│       │   └── AuthContext.jsx         # Auth state, token, user
│       ├── hooks/
│       │   └── useAuth.js              # Auth hook
│       ├── components/
│       │   ├── Layout.jsx, Navbar.jsx, Sidebar.jsx, Toast.jsx
│       └── pages/
│           ├── Auth.jsx, Dashboard.jsx, Trade.jsx
│           ├── Portfolio.jsx, History.jsx, CoinDetail.jsx
│           ├── Notifications.jsx, Settings.jsx, Admin.jsx
│
└── backend/
    ├── api-gateway/                    # Port 3000
    │   ├── server.js                   # Express, CORS, Rate Limit, Proxy, WebSocket
    │   └── orchestration/
    │       ├── tradeOrchestration.js   # Buy/Sell 7 steps + Rollback
    │       └── portfolioOrchestration.js # Enrich portfolio with prices
    │
    ├── services/
    │   ├── user-service/               # Port 3001 - Auth, Balance, Admin
    │   ├── market-service/             # Port 3002 - CoinGecko API, Cache
    │   ├── portfolio-service/          # Port 3003 - Holdings, DCA
    │   ├── trade-service/              # Port 3004 - Trade records
    │   └── notification-service/       # Port 3005 - Notifications, Price Alerts, Cron
    │
    └── shared/
        ├── config/
        │   ├── db.js                   # MongoDB connection
        │   └── services.js             # Service ports config
        ├── middleware/
        │   ├── auth.js                 # JWT middleware (authMiddleware, optionalAuth, adminMiddleware)
        │   └── errorHandler.js
        └── utils/
            ├── circuitBreaker.js       # Opossum wrapper
            ├── serviceDiscovery.js     # Consul integration
            ├── logger.js               # Winston logger
            └── websocket.js            # Socket.IO helpers
```

---

## ✅ ĐÃ HỌC (12 endpoints)

| # | Endpoint | Frontend | Backend |
|---|----------|----------|---------|
| 1 | POST `/users/register` | Auth.jsx | userController.register |
| 2 | POST `/users/login` | Auth.jsx | userController.login |
| 3 | GET `/users/profile` | AuthContext.jsx | userController.getProfile |
| 4 | PUT `/users/profile` | Settings.jsx | userController.updateProfile |
| 5 | GET `/users/balance` | - | userController.getBalance |
| 6 | GET `/market/prices` | Dashboard.jsx, Trade.jsx | marketController.getPrices |
| 7 | GET `/market/price/:coinId` | CoinDetail.jsx | marketController.getCoinPrice |
| 8 | GET `/market/chart/:coinId` | CoinDetail.jsx | marketController.getChartData |
| 9 | POST `/trade/buy` ⭐ | Trade.jsx | tradeOrchestration.buyCoin |
| 10 | POST `/trade/sell` ⭐ | Trade.jsx | tradeOrchestration.sellCoin |
| 11 | GET `/trade/history` | History.jsx | tradeController.getTradeHistory |
| 12 | GET `/portfolio` ⭐ | Portfolio.jsx | portfolioOrchestration.getEnrichedPortfolio |

---

## ❌ CHƯA HỌC (15 items)

### 1️⃣ Health Check (~5 phút)
- [ ] GET `/health` → server.js

### 2️⃣ Notification APIs (~40 phút)
| Endpoint | Frontend | Backend |
|----------|----------|---------|
| GET `/notifications` | Notifications.jsx | notificationController.getNotifications |
| GET `/notifications/unread-count` | Navbar.jsx | notificationController.getUnreadCount |
| PUT `/notifications/:id/read` | Notifications.jsx | notificationController.markAsRead |
| PUT `/notifications/read-all` | Notifications.jsx | notificationController.markAllAsRead |
| DELETE `/notifications/:id` | Notifications.jsx | notificationController.deleteNotification |
| POST `/notifications/alert` | Settings.jsx | notificationController.createPriceAlert |
| GET `/notifications/alerts` | Settings.jsx | notificationController.getPriceAlerts |
| DELETE `/notifications/alert/:id` | Settings.jsx | notificationController.deletePriceAlert |

**Cron Job:** `priceAlertChecker.js` - Chạy mỗi 1 phút check price alerts

### 3️⃣ WebSocket Events (~30 phút)
| Event | Emit từ | Listen tại |
|-------|---------|------------|
| `trade_confirmation` | tradeOrchestration.js | Dashboard.jsx |
| `price_alert` | priceAlertChecker.js | Dashboard.jsx |
| `notification` | notificationController.js | Navbar.jsx |
| `balance_updated` | tradeOrchestration.js | AuthContext.jsx |

### 4️⃣ Admin APIs (~25 phút)
| Endpoint | Frontend | Backend |
|----------|----------|---------|
| GET `/users/admin/users` | Admin.jsx | userController.getAllUsers |
| GET `/users/admin/stats` | Admin.jsx | userController.getSystemStats |
| PUT `/users/admin/users/:id/toggle` | Admin.jsx | userController.toggleUserStatus |
| PUT `/users/admin/users/:id/balance` | Admin.jsx | userController.adminUpdateBalance |
| DELETE `/users/admin/users/:id` | Admin.jsx | userController.deleteUser |

---

## 📊 TIẾN ĐỘ: 12/27 = 44%

```
████████████░░░░░░░░░░░░░░░ 44%
```

---

## � KEY PATTERNS

| Pattern | File | Mục đích |
|---------|------|----------|
| **Orchestration** | tradeOrchestration.js | Buy/Sell gọi 5 services + rollback |
| **Circuit Breaker** | circuitBreaker.js | Prevent cascading failures |
| **Service Discovery** | serviceDiscovery.js | Consul dynamic URL |
| **JWT Auth** | auth.js | authMiddleware, optionalAuth, adminMiddleware |
| **Cron Job** | priceAlertChecker.js | Scheduled price checking |
| **WebSocket** | websocket.js | Real-time events |
| **DCA Calculation** | Portfolio.js | averageBuyPrice = totalCost/totalAmount |

---

## � DATABASE MODELS

| Model | Collection | Key Fields |
|-------|------------|------------|
| User | users | email, password, balance, balanceHistory[], role |
| Portfolio | portfolios | userId, holdings[], totalValue, totalProfit |
| Trade | trades | userId, type, symbol, amount, price, fee, status |
| Notification | notifications | userId, type, title, message, status |
| PriceAlert | pricealerts | userId, symbol, targetPrice, condition, isActive |
