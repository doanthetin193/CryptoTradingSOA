# CryptoTrading SOA - Quick Start Guide

## Cấu trúc đã hoàn thiện

### ✅ Đã Implement

1. **SOA Architecture đúng chuẩn**
   - Services không gọi nhau trực tiếp
   - API Gateway orchestrate tất cả logic phức tạp
   - Mỗi service chỉ quản lý data của riêng mình

2. **Shared Resources**
   - 1 file `.env` duy nhất
   - 1 `package.json` và `node_modules` duy nhất
   - Shared middleware, utils, config

3. **Trade Orchestration**
   - Buy/Sell logic hoàn chỉnh tại API Gateway
   - 6 bước orchestration cho mỗi giao dịch
   - Rollback tự động khi có lỗi

4. **All Services**
   - User Service: Authentication & Balance
   - Market Service: Crypto prices từ CoinGecko
   - Portfolio Service: Holdings management
   - Trade Service: Trade history
   - Notification Service: Notifications & Alerts

## Cách chạy

### 1. Cài đặt dependencies (chỉ 1 lần)
```bash
cd backend
npm install
```

### 2. Start services (cần 6 terminals riêng)

**Terminal 1 - API Gateway:**
```bash
cd backend
node api-gateway/server.js
# Chạy trên port 3000
```

**Terminal 2 - User Service:**
```bash
cd backend
node services/user-service/server.js
# Chạy trên port 3001
```

**Terminal 3 - Market Service:**
```bash
cd backend
node services/market-service/server.js
# Chạy trên port 3002
```

**Terminal 4 - Portfolio Service:**
```bash
cd backend
node services/portfolio-service/server.js
# Chạy trên port 3003
```

**Terminal 5 - Trade Service:**
```bash
cd backend
node services/trade-service/server.js
# Chạy trên port 3004
```

**Terminal 6 - Notification Service:**
```bash
cd backend
node services/notification-service/server.js
# Chạy trên port 3005
```

**Terminal 7 - Frontend:**
```bash
cd frontend
npm run dev
# Chạy trên port 5173
```

## API Endpoints

### Orchestrated Endpoints (qua API Gateway)

#### Buy Coin
```http
POST /api/trade/buy
Authorization: Bearer <token>
Content-Type: application/json

{
  "symbol": "BTC",
  "coinId": "bitcoin",
  "amount": 0.01
}
```

**Luồng xử lý:**
1. Market Service → Get price
2. User Service → Check balance
3. User Service → Deduct balance
4. Portfolio Service → Add holding
5. Trade Service → Create record
6. Notification Service → Send notification

#### Sell Coin
```http
POST /api/trade/sell
Authorization: Bearer <token>
Content-Type: application/json

{
  "symbol": "BTC",
  "amount": 0.01
}
```

**Luồng xử lý:**
1. Portfolio Service → Check holding
2. Market Service → Get price
3. User Service → Get balance
4. User Service → Add proceeds
5. Portfolio Service → Reduce holding
6. Trade Service → Create record
7. Notification Service → Send notification

### Direct Service Endpoints

#### User Service (qua Gateway)
- `POST /api/users/register` - Đăng ký
- `POST /api/users/login` - Đăng nhập
- `GET /api/users/profile` - Xem profile
- `GET /api/users/balance` - Xem số dư

#### Market Service
- `GET /api/market/prices` - Danh sách giá
- `GET /api/market/price/:coinId` - Giá 1 coin
- `GET /api/market/chart/:coinId` - Chart data
- `GET /api/market/trending` - Trending coins

#### Portfolio Service
- `GET /api/portfolio` - Xem portfolio
- `GET /api/portfolio/holding/:symbol` - Xem holding cụ thể

#### Trade Service
- `GET /api/trade/history` - Lịch sử giao dịch
- `GET /api/trade/stats` - Thống kê
- `GET /api/trade/:id` - Chi tiết 1 giao dịch

#### Notification Service
- `GET /api/notifications` - Danh sách thông báo
- `PUT /api/notifications/:id/read` - Đánh dấu đã đọc
- `POST /api/notifications/alert` - Tạo price alert
- `GET /api/notifications/alerts` - Xem alerts

## Configuration

File `.env` duy nhất tại `backend/.env`:

```env
# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Services Ports
API_GATEWAY_PORT=3000
USER_SERVICE_PORT=3001
MARKET_SERVICE_PORT=3002
PORTFOLIO_SERVICE_PORT=3003
TRADE_SERVICE_PORT=3004
NOTIFICATION_SERVICE_PORT=3005

# Business
INITIAL_BALANCE=1000
TRADING_FEE_PERCENTAGE=0.1
MIN_TRADE_AMOUNT_USD=10
```

## Kiến trúc SOA

```
┌─────────────┐
│  Frontend   │
│ (React App) │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────────┐
│         API Gateway (Port 3000)       │
│  • Authentication                     │
│  • Rate Limiting                      │
│  • Orchestration (Buy/Sell)          │
│  • Routing to services               │
└──────┬───────────────────────────────┘
       │
       ├──────→ User Service (3001)
       │        • Users & Auth
       │        • Balance management
       │
       ├──────→ Market Service (3002)
       │        • Fetch prices (CoinGecko)
       │        • Cache management
       │
       ├──────→ Portfolio Service (3003)
       │        • Holdings CRUD
       │        • Value calculation
       │
       ├──────→ Trade Service (3004)
       │        • Trade records
       │        • History & Stats
       │
       └──────→ Notification Service (3005)
                • Notifications
                • Price Alerts
```

## Testing

### 1. Test User Registration
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","fullName":"Test User"}'
```

### 2. Test Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### 3. Test Buy (cần token từ login)
```bash
curl -X POST http://localhost:3000/api/trade/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"symbol":"BTC","coinId":"bitcoin","amount":0.001}'
```

## Lưu ý quan trọng

1. **Không được** service gọi trực tiếp service khác
2. **Phải** qua API Gateway cho tất cả requests từ frontend
3. **Orchestration logic** nằm ở API Gateway, không ở services
4. **Mỗi service** chỉ quản lý data của riêng nó

## Troubleshooting

### Port đã được sử dụng
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MongoDB connection failed
- Kiểm tra `MONGODB_URI` trong `.env`
- Kiểm tra IP whitelist trên MongoDB Atlas

### Service không start
- Kiểm tra `node_modules` đã được install chưa
- Kiểm tra port có bị chiếm không
- Xem log để debug

## Cấu trúc thư mục

```
backend/
├── .env (duy nhất)
├── package.json (duy nhất)
├── node_modules/ (duy nhất)
├── ARCHITECTURE.md
├── START_GUIDE.md
│
├── api-gateway/
│   ├── server.js
│   └── orchestration/
│       └── tradeOrchestration.js
│
├── services/
│   ├── user-service/
│   ├── market-service/
│   ├── portfolio-service/
│   ├── trade-service/
│   └── notification-service/
│
└── shared/
    ├── config/
    ├── middleware/
    └── utils/
```
