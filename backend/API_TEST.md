# 🧪 API Testing Guide

## Base URL
```
http://localhost:3000/api
```

## 1️⃣ User Service - Authentication

### Đăng ký user mới
```http
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "username": "testuser",
      "email": "test@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Đăng nhập
```http
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

**Lưu token từ response để dùng cho các request tiếp theo!**

### Xem thông tin user
```http
GET http://localhost:3000/api/users/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

### Xem số dư ví
```http
GET http://localhost:3000/api/users/balance
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "balance": 1000,
    "currency": "USDT",
    "history": []
  }
}
```

---

## 2️⃣ Market Service - Giá Cryptocurrency

### Lấy giá tất cả coins
```http
GET http://localhost:3000/api/market/prices
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "BTC": { "symbol": "BTC", "price": 68000, "change24h": 2.5 },
    "ETH": { "symbol": "ETH", "price": 3500, "change24h": 1.8 },
    ...
  }
}
```

### Lấy giá 1 coin cụ thể
```http
GET http://localhost:3000/api/market/prices/BTC
```

### Lấy dữ liệu chart
```http
GET http://localhost:3000/api/market/chart/BTC?days=7
```

### Lấy danh sách coins hỗ trợ
```http
GET http://localhost:3000/api/market/coins
```

---

## 3️⃣ Trade Service - Mua/Bán Coin

### Mua Bitcoin
```http
POST http://localhost:3000/api/trade/buy
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "symbol": "BTC",
  "amount": 100
}
```

**Ý nghĩa:** Mua BTC với $100 USDT

**Expected Response:**
```json
{
  "success": true,
  "message": "Buy order executed successfully",
  "data": {
    "trade": {
      "id": "...",
      "type": "buy",
      "symbol": "BTC",
      "amount": 100,
      "price": 68000,
      "quantity": 0.00147,
      "fee": 0.1,
      "total": 100.1
    }
  }
}
```

### Mua Ethereum
```http
POST http://localhost:3000/api/trade/buy
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "symbol": "ETH",
  "amount": 50
}
```

### Bán Bitcoin
```http
POST http://localhost:3000/api/trade/sell
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "symbol": "BTC",
  "quantity": 0.001
}
```

**Ý nghĩa:** Bán 0.001 BTC

### Xem lịch sử giao dịch
```http
GET http://localhost:3000/api/trade/history
Authorization: Bearer YOUR_TOKEN_HERE
```

Query parameters (optional):
- `type`: buy hoặc sell
- `symbol`: BTC, ETH, etc.
- `limit`: số lượng records (default: 50)

### Xem thống kê giao dịch
```http
GET http://localhost:3000/api/trade/stats
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 4️⃣ Portfolio Service - Danh mục đầu tư

### Xem portfolio
```http
GET http://localhost:3000/api/portfolio
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "holdings": [
      {
        "symbol": "BTC",
        "quantity": 0.00147,
        "averagePrice": 68000,
        "currentPrice": 68500,
        "totalValue": 100.7,
        "profitLoss": 0.7,
        "profitLossPercent": 0.7
      }
    ],
    "totalValue": 100.7,
    "totalInvested": 100,
    "totalProfitLoss": 0.7
  }
}
```

### Xem portfolio summary
```http
GET http://localhost:3000/api/portfolio/summary
Authorization: Bearer YOUR_TOKEN_HERE
```

### Xem holding cụ thể
```http
GET http://localhost:3000/api/portfolio/holding/BTC
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 5️⃣ Notification Service - Thông báo

### Xem tất cả thông báo
```http
GET http://localhost:3000/api/notifications
Authorization: Bearer YOUR_TOKEN_HERE
```

Query parameters (optional):
- `status`: unread, read, archived
- `type`: trade, alert, system

### Đánh dấu đã đọc
```http
PUT http://localhost:3000/api/notifications/{notificationId}/read
Authorization: Bearer YOUR_TOKEN_HERE
```

### Đánh dấu tất cả đã đọc
```http
PUT http://localhost:3000/api/notifications/read-all
Authorization: Bearer YOUR_TOKEN_HERE
```

### Tạo price alert
```http
POST http://localhost:3000/api/notifications/alerts
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "symbol": "BTC",
  "targetPrice": 70000,
  "condition": "above"
}
```

**Condition:** "above" hoặc "below"

### Xem price alerts
```http
GET http://localhost:3000/api/notifications/alerts
Authorization: Bearer YOUR_TOKEN_HERE
```

### Xóa price alert
```http
DELETE http://localhost:3000/api/notifications/alerts/{alertId}
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🎯 Testing Flow

### Kịch bản test hoàn chỉnh:

```
1. Đăng ký user mới
   POST /api/users/register

2. Lưu token từ response

3. Xem số dư ban đầu (1000 USDT)
   GET /api/users/balance

4. Xem giá Bitcoin hiện tại
   GET /api/market/prices/BTC

5. Mua Bitcoin với $100
   POST /api/trade/buy { "symbol": "BTC", "amount": 100 }

6. Xem portfolio
   GET /api/portfolio
   => Phải thấy BTC trong holdings

7. Xem số dư mới (900 - 0.1 fee = 899.9 USDT)
   GET /api/users/balance

8. Xem lịch sử giao dịch
   GET /api/trade/history
   => Phải thấy 1 giao dịch BUY

9. Xem thông báo
   GET /api/notifications
   => Phải thấy thông báo về giao dịch mua

10. Tạo price alert
    POST /api/notifications/alerts
    { "symbol": "BTC", "targetPrice": 70000, "condition": "above" }

11. Bán một phần Bitcoin
    POST /api/trade/sell { "symbol": "BTC", "quantity": 0.0005 }

12. Xem portfolio summary
    GET /api/portfolio/summary
    => Thấy profit/loss
```

---

## 🛠️ Testing Tools

### Option 1: VS Code REST Client Extension
Install: `humao.rest-client`

Tạo file `test.http`:
```http
### Variables
@baseUrl = http://localhost:3000/api
@token = YOUR_TOKEN_HERE

### Register
POST {{baseUrl}}/users/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456"
}
```

### Option 2: Postman
Import các requests vào Postman collection

### Option 3: curl
```bash
# Register
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Get prices (save token first)
curl http://localhost:3000/api/market/prices

# Buy BTC
curl -X POST http://localhost:3000/api/trade/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"symbol":"BTC","amount":100}'
```

---

## 📊 Expected System Behavior

### Sau khi mua coin:
- ✅ Balance giảm (amount + fee)
- ✅ Portfolio có holding mới
- ✅ Trade history có record
- ✅ Notification được tạo

### Sau khi bán coin:
- ✅ Balance tăng (price * quantity - fee)
- ✅ Portfolio holding giảm
- ✅ Trade history có record
- ✅ Notification được tạo

### Price Alert:
- ✅ Cron job check mỗi phút
- ✅ Notification tự động khi giá đạt target
- ✅ Alert tự động disabled sau khi trigger

---

## ⚠️ Error Cases to Test

### Insufficient balance
```http
POST /api/trade/buy
{ "symbol": "BTC", "amount": 10000 }
=> Should return error: "Insufficient balance"
```

### Invalid symbol
```http
POST /api/trade/buy
{ "symbol": "INVALID", "amount": 100 }
=> Should return error: "Invalid coin symbol"
```

### Minimum trade amount
```http
POST /api/trade/buy
{ "symbol": "BTC", "amount": 5 }
=> Should return error: "Minimum trade amount is $10"
```

### Sell more than owned
```http
POST /api/trade/sell
{ "symbol": "BTC", "quantity": 100 }
=> Should return error: "Insufficient holdings"
```

---

## 🎯 Success Criteria

✅ Tất cả endpoints trả về status 200/201  
✅ Token authentication hoạt động  
✅ Database được cập nhật đúng  
✅ Inter-service communication hoạt động  
✅ Notifications được tạo tự động  
✅ Portfolio calculation chính xác  
✅ Balance tracking chính xác  
✅ Fee calculation đúng (0.1%)  

