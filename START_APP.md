# 🚀 Hướng dẫn khởi động CryptoTrading SOA

## 📋 Yêu cầu
- Node.js 18+
- MongoDB Atlas (đã cấu hình trong .env)
- 7 terminal windows

## ⚡ Khởi động nhanh

### 1. Backend (6 terminals)

**Terminal 1 - API Gateway:**
```powershell
cd d:\CryptoTradingSOA\backend
node api-gateway/server.js
```

**Terminal 2 - User Service:**
```powershell
cd d:\CryptoTradingSOA\backend
node services/user-service/server.js
```

**Terminal 3 - Market Service:**
```powershell
cd d:\CryptoTradingSOA\backend
node services/market-service/server.js
```

**Terminal 4 - Portfolio Service:**
```powershell
cd d:\CryptoTradingSOA\backend
node services/portfolio-service/server.js
```

**Terminal 5 - Trade Service:**
```powershell
cd d:\CryptoTradingSOA\backend
node services/trade-service/server.js
```

**Terminal 6 - Notification Service:**
```powershell
cd d:\CryptoTradingSOA\backend
node services/notification-service/server.js
```

### 2. Frontend (Terminal 7)

```powershell
cd d:\CryptoTradingSOA\frontend
npm run dev
```

## 🌐 Truy cập ứng dụng

- **Frontend:** http://localhost:5173
- **API Gateway:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

## 🧪 Test luồng hoàn chỉnh

### 1. Đăng ký tài khoản
- Truy cập http://localhost:5173
- Click "Đăng ký"
- Nhập thông tin:
  - Email: test@example.com
  - Password: 123456
  - Họ tên: Test User
- Click "Đăng ký"

### 2. Kiểm tra Dashboard
- Sau khi đăng ký/đăng nhập thành công
- Xem số dư ban đầu: $10,000
- Xem danh sách Top Coins

### 3. Thực hiện giao dịch MUA
- Vào trang "Giao dịch" (Trade)
- Chọn "Mua" (Buy)
- Chọn coin: Bitcoin (BTC)
- Nhập số lượng: 0.01
- Click "Mua"
- Kiểm tra:
  - Số dư giảm
  - Thông báo "Mua thành công"

### 4. Kiểm tra Portfolio
- Vào trang "Danh mục" (Portfolio)
- Xem biểu đồ phân bổ tài sản
- Xem chi tiết holdings

### 5. Thực hiện giao dịch BÁN
- Vào trang "Giao dịch"
- Chọn "Bán" (Sell)
- Chọn coin đã mua
- Nhập số lượng
- Click "Bán"

### 6. Xem lịch sử
- Vào trang "Lịch sử" (History)
- Xem danh sách giao dịch đã thực hiện

## 🔍 Kiểm tra Backend hoạt động

### Test API Gateway:
```powershell
curl http://localhost:3000/health
```

### Test đăng ký qua API:
```powershell
curl -X POST http://localhost:3000/api/users/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"123456\",\"fullName\":\"Test User\"}'
```

## 📊 Kiến trúc hệ thống

```
┌─────────────────┐
│   Frontend      │
│  (React Vite)   │
│  Port: 5173     │
└────────┬────────┘
         │
         │ HTTP/REST
         ▼
┌─────────────────┐
│  API Gateway    │
│  Port: 3000     │
│  Orchestration  │
└────────┬────────┘
         │
         ├────────────┬──────────────┬──────────────┬──────────────┐
         ▼            ▼              ▼              ▼              ▼
    ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────┐
    │  User   │  │ Market  │  │Portfolio │  │  Trade  │  │Notification  │
    │ Service │  │ Service │  │ Service  │  │ Service │  │  Service     │
    │:3001    │  │:3002    │  │:3003     │  │:3004    │  │:3005         │
    └────┬────┘  └────┬────┘  └────┬─────┘  └────┬────┘  └──────┬───────┘
         │            │             │             │              │
         └────────────┴─────────────┴─────────────┴──────────────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │  MongoDB      │
                            │  Atlas        │
                            └───────────────┘
```

## ⚙️ Cấu hình

### Backend (.env):
```env
API_GATEWAY_PORT=3000
USER_SERVICE_PORT=3001
MARKET_SERVICE_PORT=3002
PORTFOLIO_SERVICE_PORT=3003
TRADE_SERVICE_PORT=3004
NOTIFICATION_SERVICE_PORT=3005

MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_key
COINGECKO_API_URL=https://api.coingecko.com/api/v3

TRADING_FEE_PERCENTAGE=0.1
MIN_TRADE_AMOUNT_USD=10
```

### Frontend (.env):
```env
VITE_API_URL=http://localhost:3000/api
```

## 🐛 Troubleshooting

### Lỗi: Port đã được sử dụng
```powershell
# Tìm process đang dùng port
netstat -ano | findstr :3000

# Kill process
taskkill /F /PID <PID>

# Hoặc kill tất cả Node
taskkill /F /IM node.exe
```

### Lỗi: Cannot connect to MongoDB
- Kiểm tra MONGODB_URI trong .env
- Kiểm tra whitelist IP trong MongoDB Atlas
- Kiểm tra internet connection

### Lỗi: CORS trong frontend
- Đảm bảo API Gateway đã bật CORS
- Kiểm tra VITE_API_URL trong frontend/.env

### Lỗi: 401 Unauthorized
- Kiểm tra JWT_SECRET trong .env
- Clear localStorage trong browser
- Đăng nhập lại

## 📝 Ghi chú

- **Initial Balance**: Mỗi user mới được tặng $10,000
- **Trading Fee**: 0.1% mỗi giao dịch
- **Min Trade**: $10
- **Market Data**: Real-time từ CoinGecko API
- **Authentication**: JWT tokens (expires 7 days)

## 🎯 Tính năng đã implement

### Frontend:
✅ Authentication (Login/Register)  
✅ Dashboard với market overview  
✅ Trading page (Buy/Sell)  
✅ Portfolio visualization  
✅ Transaction history  
✅ Real-time price updates  
✅ Responsive design với Tailwind CSS  

### Backend:
✅ SOA Architecture  
✅ API Gateway với orchestration  
✅ User Service (Auth + Balance)  
✅ Market Service (CoinGecko integration)  
✅ Portfolio Service (Holdings)  
✅ Trade Service (Transaction records)  
✅ Notification Service  
✅ Consul Service Discovery (optional)  
✅ MongoDB integration  
✅ JWT authentication  
✅ Error handling & logging  

## 🚀 Next Steps (Optional)

- [ ] Add WebSocket for real-time updates
- [ ] Implement price alerts
- [ ] Add chart visualization for price history
- [ ] Add transaction rollback on failure
- [ ] Implement circuit breaker pattern
- [ ] Add Redis caching
- [ ] Deploy to cloud (AWS/Azure/GCP)
- [ ] Add unit tests
- [ ] Add Docker compose
- [ ] Add CI/CD pipeline
