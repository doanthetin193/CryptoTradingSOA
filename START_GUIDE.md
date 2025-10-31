# 🚀 CryptoTradingSOA - Hướng dẫn khởi động

## ✅ Checklist trước khi chạy

### 1. Consul (Service Discovery) ✅
```powershell
cd D:\tools\consul
.\consul.exe agent -dev
# UI: http://localhost:8500/ui
```

### 2. MongoDB ✅
```
URI đã cấu hình trong .env files
mongodb+srv://doanthetindeveloper:***@cluster0.g69mfzf.mongodb.net/crypto_trading_soa
```

### 3. Dependencies ✅
- Backend: Tất cả services đã có node_modules
- Frontend: node_modules đã cài đặt

---

## 🎯 Cách khởi động (Start từng service riêng lẻ)

### Bước 1: Start Consul
```powershell
cd D:\tools\consul
.\consul.exe agent -dev
```

### Bước 2: Mở 6 terminals cho Backend

**Terminal 1 - API Gateway (Port 3000):**
```powershell
cd d:\CryptoTradingSOA\backend\api-gateway
npm start
```

**Terminal 2 - User Service (Port 3001):**
```powershell
cd d:\CryptoTradingSOA\backend\services\user-service
npm start
```

**Terminal 3 - Market Service (Port 3002):**
```powershell
cd d:\CryptoTradingSOA\backend\services\market-service
npm start
```

**Terminal 4 - Portfolio Service (Port 3003):**
```powershell
cd d:\CryptoTradingSOA\backend\services\portfolio-service
npm start
```

**Terminal 5 - Trade Service (Port 3004):**
```powershell
cd d:\CryptoTradingSOA\backend\services\trade-service
npm start
```

**Terminal 6 - Notification Service (Port 3005):**
```powershell
cd d:\CryptoTradingSOA\backend\services\notification-service
npm start
```

### Bước 3: Start Frontend

**Terminal 7 - Frontend (Port 5173):**
```powershell
cd d:\CryptoTradingSOA\frontend
npm run dev
```

Truy cập: **http://localhost:5173**

---

## 🔍 Kiểm tra hệ thống

### 1. Check Consul Dashboard
```
http://localhost:8500/ui
```
Bạn sẽ thấy tất cả services đã đăng ký:
- user-service ✅
- market-service ✅
- portfolio-service ✅
- trade-service ✅
- notification-service ✅

### 2. Check API Gateway Health
```powershell
curl http://localhost:3000/health
```

### 3. Check Frontend
```
http://localhost:5173
```

---

## 📊 Architecture

```
┌─────────────┐
│   Consul    │ ← Service Discovery (Port 8500)
│  (Running)  │
└─────────────┘
       ↓
┌─────────────────────────────────────────────┐
│            API Gateway (Port 3000)          │
│  - Authentication (JWT)                     │
│  - Rate Limiting                            │
│  - Service Discovery & Routing              │
└─────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────────────┐
│                   Microservices                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  User    │ │ Market   │ │Portfolio │ │  Trade   │   │
│  │  :3001   │ │  :3002   │ │  :3003   │ │  :3004   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────────┐                                        │
│  │Notification  │                                        │
│  │    :3005     │                                        │
│  └──────────────┘                                        │
└──────────────────────────────────────────────────────────┘
       ↓
┌─────────────┐
│   MongoDB   │ ← Database (Cloud Atlas)
└─────────────┘

┌─────────────────────┐
│  Frontend (Vite)    │ ← React App (Port 5173)
│  - React 19         │
│  - Tailwind CSS     │
│  - React Router 7   │
└─────────────────────┘
```

---

## 🎮 Test Flow

1. **Đăng ký tài khoản**
   - Truy cập: http://localhost:5173/auth
   - Click tab "Đăng ký"
   - Nhập email, password, fullname
   - Nhận được $10,000 USDT ban đầu

2. **Dashboard**
   - Xem giá crypto realtime (từ CoinGecko API)
   - Xem tổng số dư và giá trị danh mục

3. **Portfolio**
   - Xem các coin đang nắm giữ
   - Pie chart phân bổ tài sản
   - Profit/Loss tính toán realtime

4. **Trade**
   - Mua/bán crypto
   - Số dư cập nhật realtime
   - Transaction history được lưu

5. **History**
   - Xem lịch sử giao dịch
   - Filter by type (buy/sell)

6. **Settings**
   - Xem thông tin tài khoản
   - Số dư hiện tại

---

## 🛠️ Troubleshooting

### Lỗi: Cannot connect to Consul
```
✅ Đã fix: Backend có fallback config, không cần Consul cũng chạy được
✅ Nhưng đã start Consul để có Service Discovery đầy đủ
```

### Lỗi: MongoDB connection failed
```
Check .env file trong từng service:
MONGODB_URI=mongodb+srv://...
```

### Lỗi: Port already in use
```powershell
# Tìm process đang dùng port
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

### Lỗi: CORS trong Frontend
```
✅ Đã config trong API Gateway:
CORS_ORIGINS=http://localhost:5173
```

---

## 📝 Environment Variables

### Backend Services (.env)
```properties
PORT=3001
NODE_ENV=development
SERVICE_NAME=user-service
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
CONSUL_HOST=localhost
CONSUL_PORT=8500
```

### Frontend (.env)
```properties
VITE_API_URL=http://localhost:3000/api
```

---

## ✅ Status

- ✅ Consul: Running on port 8500
- ✅ MongoDB: Connected (Atlas)
- ✅ Backend: Ready to start
- ✅ Frontend: Ready to start
- ✅ No compile errors
- ✅ All dependencies installed

---

## 🎉 Bắt đầu ngay!

```powershell
# Terminal 1: Backend (tất cả services)
cd d:\CryptoTradingSOA\backend
npm start

# Terminal 2: Frontend
cd d:\CryptoTradingSOA\frontend
npm run dev
```

**Truy cập:** http://localhost:5173

**Happy Trading! 🚀💰**
