# 🚀 Hướng dẫn khởi động hệ thống

## Bước 1: Khởi động Consul

Mở terminal và chạy:
```powershell
cd D:\tools\consul
.\consul.exe agent -dev
```

Truy cập Consul UI: http://localhost:8500

## Bước 2: Khởi động các services

### Cách 1: Từng service một (Khuyến nghị cho debug)

Mở 6 terminal riêng biệt:

**Terminal 1 - User Service:**
```powershell
cd backend\services\user-service
npm start
```

**Terminal 2 - Market Service:**
```powershell
cd backend\services\market-service
npm start
```

**Terminal 3 - Portfolio Service:**
```powershell
cd backend\services\portfolio-service
npm start
```

**Terminal 4 - Trade Service:**
```powershell
cd backend\services\trade-service
npm start
```

**Terminal 5 - Notification Service:**
```powershell
cd backend\services\notification-service
npm start
```

**Terminal 6 - API Gateway:**
```powershell
cd backend\api-gateway
npm start
```

### Cách 2: Tự động (start-all.bat)

```powershell
cd backend
.\start-all.bat
```

⚠️ **Lưu ý:** Script này sẽ mở 6 cửa sổ cmd mới

## Bước 3: Kiểm tra services

1. **Consul UI:** http://localhost:8500 - Kiểm tra 6 services đã register chưa
2. **API Gateway:** http://localhost:3000/health
3. **User Service:** http://localhost:3001/health
4. **Market Service:** http://localhost:3002/health
5. **Portfolio Service:** http://localhost:3003/health
6. **Trade Service:** http://localhost:3004/health
7. **Notification Service:** http://localhost:3005/health

## Bước 4: Test API

### 1. Đăng ký user:
```bash
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456"
}
```

### 2. Đăng nhập:
```bash
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

Lấy `token` từ response

### 3. Xem giá coin:
```bash
GET http://localhost:3000/api/market/prices
```

### 4. Mua Bitcoin:
```bash
POST http://localhost:3000/api/trade/buy
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "symbol": "BTC",
  "amount": 100
}
```

### 5. Xem portfolio:
```bash
GET http://localhost:3000/api/portfolio
Authorization: Bearer YOUR_TOKEN_HERE
```

### 6. Xem thông báo:
```bash
GET http://localhost:3000/api/notifications
Authorization: Bearer YOUR_TOKEN_HERE
```

## Troubleshooting

### Lỗi "Failed to register service with Consul: bad request"

**Nguyên nhân:** Consul chưa khởi động hoặc health check endpoint không đúng

**Giải pháp:**
1. Kiểm tra Consul đã chạy: http://localhost:8500
2. Đảm bảo service có endpoint `/health`
3. Service vẫn chạy bình thường, chỉ không register với Consul

### Lỗi "EADDRINUSE" (Port đã được sử dụng)

**Giải pháp:**
```powershell
# Tìm process đang dùng port
netstat -ano | findstr :3001

# Kill process (thay PID bằng số từ lệnh trên)
taskkill /PID <PID> /F
```

### Lỗi MongoDB connection

**Kiểm tra:**
1. MongoDB URI trong file .env đúng chưa
2. Internet connection (dùng MongoDB Atlas)
3. IP của máy đã được whitelist trong MongoDB Atlas chưa

### Lỗi CoinGecko API rate limit

**Giải pháp:**
- API đã có caching (30s cho prices, 5 phút cho charts)
- Nếu vẫn lỗi, đợi 1-2 phút rồi thử lại

## Ports Summary

| Service | Port | Health Check |
|---------|------|--------------|
| Consul | 8500 | http://localhost:8500 |
| API Gateway | 3000 | http://localhost:3000/health |
| User Service | 3001 | http://localhost:3001/health |
| Market Service | 3002 | http://localhost:3002/health |
| Portfolio Service | 3003 | http://localhost:3003/health |
| Trade Service | 3004 | http://localhost:3004/health |
| Notification Service | 3005 | http://localhost:3005/health |
