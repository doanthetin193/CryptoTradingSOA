# CryptoTrading SOA Backend

## 📁 Cấu trúc Project

```
backend/
├── api-gateway/          # ✅ API Gateway - Entry point
├── services/             # Các microservices độc lập
│   ├── user-service/     # ✅ Quản lý user & wallet
│   ├── market-service/   # ✅ Lấy giá từ CoinGecko
│   ├── portfolio-service # ✅ Quản lý danh mục
│   ├── trade-service/    # ✅ Xử lý giao dịch
│   └── notification-service # ✅ Gửi thông báo
└── shared/               # ✅ Utilities dùng chung
```

## 🚀 Cài đặt

### 1. Install Dependencies cho tất cả services

```powershell
# Shared module
cd backend/shared
npm install

# API Gateway
cd ../api-gateway
npm install

# User Service
cd ../services/user-service
npm install

# Market Service
cd ../services/market-service
npm install

# Portfolio Service
cd ../services/portfolio-service
npm install

# Trade Service
cd ../services/trade-service
npm install

# Notification Service
cd ../services/notification-service
npm install
```

### 2. Khởi động Consul

```powershell
cd D:\tools\consul
.\consul.exe agent -dev
```

### 3. Khởi động các services

Mở terminal riêng cho từng service:

**Terminal 1 - User Service:**
```powershell
cd backend/services/user-service
npm start
```

**Terminal 2 - Market Service:**
```powershell
cd backend/services/market-service
npm start
```

**Terminal 3 - Portfolio Service:**
```powershell
cd backend/services/portfolio-service
npm start
```

**Terminal 4 - Trade Service:**
```powershell
cd backend/services/trade-service
npm start
```

**Terminal 5 - Notification Service:**
```powershell
cd backend/services/notification-service
npm start
```

**Terminal 6 - API Gateway:**
```powershell
cd backend/api-gateway
npm start
```

## 📡 API Endpoints

### API Gateway (Port 3000)

- **Health Check:** `GET http://localhost:3000/health`
- **User APIs:** `http://localhost:3000/api/users/*`
- **Market APIs:** `http://localhost:3000/api/market/*`
- **Portfolio APIs:** `http://localhost:3000/api/portfolio/*` (coming soon)
- **Trade APIs:** `http://localhost:3000/api/trade/*` (coming soon)
- **Notification APIs:** `http://localhost:3000/api/notifications/*` (coming soon)

### User Service (Port 3001)

- **Register:** `POST /register`
- **Login:** `POST /login`
- **Profile:** `GET /profile` (requires auth)
- **Balance:** `GET /balance` (requires auth)

### Market Service (Port 3002)

- **Get All Prices:** `GET /prices`
- **Get Coin Price:** `GET /price/:coinId`
- **Get Chart Data:** `GET /chart/:coinId?days=7`
- **Supported Coins:** `GET /coins`
- **Trending:** `GET /trending`

## 🔧 Environment Variables

Mỗi service có file `.env` riêng. Đã được cấu hình sẵn với:

- MongoDB URI (shared database)
- JWT Secret
- Consul configuration
- Service-specific settings

## 🎯 Trạng thái phát triển

- ✅ **Shared Module:** Hoàn thành (db, logger, httpClient)
- ✅ **API Gateway:** Hoàn thành (routing, auth, consul discovery)
- ✅ **User Service:** Hoàn thành (auth, wallet management)
- ✅ **Market Service:** Hoàn thành (CoinGecko integration)
- ✅ **Portfolio Service:** Hoàn thành (portfolio management, holdings calculation)
- ✅ **Trade Service:** Hoàn thành (buy/sell transactions, trade history)
- ✅ **Notification Service:** Hoàn thành (notifications, price alerts)

## 📚 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (shared)
- **Service Discovery:** Consul
- **Authentication:** JWT
- **External API:** CoinGecko API
- **Caching:** node-cache
