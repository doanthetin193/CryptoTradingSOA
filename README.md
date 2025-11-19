# 🚀 CryptoTrading SOA - Cryptocurrency Trading Platform

Ứng dụng giao dịch tiền điện tử với kiến trúc SOA (Service-Oriented Architecture), được xây dựng với Node.js, React và MongoDB.

![Architecture](https://img.shields.io/badge/Architecture-SOA-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Frontend](https://img.shields.io/badge/Frontend-React-cyan)
![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen)

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Kiến trúc](#-kiến-trúc)
- [Công nghệ](#-công-nghệ)
- [Cài đặt](#-cài-đặt)
- [Khởi động](#-khởi-động)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Tác giả](#-tác-giả)

## ✨ Tính năng

### Frontend (User Interface)
- ✅ **Authentication** - Đăng ký, đăng nhập với JWT
- ✅ **Dashboard** - Tổng quan tài khoản và thị trường
- ✅ **Trading** - Mua/bán cryptocurrency real-time
- ✅ **Portfolio** - Quản lý danh mục đầu tư với biểu đồ
- ✅ **History** - Lịch sử giao dịch chi tiết
- ✅ **Real-time Pricing** - Giá cập nhật từ CoinGecko API
- ✅ **Responsive Design** - Tối ưu cho mọi thiết bị

### Backend (Microservices)
- ✅ **API Gateway** - Điểm vào duy nhất, orchestration
- ✅ **User Service** - Quản lý người dùng và số dư
- ✅ **Market Service** - Tích hợp CoinGecko API
- ✅ **Portfolio Service** - Quản lý holdings
- ✅ **Trade Service** - Xử lý giao dịch
- ✅ **Notification Service** - Thông báo và alerts
- ✅ **Service Discovery** - Consul integration (optional)
- ✅ **Centralized Logging** - Winston logger
- ✅ **Error Handling** - Middleware xử lý lỗi tập trung

## 🏗️ Kiến trúc

### SOA Architecture Pattern

```
┌──────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│            React + Vite + Tailwind CSS                       │
│                    Port: 5173                                │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
│                   Port: 3000                                 │
│  - Request Routing                                           │
│  - Authentication (JWT)                                      │
│  - Orchestration (Buy/Sell)                                  │
│  - Rate Limiting                                             │
│  - Error Handling                                            │
└────────┬────────┬────────┬────────┬────────┬─────────────────┘
         │        │        │        │        │
         ▼        ▼        ▼        ▼        ▼
    ┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐
    │  User  │ │Market│ │Port- │ │Trade │ │Notifica- │
    │Service │ │Svc   │ │folio │ │Svc   │ │tion Svc  │
    │        │ │      │ │Svc   │ │      │ │          │
    │:3001   │ │:3002 │ │:3003 │ │:3004 │ │:3005     │
    └───┬────┘ └──┬───┘ └──┬───┘ └──┬───┘ └────┬─────┘
        │         │        │        │          │
        └─────────┴────────┴────────┴──────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │  MongoDB    │
                  │   Atlas     │
                  └─────────────┘
```

### Orchestration Pattern

**Trade Orchestration (API Gateway):**
```
BUY Flow:
1. Get coin price from Market Service
2. Check user balance from User Service
3. Deduct balance via User Service
4. Add holding via Portfolio Service
5. Create trade record via Trade Service
6. Send notification via Notification Service

SELL Flow:
1. Check holding from Portfolio Service
2. Get coin price from Market Service
3. Get current balance from User Service
4. Add proceeds via User Service
5. Reduce holding via Portfolio Service
6. Create trade record via Trade Service
7. Send notification via Notification Service
```

## 🛠️ Công nghệ

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT (jsonwebtoken)
- **API Gateway:** http-proxy-middleware
- **Validation:** Joi
- **Logging:** Winston
- **Security:** Helmet, bcryptjs, CORS
- **Service Discovery:** Consul (optional)
- **External API:** CoinGecko API

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4
- **Routing:** React Router DOM 7
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Icons:** Lucide React

### DevOps
- **Version Control:** Git
- **Package Manager:** npm
- **Environment:** dotenv

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js 18 trở lên
- MongoDB Atlas account (hoặc MongoDB local)
- Git
- 2GB RAM minimum

### 1. Clone repository
```bash
git clone https://github.com/doanthetin193/CryptoTradingSOA.git
cd CryptoTradingSOA
```

### 2. Cài đặt Backend
```bash
cd backend
npm install
```

### 3. Cấu hình Backend (.env)
Tạo file `.env` trong thư mục `backend/`:
```env
# Server Ports
API_GATEWAY_PORT=3000
USER_SERVICE_PORT=3001
MARKET_SERVICE_PORT=3002
PORTFOLIO_SERVICE_PORT=3003
TRADE_SERVICE_PORT=3004
NOTIFICATION_SERVICE_PORT=3005

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crypto_trading_soa

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# External APIs
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# Trading Config
TRADING_FEE_PERCENTAGE=0.1
MIN_TRADE_AMOUNT_USD=10
INITIAL_BALANCE=10000

# Consul (Optional)
CONSUL_HOST=localhost
CONSUL_PORT=8500

# Environment
NODE_ENV=development
```

### 4. Cài đặt Frontend
```bash
cd ../frontend
npm install
```

### 5. Cấu hình Frontend (.env)
File `.env` đã có sẵn:
```env
VITE_API_URL=http://localhost:3000/api
```

## 🚀 Khởi động

### Cách 1: Script tự động (Khuyến nghị)

**Windows:**
```bash
cd backend
.\start-all-services.bat
```

Sau đó mở terminal mới:
```bash
cd frontend
npm run dev
```

### Cách 2: Thủ công (6 terminals cho backend + 1 cho frontend)

**Backend Services:**
```bash
# Terminal 1 - API Gateway
cd backend
node api-gateway/server.js

# Terminal 2 - User Service
cd backend
node services/user-service/server.js

# Terminal 3 - Market Service
cd backend
node services/market-service/server.js

# Terminal 4 - Portfolio Service
cd backend
node services/portfolio-service/server.js

# Terminal 5 - Trade Service
cd backend
node services/trade-service/server.js

# Terminal 6 - Notification Service
cd backend
node services/notification-service/server.js
```

**Frontend:**
```bash
# Terminal 7
cd frontend
npm run dev
```

### Truy cập ứng dụng
- **Frontend:** http://localhost:5173
- **API Gateway:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

## 📚 API Documentation

### Authentication
```http
POST /api/users/register
POST /api/users/login
GET  /api/users/profile
PUT  /api/users/profile
```

### User Balance
```http
GET  /api/users/balance
PUT  /api/users/balance
GET  /api/users/balance/history
```

### Market Data
```http
GET  /api/market/prices
GET  /api/market/price/:coinId
GET  /api/market/chart/:coinId?days=7
GET  /api/market/coins
GET  /api/market/stats
```

### Portfolio
```http
GET  /api/portfolio
GET  /api/portfolio/holding/:symbol
POST /api/portfolio/holding
PUT  /api/portfolio/holding
GET  /api/portfolio/performance
```

### Trading
```http
POST /api/trade/buy
POST /api/trade/sell
GET  /api/trade/history
GET  /api/trade/:id
GET  /api/trade/stats
```

### Notifications
```http
GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
DELETE /api/notifications/:id
POST   /api/notifications/alerts
GET    /api/notifications/alerts
DELETE /api/notifications/alerts/:id
```

Chi tiết đầy đủ: Xem [START_GUIDE.md](backend/START_GUIDE.md)

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:3000/health
```

### Test Registration
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "fullName": "Test User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

## 🎯 User Flow

1. **Đăng ký** → Nhận $10,000 số dư ban đầu
2. **Đăng nhập** → Nhận JWT token
3. **Dashboard** → Xem tổng quan thị trường
4. **Trade** → Mua Bitcoin/Ethereum/...
5. **Portfolio** → Xem danh mục đầu tư
6. **History** → Kiểm tra lịch sử giao dịch

## 📸 Screenshots

### Login Page
![Login](docs/screenshots/login.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Trading Page
![Trading](docs/screenshots/trading.png)

### Portfolio
![Portfolio](docs/screenshots/portfolio.png)

## 🐛 Troubleshooting

### Port đã được sử dụng
```powershell
# Tìm process
netstat -ano | findstr :3000

# Kill process
taskkill /F /PID <PID>

# Hoặc kill tất cả Node
taskkill /F /IM node.exe
```

### MongoDB connection failed
- Kiểm tra MONGODB_URI trong .env
- Whitelist IP trong MongoDB Atlas
- Kiểm tra internet connection

### CORS errors
- Đảm bảo API Gateway đã bật CORS
- Kiểm tra VITE_API_URL đúng

## 📝 License

MIT License - xem [LICENSE](LICENSE)

## 👨‍💻 Tác giả

**Đoàn Thế Tín**
- GitHub: [@doanthetin193](https://github.com/doanthetin193)
- Email: doanthetin193@gmail.com

## 🙏 Credits

- [CoinGecko API](https://www.coingecko.com/en/api) - Market data
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Database hosting
- [React](https://react.dev/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## 🚀 Roadmap

- [ ] WebSocket real-time updates
- [ ] Price alerts with push notifications
- [ ] Advanced charts (candlestick)
- [ ] Transaction rollback mechanism
- [ ] Circuit breaker pattern
- [ ] Redis caching layer
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline
- [ ] Unit & Integration tests
- [ ] Admin dashboard
- [ ] Multi-language support

---

⭐ **Star this repo if you find it helpful!**
