# 🪙 CryptoTrading SOA

> **Hệ thống Giao dịch Crypto Ảo** - Nền tảng mô phỏng giao dịch tiền điện tử xây dựng theo kiến trúc hướng dịch vụ (SOA)

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![React](https://img.shields.io/badge/React-v19-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-v6+-green.svg)
![License](https://img.shields.io/badge/License-ISC-yellow.svg)

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Khởi chạy](#-khởi-chạy)
- [API Documentation](#-api-documentation)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Tác giả](#-tác-giả)

## 🎯 Giới thiệu

**CryptoTrading SOA** là một nền tảng giao dịch tiền điện tử ảo cho phép người dùng:
- Học cách giao dịch crypto **không rủi ro** tài chính
- Nhận **1000 USDT ảo** để bắt đầu giao dịch
- Theo dõi giá **real-time** từ thị trường thực
- Quản lý danh mục đầu tư và xem lãi/lỗ

Hệ thống được xây dựng theo **kiến trúc SOA (Service-Oriented Architecture)** với 5 services độc lập, đảm bảo khả năng mở rộng và bảo trì dễ dàng.

## ✨ Tính năng

### 👤 Người dùng (User)
- ✅ Đăng ký / Đăng nhập / Đăng xuất
- ✅ Xem giá 8 loại coin phổ biến (BTC, ETH, BNB, SOL, XRP, ADA, DOGE, DOT)
- ✅ Xem biểu đồ giá (7/14/30 ngày)
- ✅ Mua/Bán coin với phí 0.1%
- ✅ Xem lịch sử giao dịch và thống kê
- ✅ Quản lý danh mục đầu tư (Portfolio)
- ✅ Tạo cảnh báo giá (Price Alerts)
- ✅ Nhận thông báo real-time qua WebSocket

### 👑 Quản trị viên (Admin)
- ✅ Xem danh sách tất cả người dùng
- ✅ Khóa/Mở khóa tài khoản
- ✅ Cập nhật số dư user (điều chỉnh + hoặc -)

### 🛡️ Hệ thống
- ✅ Service Discovery với Consul
- ✅ Circuit Breaker Pattern (Opossum)
- ✅ Rate Limiting
- ✅ JWT Authentication
- ✅ Real-time notifications (Socket.IO)
- ✅ Automatic Price Alert checking (Cron Job)

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT                                  │
│                   React + Vite + TailwindCSS                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (:3000)                         │
│            JWT Auth │ Rate Limit │ Trade Orchestration          │
│                     │ WebSocket Server                          │
└──────────┬──────────────────────────────────────────────────────┘
           │                                              
           │ (2) Query service address                    
           ▼                                              
    ┌─────────────┐                                       
    │   CONSUL    │◄──────────────────────────────────────┐
    │  (:8500)    │  (1) Register service                 │
    │  Service    │◄────────────────────────┐             │
    │  Discovery  │◄───────────────┐        │             │
    └──────┬──────┘                │        │             │
           │                       │        │             │
           │ (3) Return address    │        │             │
           ▼                       │        │             │
┌──────────────────────────────────┴────────┴─────────────┴───────┐
│                         SOA SERVICES                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐     │
│  │   User    │  │  Market   │  │ Portfolio │  │   Trade   │     │
│  │  Service  │  │  Service  │  │  Service  │  │  Service  │     │
│  │  (:3001)  │  │  (:3002)  │  │  (:3003)  │  │  (:3004)  │     │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘     │
│        │              │              │              │            │
│        │        ┌───────────┐        │              │            │
│        │        │Notification        │              │            │
│        │        │  Service  │        │              │            │
│        │        │  (:3005)  │        │              │            │
│        │        └─────┬─────┘        │              │            │
└────────┴──────────────┴──────────────┴──────────────┴────────────┘
                        │
                        ▼
                 ┌─────────────┐      ┌─────────────┐
                 │   MongoDB   │      │  CoinGecko  │
                 │  Database   │      │     API     │
                 └─────────────┘      └─────────────┘
```

### 🔄 Luồng Service Discovery

```
┌──────────────┐     (1) Register          ┌──────────────┐
│              │ ─────────────────────────►│              │
│  Services    │     {name, host, port}    │    CONSUL    │
│  (3001-3005) │                           │    (:8500)   │
│              │◄───────────────────────── │              │
└──────────────┘     Health Check (10s)    └──────────────┘
                                                  ▲
                                                  │ (2) Query
                                                  │ "Where is user-service?"
                                                  │
                                           ┌──────┴───────┐
                                           │ API GATEWAY  │
                                           │   (:3000)    │
                                           └──────────────┘
                                                  │
                                                  │ (3) Response
                                                  │ "localhost:3001"
                                                  ▼
                                           ┌──────────────┐
                                           │ Call Service │
                                           │   Directly   │
                                           └──────────────┘
```

### 📦 Services

| Service | Port | Mô tả |
|---------|------|-------|
| **API Gateway** | 3000 | Điểm vào duy nhất, xác thực JWT, rate limiting, orchestration |
| **User Service** | 3001 | Đăng ký, đăng nhập, quản lý ví USDT, admin functions |
| **Market Service** | 3002 | Lấy giá coin real-time, chart data, cache 2 phút |
| **Portfolio Service** | 3003 | Quản lý holdings, tính lãi/lỗ |
| **Trade Service** | 3004 | Lưu lịch sử giao dịch, thống kê |
| **Notification Service** | 3005 | Thông báo, price alerts, cron job |

## 🛠 Công nghệ sử dụng

### Backend
| Công nghệ | Mô tả |
|-----------|-------|
| **Node.js** | Runtime JavaScript |
| **Express.js** | Web framework |
| **MongoDB** | NoSQL Database |
| **Mongoose** | ODM cho MongoDB |
| **JWT** | Xác thực stateless |
| **bcryptjs** | Hash password |
| **Socket.IO** | WebSocket real-time |
| **Consul** | Service Discovery |
| **Opossum** | Circuit Breaker |
| **node-cron** | Scheduled tasks |
| **Axios** | HTTP client |
| **Winston** | Logging |

### Frontend
| Công nghệ | Mô tả |
|-----------|-------|
| **React 19** | UI Library |
| **Vite** | Build tool |
| **TailwindCSS** | CSS Framework |
| **React Router 7** | Routing |
| **Recharts** | Charts library |
| **Lucide React** | Icons |
| **Socket.IO Client** | WebSocket client |
| **Axios** | HTTP client |

### External APIs
| API | Mô tả |
|-----|-------|
| **CoinGecko** | Primary - Giá crypto real-time |
| **CoinPaprika** | Fallback - Backup API |

## 📥 Cài đặt

### Yêu cầu hệ thống
- **Node.js** >= 18.x
- **MongoDB** >= 6.x
- **Consul** >= 1.15 (optional, có fallback)
- **Git**

### 1. Clone repository

```bash
git clone https://github.com/doanthetin193/CryptoTradingSOA.git
cd CryptoTradingSOA
```

### 2. Cài đặt dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Cài đặt Consul (Optional)

**Windows (Chocolatey):**
```powershell
choco install consul
```

**MacOS (Homebrew):**
```bash
brew install consul
```

**Linux:**
```bash
# Download từ https://developer.hashicorp.com/consul/downloads
```

## ⚙️ Cấu hình

### 1. Tạo file `.env` trong thư mục `backend/`

```bash
cp .env.example .env
# Sau đó chỉnh sửa các giá trị phù hợp
```

```env
# Database - Separate DB per Service (SOA Architecture)
USER_DB_URI=mongodb://localhost:27017/crypto_users
PORTFOLIO_DB_URI=mongodb://localhost:27017/crypto_portfolios
TRADE_DB_URI=mongodb://localhost:27017/crypto_trades
NOTIFICATION_DB_URI=mongodb://localhost:27017/crypto_notifications

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Service Ports
API_GATEWAY_PORT=3000
USER_SERVICE_PORT=3001
MARKET_SERVICE_PORT=3002
PORTFOLIO_SERVICE_PORT=3003
TRADE_SERVICE_PORT=3004
NOTIFICATION_SERVICE_PORT=3005

# Consul
CONSUL_HOST=localhost
CONSUL_PORT=8500

# External APIs
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# Trading Configuration
TRADING_FEE_PERCENTAGE=0.1
INITIAL_BALANCE=1000

# Environment
NODE_ENV=development
```

### 2. Khởi động MongoDB

```bash
# Windows
mongod

# MacOS/Linux
sudo systemctl start mongod
```

### 3. Khởi động Consul (Optional)

```bash
consul agent -dev
```

## 🚀 Khởi chạy

### Cách 1: Sử dụng PowerShell Script (Windows - Recommended)

```powershell
cd backend
.\start-all-services.ps1
```

### Cách 2: Khởi động từng service

```bash
# Terminal 1 - API Gateway
cd backend
npm run start:gateway

# Terminal 2 - User Service
npm run start:user

# Terminal 3 - Market Service
npm run start:market

# Terminal 4 - Portfolio Service
npm run start:portfolio

# Terminal 5 - Trade Service
npm run start:trade

# Terminal 6 - Notification Service
npm run start:notification
```

### Khởi động Frontend

```bash
cd frontend
npm run dev
```

### Truy cập ứng dụng

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Consul UI**: http://localhost:8500 (nếu đã cài)

## 📚 API Documentation

### Authentication

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/users/register` | Đăng ký tài khoản | ❌ |
| POST | `/api/users/login` | Đăng nhập | ❌ |

### User

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/users/profile` | Lấy thông tin profile | ✅ |
| PUT | `/api/users/profile` | Cập nhật profile | ✅ |
| GET | `/api/users/balance` | Lấy số dư | ✅ |

### Market

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/market/prices` | Lấy giá tất cả coins | ✅ |
| GET | `/api/market/price/:coinId` | Lấy giá 1 coin | ✅ |
| GET | `/api/market/chart/:coinId` | Lấy chart data | ✅ |

### Trade

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/trade/buy` | Mua coin | ✅ |
| POST | `/api/trade/sell` | Bán coin | ✅ |
| GET | `/api/trade/history` | Lịch sử giao dịch | ✅ |

### Portfolio

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/portfolio` | Lấy danh mục | ✅ |

### Notification

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/notifications` | Lấy danh sách thông báo | ✅ |
| PUT | `/api/notifications/:id/read` | Đánh dấu đã đọc | ✅ |
| PUT | `/api/notifications/read-all` | Đánh dấu tất cả đã đọc | ✅ |
| POST | `/api/notifications/alert` | Tạo price alert | ✅ |
| GET | `/api/notifications/alerts` | Lấy danh sách alerts | ✅ |
| DELETE | `/api/notifications/alert/:id` | Xóa alert | ✅ |

### Admin

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/users/admin/users` | Lấy danh sách users | ✅ Admin |
| PUT | `/api/users/admin/users/:id/toggle` | Khóa/Mở khóa user | ✅ Admin |
| PUT | `/api/users/admin/users/:id/balance` | Cập nhật số dư | ✅ Admin |

## 📁 Cấu trúc thư mục

```
CryptoTradingSOA/
├── backend/
│   ├── api-gateway/
│   │   ├── server.js                 # API Gateway main file
│   │   └── orchestration/
│   │       ├── tradeOrchestration.js # Buy/Sell orchestration
│   │       └── portfolioOrchestration.js
│   │
│   ├── services/
│   │   ├── user-service/
│   │   │   ├── server.js
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── utils/
│   │   │
│   │   ├── market-service/
│   │   │   ├── server.js
│   │   │   ├── controllers/
│   │   │   ├── providers/            # CoinGecko, CoinPaprika
│   │   │   ├── routes/
│   │   │   └── utils/
│   │   │
│   │   ├── portfolio-service/
│   │   ├── trade-service/
│   │   └── notification-service/
│   │
│   ├── shared/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection
│   │   │   └── services.js           # Service config/fallback
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT middleware
│   │   │   └── errorHandler.js
│   │   └── utils/
│   │       ├── circuitBreaker.js     # Circuit Breaker
│   │       ├── serviceDiscovery.js   # Consul integration
│   │       ├── websocket.js          # Socket.IO
│   │       └── logger.js             # Winston logger
│   │
│   ├── scripts/
│   │   └── seedAdmin.js              # Tạo admin account
│   │
│   ├── package.json
│   ├── start-all-services.ps1        # PowerShell startup script
│   └── CIRCUIT_BREAKER_GUIDE.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Toast.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Auth.jsx              # Login/Register
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Trade.jsx
│   │   │   ├── Portfolio.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── CoinDetail.jsx
│   │   │   └── Admin.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   ├── api.js                # Axios instance
│   │   │   └── websocket.js          # Socket.IO client
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── .gitignore
└── README.md
```

## 🔐 Tạo tài khoản Admin

```bash
cd backend
node scripts/seedAdmin.js
```

Hoặc đăng ký tài khoản thường và cập nhật role trong MongoDB:

```javascript
db.users.updateOne(
  { email: "your_email@example.com" },
  { $set: { role: "admin" } }
)
```

## 🧪 Testing

### Test Health Check

```bash
curl http://localhost:3000/health
```

### Test Login

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "123456"}'
```

## 📊 Coins được hỗ trợ

| Symbol | Tên | CoinGecko ID |
|--------|-----|--------------|
| BTC | Bitcoin | bitcoin |
| ETH | Ethereum | ethereum |
| BNB | BNB | binancecoin |
| SOL | Solana | solana |
| XRP | XRP | ripple |
| ADA | Cardano | cardano |
| DOGE | Dogecoin | dogecoin |
| DOT | Polkadot | polkadot |

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Kiểm tra MongoDB đang chạy
mongod --version
sudo systemctl status mongod
```

### Consul Connection Failed
- Hệ thống sẽ tự động fallback về static config
- Kiểm tra Consul: http://localhost:8500

### Circuit Breaker Open
- Service đang down hoặc quá tải
- Chờ 30s để circuit thử recovery
- Xem logs để debug

### Rate Limit Exceeded
- Đợi 1 phút (login) hoặc 1 giờ (register)
- Hoặc restart server để reset

## 📝 License

ISC License - xem file [LICENSE](LICENSE)

## 👨‍💻 Tác giả

**Đoàn Thế Tín**
- GitHub: [@doanthetin193](https://github.com/doanthetin193)

---

⭐ **Nếu project này hữu ích, hãy cho một star!** ⭐
