# 🗄️ Database Schema Documentation

> Tài liệu mô tả chi tiết các MongoDB collections trong hệ thống CryptoTrading SOA

## 📋 Tổng quan

| Collection | Mô tả | Service quản lý |
|------------|-------|-----------------|
| `users` | Thông tin người dùng, ví USDT | User Service |
| `portfolios` | Danh mục đầu tư, holdings | Portfolio Service |
| `trades` | Lịch sử giao dịch mua/bán | Trade Service |
| `notifications` | Thông báo hệ thống | Notification Service |
| `pricealerts` | Cảnh báo giá | Notification Service |

## 📊 Entity Relationship Diagram

```
┌─────────────┐       1:1        ┌─────────────┐
│    users    │─────────────────►│  portfolios │
│   (userId)  │                  │  (userId)   │
└──────┬──────┘                  └─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│   trades    │
│  (userId)   │
└─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐       1:N        ┌─────────────┐
│notifications│◄─────────────────│ pricealerts │
│  (userId)   │                  │  (userId)   │
└─────────────┘                  └─────────────┘
```

---

## 1️⃣ Collection: `users`

### Mô tả
Lưu trữ thông tin người dùng, bao gồm thông tin xác thực, số dư ví USDT và lịch sử thay đổi số dư.

### Schema

```javascript
{
  _id: ObjectId,                    // ID tự động tạo bởi MongoDB
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6                    // Hash bằng bcrypt (10 rounds)
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  balance: {
    type: Number,
    default: 1000,                  // 1000 USDT ban đầu
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true                   // Admin có thể khóa tài khoản
  },
  balanceHistory: [{
    amount: Number,                 // Số tiền thay đổi (+/-)
    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'trade', 'initial', 'admin']
    },
    description: String,            // Mô tả giao dịch
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: Date,                  // Mongoose timestamps
  updatedAt: Date
}
```

### Indexes

```javascript
// Unique index cho email (tự động từ schema)
{ email: 1 }  // unique

// Index cho admin queries
{ role: 1, isActive: 1 }

// Index cho balance history
{ "balanceHistory.timestamp": -1 }
```

### Ví dụ document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "password": "$2a$10$X7UrH5YxX...",
  "fullName": "Nguyễn Văn A",
  "role": "user",
  "balance": 850.50,
  "isActive": true,
  "balanceHistory": [
    {
      "amount": 1000,
      "type": "initial",
      "description": "Số dư ban đầu",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "amount": -150.50,
      "type": "trade",
      "description": "Mua 0.002 BTC",
      "timestamp": "2024-01-02T10:30:00.000Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T10:30:00.000Z"
}
```

---

## 2️⃣ Collection: `portfolios`

### Mô tả
Lưu trữ danh mục đầu tư của người dùng, bao gồm các holdings (coin đang nắm giữ) và thông tin tổng hợp.

### Schema

```javascript
{
  _id: ObjectId,
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    unique: true                    // Mỗi user chỉ có 1 portfolio
  },
  holdings: [{
    symbol: {
      type: String,
      uppercase: true               // BTC, ETH, ...
    },
    coinId: {
      type: String,
      lowercase: true               // bitcoin, ethereum, ...
    },
    name: String,                   // Bitcoin, Ethereum, ...
    amount: {
      type: Number,
      min: 0
    },
    averageBuyPrice: {
      type: Number,
      min: 0
    },
    totalInvested: {
      type: Number,
      min: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  totalValue: {
    type: Number,
    default: 0                      // Tổng giá trị hiện tại (tính từ giá market)
  },
  totalInvested: {
    type: Number,
    default: 0                      // Tổng tiền đã đầu tư
  },
  totalProfit: {
    type: Number,
    default: 0                      // Lãi/lỗ = totalValue - totalInvested
  },
  profitPercentage: {
    type: Number,
    default: 0                      // % lãi/lỗ
  },
  lastCalculated: Date,             // Lần cuối tính toán P&L
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
// Unique index cho userId
{ userId: 1 }  // unique

// Index cho holdings lookup
{ "holdings.symbol": 1 }
{ "holdings.coinId": 1 }
```

### Ví dụ document

```json
{
  "_id": "507f1f77bcf86cd799439022",
  "userId": "507f1f77bcf86cd799439011",
  "holdings": [
    {
      "symbol": "BTC",
      "coinId": "bitcoin",
      "name": "Bitcoin",
      "amount": 0.002,
      "averageBuyPrice": 75000,
      "totalInvested": 150,
      "lastUpdated": "2024-01-02T10:30:00.000Z"
    },
    {
      "symbol": "ETH",
      "coinId": "ethereum",
      "name": "Ethereum",
      "amount": 0.5,
      "averageBuyPrice": 4000,
      "totalInvested": 2000,
      "lastUpdated": "2024-01-03T14:00:00.000Z"
    }
  ],
  "totalValue": 2200,
  "totalInvested": 2150,
  "totalProfit": 50,
  "profitPercentage": 2.33,
  "lastCalculated": "2024-01-03T15:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-03T14:00:00.000Z"
}
```

### Công thức tính toán

```javascript
// Average Buy Price (khi mua thêm)
newAvgPrice = (oldAmount * oldAvgPrice + newAmount * newPrice) / (oldAmount + newAmount)

// Total Invested
totalInvested = Σ(holding.totalInvested)

// Total Value (cần giá hiện tại từ Market Service)
totalValue = Σ(holding.amount * currentPrice)

// Profit
totalProfit = totalValue - totalInvested

// Profit Percentage
profitPercentage = (totalProfit / totalInvested) * 100
```

---

## 3️⃣ Collection: `trades`

### Mô tả
Lưu trữ lịch sử tất cả giao dịch mua/bán của người dùng.

### Schema

```javascript
{
  _id: ObjectId,
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  symbol: {
    type: String,
    uppercase: true,
    required: true
  },
  coinId: {
    type: String,
    lowercase: true
  },
  coinName: String,
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0                          // Giá tại thời điểm giao dịch
  },
  totalCost: {
    type: Number,
    required: true                  // = amount * price
  },
  fee: {
    type: Number,
    default: 0                      // Phí giao dịch
  },
  feePercentage: {
    type: Number,
    default: 0.1                    // 0.1%
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  balanceBefore: Number,            // Số dư trước giao dịch
  balanceAfter: Number,             // Số dư sau giao dịch
  executedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
// Compound index cho user history (sorted by date)
{ userId: 1, createdAt: -1 }

// Index cho filtering
{ userId: 1, type: 1 }
{ userId: 1, symbol: 1 }
{ status: 1 }

// Index cho statistics
{ userId: 1, type: 1, status: 1 }
```

### Ví dụ document

```json
{
  "_id": "507f1f77bcf86cd799439033",
  "userId": "507f1f77bcf86cd799439011",
  "type": "buy",
  "symbol": "BTC",
  "coinId": "bitcoin",
  "coinName": "Bitcoin",
  "amount": 0.002,
  "price": 75000,
  "totalCost": 150,
  "fee": 0.15,
  "feePercentage": 0.1,
  "status": "completed",
  "balanceBefore": 1000,
  "balanceAfter": 849.85,
  "executedAt": "2024-01-02T10:30:00.000Z",
  "createdAt": "2024-01-02T10:30:00.000Z",
  "updatedAt": "2024-01-02T10:30:00.000Z"
}
```

### Công thức

```javascript
// Buy
totalCost = amount * price
fee = totalCost * (feePercentage / 100)
balanceAfter = balanceBefore - totalCost - fee

// Sell
totalValue = amount * price
fee = totalValue * (feePercentage / 100)
balanceAfter = balanceBefore + totalValue - fee
```

---

## 4️⃣ Collection: `notifications`

### Mô tả
Lưu trữ tất cả thông báo gửi đến người dùng (giao dịch, cảnh báo giá, hệ thống).

### Schema

```javascript
{
  _id: ObjectId,
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['trade', 'price_alert', 'system', 'warning'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: Object,                   // Flexible data (trade info, alert info, etc.)
    default: {}
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channel: {
    type: String,
    enum: ['app', 'email', 'both'],
    default: 'app'
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
// User notifications (sorted by date, unread first)
{ userId: 1, status: 1, createdAt: -1 }

// Filter by type
{ userId: 1, type: 1 }

// Cleanup old notifications
{ createdAt: 1 }  // TTL index optional
```

### Ví dụ documents

**Trade notification:**
```json
{
  "_id": "507f1f77bcf86cd799439044",
  "userId": "507f1f77bcf86cd799439011",
  "type": "trade",
  "title": "Mua BTC thành công",
  "message": "Bạn đã mua 0.002 BTC với giá $75,000. Phí: $0.15",
  "data": {
    "tradeId": "507f1f77bcf86cd799439033",
    "type": "buy",
    "symbol": "BTC",
    "amount": 0.002,
    "price": 75000,
    "fee": 0.15
  },
  "status": "unread",
  "priority": "medium",
  "channel": "app",
  "sentAt": "2024-01-02T10:30:00.000Z",
  "createdAt": "2024-01-02T10:30:00.000Z"
}
```

**Price alert notification:**
```json
{
  "_id": "507f1f77bcf86cd799439055",
  "userId": "507f1f77bcf86cd799439011",
  "type": "price_alert",
  "title": "🔔 Cảnh báo giá BTC",
  "message": "BTC đã vượt $80,000! Giá hiện tại: $80,500",
  "data": {
    "alertId": "507f1f77bcf86cd799439066",
    "symbol": "BTC",
    "targetPrice": 80000,
    "currentPrice": 80500,
    "condition": "above"
  },
  "status": "unread",
  "priority": "high",
  "channel": "both",
  "sentAt": "2024-01-05T08:00:00.000Z",
  "createdAt": "2024-01-05T08:00:00.000Z"
}
```

---

## 5️⃣ Collection: `pricealerts`

### Mô tả
Lưu trữ các cảnh báo giá do người dùng tạo. Cron job kiểm tra mỗi phút.

### Schema

```javascript
{
  _id: ObjectId,
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    uppercase: true,
    required: true
  },
  coinId: {
    type: String,
    lowercase: true
  },
  targetPrice: {
    type: Number,
    required: true,
    min: 0
  },
  condition: {
    type: String,
    enum: ['above', 'below'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true                   // Deactivate sau khi triggered
  },
  triggered: {
    type: Boolean,
    default: false
  },
  triggeredAt: Date,
  triggeredPrice: Number,           // Giá tại thời điểm trigger
  lastChecked: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
// Active alerts for cron job
{ isActive: 1, symbol: 1 }

// User's alerts
{ userId: 1, isActive: 1 }
{ userId: 1, createdAt: -1 }
```

### Ví dụ document

```json
{
  "_id": "507f1f77bcf86cd799439066",
  "userId": "507f1f77bcf86cd799439011",
  "symbol": "BTC",
  "coinId": "bitcoin",
  "targetPrice": 80000,
  "condition": "above",
  "isActive": false,
  "triggered": true,
  "triggeredAt": "2024-01-05T08:00:00.000Z",
  "triggeredPrice": 80500,
  "lastChecked": "2024-01-05T08:00:00.000Z",
  "createdAt": "2024-01-03T12:00:00.000Z",
  "updatedAt": "2024-01-05T08:00:00.000Z"
}
```

### Logic kiểm tra (Cron Job)

```javascript
// Chạy mỗi phút
// 1. Lấy tất cả alerts có isActive = true
// 2. Lấy giá hiện tại từ Market Service
// 3. Với mỗi alert:
//    - Nếu condition = 'above' && currentPrice >= targetPrice → trigger
//    - Nếu condition = 'below' && currentPrice <= targetPrice → trigger
// 4. Khi trigger:
//    - Set isActive = false, triggered = true
//    - Tạo notification
//    - Gửi WebSocket event
//    - (Optional) Gửi email
```

---

## 🔧 MongoDB Commands

### Tạo Indexes

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1, isActive: 1 });

// Portfolios
db.portfolios.createIndex({ userId: 1 }, { unique: true });
db.portfolios.createIndex({ "holdings.symbol": 1 });

// Trades
db.trades.createIndex({ userId: 1, createdAt: -1 });
db.trades.createIndex({ userId: 1, type: 1 });
db.trades.createIndex({ userId: 1, symbol: 1 });

// Notifications
db.notifications.createIndex({ userId: 1, status: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, type: 1 });

// Price Alerts
db.pricealerts.createIndex({ isActive: 1, symbol: 1 });
db.pricealerts.createIndex({ userId: 1, isActive: 1 });
```

### Useful Queries

```javascript
// Lấy portfolio với holdings
db.portfolios.findOne({ userId: ObjectId("...") });

// Lấy trades gần nhất
db.trades.find({ userId: ObjectId("...") })
  .sort({ createdAt: -1 })
  .limit(20);

// Đếm unread notifications
db.notifications.countDocuments({ 
  userId: ObjectId("..."), 
  status: "unread" 
});

// Lấy active price alerts
db.pricealerts.find({ isActive: true });

// Trade statistics
db.trades.aggregate([
  { $match: { userId: ObjectId("..."), status: "completed" } },
  { $group: {
    _id: "$type",
    count: { $sum: 1 },
    totalValue: { $sum: "$totalCost" },
    totalFees: { $sum: "$fee" }
  }}
]);
```

---

## 📈 Data Flow Examples

### Mua Coin

```
1. User Service: balance -= (totalCost + fee)
2. Portfolio Service: 
   - Nếu chưa có holding → thêm mới
   - Nếu đã có → cập nhật amount, averageBuyPrice
3. Trade Service: tạo trade record
4. Notification Service: tạo notification
```

### Bán Coin

```
1. Portfolio Service: holding.amount -= sellAmount
   - Nếu amount = 0 → xóa holding
2. User Service: balance += (totalValue - fee)
3. Trade Service: tạo trade record
4. Notification Service: tạo notification
```

### Price Alert Trigger

```
1. Cron job: check price mỗi phút
2. PriceAlert: isActive = false, triggered = true
3. Notification: tạo price_alert notification
4. WebSocket: emit event đến user
5. (Optional) Email: gửi email thông báo
```

---

**Lưu ý:** Schema trên là logical schema. Mongoose sẽ tự động thêm `_id`, `__v`, `createdAt`, `updatedAt` khi sử dụng timestamps option.
