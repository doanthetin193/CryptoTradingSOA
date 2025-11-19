# CryptoTrading SOA Architecture

## Kiến trúc SOA (Service-Oriented Architecture)

### Nguyên tắc quan trọng:
❌ **KHÔNG ĐƯỢC** service-to-service communication trực tiếp  
✅ **BẮT BUỘC** tất cả giao tiếp qua API Gateway

## Luồng giao tiếp đúng

```
Frontend → API Gateway → Service(s)
```

### ❌ SAI - Service gọi trực tiếp service khác:
```
Trade Service → User Service (WRONG!)
Trade Service → Market Service (WRONG!)
Portfolio Service → Market Service (WRONG!)
```

### ✅ ĐÚNG - API Gateway orchestrate:
```
Frontend → API Gateway → {
  1. Market Service (get price)
  2. User Service (check balance)
  3. User Service (update balance)
  4. Portfolio Service (update holding)
  5. Trade Service (create record)
  6. Notification Service (send notification)
}
```

## Vai trò từng thành phần

### 1. API Gateway
- **Entry point duy nhất** cho tất cả requests từ frontend
- **Orchestration**: Điều phối calls đến nhiều services
- **Authentication**: Xác thực JWT token
- **Rate limiting**: Giới hạn requests
- **Routing**: Phân phối requests đến đúng service

### 2. User Service
- Quản lý users và authentication
- Quản lý wallet balance
- **CHỈ** xử lý logic về user, KHÔNG gọi service khác

### 3. Market Service
- Lấy giá crypto từ CoinGecko API
- Cache giá để tối ưu performance
- **CHỈ** cung cấp data giá, KHÔNG gọi service khác

### 4. Portfolio Service
- Quản lý holdings của user
- Tính toán giá trị portfolio
- **CHỈ** CRUD portfolio data, KHÔNG gọi service khác
- API Gateway sẽ cung cấp prices khi cần

### 5. Trade Service
- Ghi lại lịch sử giao dịch
- **CHỈ** quản lý trade records, KHÔNG gọi service khác
- API Gateway sẽ orchestrate toàn bộ logic buy/sell

### 6. Notification Service
- Gửi và quản lý notifications
- Quản lý price alerts
- **CHỈ** CRUD notifications, KHÔNG gọi service khác

## Ví dụ: Luồng Buy Coin

### Cách CŨ (SAI):
```javascript
// Trade Service trực tiếp gọi 4 services khác
exports.buyCoin = async (req, res) => {
  const price = await marketService.getPrice();  // ❌ SAI
  const balance = await userService.getBalance(); // ❌ SAI
  await userService.updateBalance();             // ❌ SAI
  await portfolioService.addHolding();           // ❌ SAI
  await notificationService.send();              // ❌ SAI
}
```

### Cách MỚI (ĐÚNG):
```javascript
// API Gateway orchestrates
app.post('/api/trade/buy', async (req, res) => {
  // 1. Get price from Market Service
  const price = await axios.get('http://localhost:3002/price/...');
  
  // 2. Get & check balance from User Service
  const balance = await axios.get('http://localhost:3001/balance');
  if (balance < cost) return error;
  
  // 3. Update balance
  await axios.put('http://localhost:3001/balance', { amount: -cost });
  
  // 4. Update portfolio
  await axios.post('http://localhost:3003/holding', { ... });
  
  // 5. Create trade record
  const trade = await axios.post('http://localhost:3004/', { ... });
  
  // 6. Send notification
  await axios.post('http://localhost:3005/send', { ... });
  
  return res.json({ success: true, trade });
});

// Trade Service CHỈ lưu record
exports.createTrade = async (req, res) => {
  const trade = await Trade.create(req.body);
  return res.json({ success: true, trade });
}
```

## Lợi ích của SOA đúng cách

1. **Loose Coupling**: Services độc lập, không phụ thuộc lẫn nhau
2. **Scalability**: Dễ scale từng service riêng biệt
3. **Maintainability**: Dễ maintain, debug, và test
4. **Flexibility**: Dễ thay đổi hoặc thêm service mới
5. **Single Point of Control**: API Gateway quản lý tất cả

## Cấu trúc thư mục

```
backend/
├── .env (duy nhất)
├── package.json (duy nhất)
├── node_modules/ (duy nhất)
│
├── api-gateway/
│   └── server.js (orchestration logic)
│
├── services/
│   ├── user-service/
│   │   ├── server.js
│   │   ├── controllers/ (CRUD users, balance)
│   │   └── models/
│   │
│   ├── market-service/
│   │   ├── server.js
│   │   └── controllers/ (fetch prices from CoinGecko)
│   │
│   ├── portfolio-service/
│   │   ├── server.js
│   │   ├── controllers/ (CRUD portfolio)
│   │   └── models/
│   │
│   ├── trade-service/
│   │   ├── server.js
│   │   ├── controllers/ (CRUD trades)
│   │   └── models/
│   │
│   └── notification-service/
│       ├── server.js
│       ├── controllers/ (CRUD notifications)
│       └── models/
│
└── shared/
    ├── config/ (db, services)
    ├── middleware/ (auth, errorHandler)
    └── utils/ (logger, httpClient, serviceDiscovery)
```

## Quy tắc bắt buộc

1. ❌ Services KHÔNG ĐƯỢC import hoặc sử dụng `httpClient` để gọi service khác
2. ✅ Chỉ API Gateway mới được gọi đến các services
3. ✅ Services chỉ expose API endpoints đơn giản (CRUD)
4. ✅ Business logic phức tạp (orchestration) nằm ở API Gateway
5. ✅ Shared logic (auth, logger, db) nằm trong thư mục `shared/`
