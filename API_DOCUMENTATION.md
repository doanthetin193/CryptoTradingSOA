# 📡 API Documentation

> Tài liệu chi tiết tất cả API endpoints của hệ thống CryptoTrading SOA

## 📋 Tổng quan

- **Base URL:** `http://localhost:3000/api`
- **Authentication:** JWT Bearer Token
- **Content-Type:** `application/json`

### Authentication Header

```
Authorization: Bearer <jwt_token>
```

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

---

## 🔐 Authentication APIs

### POST `/api/users/register`

Đăng ký tài khoản mới.

**Auth Required:** ❌

**Rate Limit:** 3 requests / 60 phút

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "123456",
  "fullName": "Nguyễn Văn A"
}
```

**Validation:**
- `email`: Required, valid email format, unique
- `password`: Required, min 6 characters
- `fullName`: Required

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "user",
      "balance": 1000,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Đăng ký thành công"
}
```

**Error Responses:**
| Code | Message |
|------|---------|
| 400 | Email đã được đăng ký |
| 400 | Mật khẩu phải có ít nhất 6 ký tự |
| 429 | Quá nhiều lần đăng ký, thử lại sau |

---

### POST `/api/users/login`

Đăng nhập vào hệ thống.

**Auth Required:** ❌

**Rate Limit:** 5 requests / 15 phút

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "user",
      "balance": 850.50,
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Đăng nhập thành công"
}
```

**Error Responses:**
| Code | Message |
|------|---------|
| 400 | Email hoặc mật khẩu không đúng |
| 403 | Tài khoản đã bị vô hiệu hóa |
| 429 | Quá nhiều lần đăng nhập, thử lại sau |

---

## 👤 User APIs

### GET `/api/users/profile`

Lấy thông tin profile người dùng.

**Auth Required:** ✅

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "user",
    "balance": 850.50,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T10:30:00.000Z"
  }
}
```

---

### PUT `/api/users/profile`

Cập nhật thông tin profile.

**Auth Required:** ✅

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn B"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn B",
    "role": "user",
    "balance": 850.50
  },
  "message": "Cập nhật thành công"
}
```

---

### GET `/api/users/balance`

Lấy số dư ví USDT.

**Auth Required:** ✅

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "balance": 850.50,
    "currency": "USDT"
  }
}
```

---

### GET `/api/users/balance/history`

Lấy lịch sử thay đổi số dư.

**Auth Required:** ✅

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Trang hiện tại |
| limit | number | 20 | Số items/trang |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "amount": -150.15,
        "type": "trade",
        "description": "Mua 0.002 BTC",
        "timestamp": "2024-01-02T10:30:00.000Z"
      },
      {
        "amount": 1000,
        "type": "initial",
        "description": "Số dư ban đầu",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "pages": 1
    }
  }
}
```

---

## 📈 Market APIs

### GET `/api/market/prices`

Lấy giá tất cả coins được hỗ trợ.

**Auth Required:** ✅

**Cache:** 2 phút

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "bitcoin",
      "symbol": "BTC",
      "name": "Bitcoin",
      "current_price": 75000,
      "price_change_24h": 1500,
      "price_change_percentage_24h": 2.04,
      "market_cap": 1470000000000,
      "total_volume": 28000000000,
      "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
    },
    {
      "id": "ethereum",
      "symbol": "ETH",
      "name": "Ethereum",
      "current_price": 4200,
      "price_change_24h": -50,
      "price_change_percentage_24h": -1.18,
      "market_cap": 505000000000,
      "total_volume": 15000000000,
      "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
    }
    // ... 6 more coins (BNB, SOL, XRP, ADA, DOGE, DOT)
  ],
  "cached": true,
  "cachedAt": "2024-01-02T10:30:00.000Z"
}
```

---

### GET `/api/market/price/:coinId`

Lấy giá chi tiết của một coin.

**Auth Required:** ✅

**Path Parameters:**
| Param | Description |
|-------|-------------|
| coinId | ID của coin (bitcoin, ethereum, ...) |

**Example:** `GET /api/market/price/bitcoin`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "bitcoin",
    "symbol": "BTC",
    "name": "Bitcoin",
    "current_price": 75000,
    "price_change_24h": 1500,
    "price_change_percentage_24h": 2.04,
    "market_cap": 1470000000000,
    "total_volume": 28000000000,
    "high_24h": 76000,
    "low_24h": 73500,
    "circulating_supply": 19600000,
    "max_supply": 21000000
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Coin không được hỗ trợ"
}
```

---

### GET `/api/market/chart/:coinId`

Lấy dữ liệu biểu đồ giá.

**Auth Required:** ✅

**Path Parameters:**
| Param | Description |
|-------|-------------|
| coinId | ID của coin |

**Query Parameters:**
| Param | Type | Default | Options |
|-------|------|---------|---------|
| days | number | 7 | 7, 14, 30 |

**Example:** `GET /api/market/chart/bitcoin?days=7`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "coinId": "bitcoin",
    "days": 7,
    "prices": [
      [1704067200000, 73500],
      [1704153600000, 74200],
      [1704240000000, 75000],
      // ... more data points
    ]
  }
}
```

---

## 💰 Trade APIs

### POST `/api/trade/buy`

Mua coin.

**Auth Required:** ✅

**Request Body:**
```json
{
  "symbol": "BTC",
  "coinId": "bitcoin",
  "amount": 0.002
}
```

**Validation:**
- `symbol`: Required, uppercase (BTC, ETH, ...)
- `coinId`: Required, lowercase (bitcoin, ethereum, ...)
- `amount`: Required, positive number

**Business Rules:**
- Minimum trade: $5 USD
- Fee: 0.1% of total
- Balance must be sufficient

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "trade": {
      "_id": "507f1f77bcf86cd799439033",
      "type": "buy",
      "symbol": "BTC",
      "coinId": "bitcoin",
      "amount": 0.002,
      "price": 75000,
      "totalCost": 150,
      "fee": 0.15,
      "status": "completed",
      "balanceBefore": 1000,
      "balanceAfter": 849.85,
      "executedAt": "2024-01-02T10:30:00.000Z"
    },
    "newBalance": 849.85,
    "portfolio": {
      "holdings": [
        {
          "symbol": "BTC",
          "amount": 0.002,
          "averageBuyPrice": 75000
        }
      ]
    }
  },
  "message": "Mua BTC thành công"
}
```

**Error Responses:**
| Code | Message |
|------|---------|
| 400 | Số tiền tối thiểu là $5 |
| 400 | Số dư không đủ. Cần X USDT, có Y USDT |
| 503 | Service tạm thời không khả dụng |

---

### POST `/api/trade/sell`

Bán coin.

**Auth Required:** ✅

**Request Body:**
```json
{
  "symbol": "BTC",
  "amount": 0.001
}
```

**Validation:**
- `symbol`: Required
- `amount`: Required, positive, <= holdings

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "trade": {
      "_id": "507f1f77bcf86cd799439034",
      "type": "sell",
      "symbol": "BTC",
      "amount": 0.001,
      "price": 76000,
      "totalCost": 76,
      "fee": 0.076,
      "status": "completed",
      "balanceBefore": 849.85,
      "balanceAfter": 925.774,
      "executedAt": "2024-01-03T14:00:00.000Z"
    },
    "newBalance": 925.774
  },
  "message": "Bán BTC thành công"
}
```

**Error Responses:**
| Code | Message |
|------|---------|
| 400 | Bạn không sở hữu coin này |
| 400 | Số lượng vượt quá số coin đang có |

---

### GET `/api/trade/history`

Lấy lịch sử giao dịch.

**Auth Required:** ✅

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Trang hiện tại |
| limit | number | 20 | Số items/trang |
| type | string | - | Filter: buy, sell |
| symbol | string | - | Filter theo coin |

**Example:** `GET /api/trade/history?page=1&limit=10&type=buy`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "trades": [
      {
        "_id": "507f1f77bcf86cd799439034",
        "type": "sell",
        "symbol": "BTC",
        "coinName": "Bitcoin",
        "amount": 0.001,
        "price": 76000,
        "totalCost": 76,
        "fee": 0.076,
        "status": "completed",
        "executedAt": "2024-01-03T14:00:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439033",
        "type": "buy",
        "symbol": "BTC",
        "coinName": "Bitcoin",
        "amount": 0.002,
        "price": 75000,
        "totalCost": 150,
        "fee": 0.15,
        "status": "completed",
        "executedAt": "2024-01-02T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "pages": 1
    }
  }
}
```

---

## 📊 Portfolio APIs

### GET `/api/portfolio`

Lấy danh mục đầu tư.

**Auth Required:** ✅

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439022",
    "userId": "507f1f77bcf86cd799439011",
    "holdings": [
      {
        "symbol": "BTC",
        "coinId": "bitcoin",
        "name": "Bitcoin",
        "amount": 0.001,
        "averageBuyPrice": 75000,
        "totalInvested": 75,
        "currentPrice": 76000,
        "currentValue": 76,
        "profit": 1,
        "profitPercentage": 1.33
      },
      {
        "symbol": "ETH",
        "coinId": "ethereum",
        "name": "Ethereum",
        "amount": 0.5,
        "averageBuyPrice": 4000,
        "totalInvested": 2000,
        "currentPrice": 4200,
        "currentValue": 2100,
        "profit": 100,
        "profitPercentage": 5.0
      }
    ],
    "summary": {
      "totalInvested": 2075,
      "totalValue": 2176,
      "totalProfit": 101,
      "profitPercentage": 4.87
    }
  }
}
```

---

## 🔔 Notification APIs

### GET `/api/notifications`

Lấy danh sách thông báo.

**Auth Required:** ✅

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Trang hiện tại |
| limit | number | 20 | Số items/trang |
| status | string | - | Filter: unread, read |
| type | string | - | Filter: trade, price_alert, system |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "507f1f77bcf86cd799439044",
        "type": "trade",
        "title": "Mua BTC thành công",
        "message": "Bạn đã mua 0.002 BTC với giá $75,000",
        "status": "unread",
        "priority": "medium",
        "createdAt": "2024-01-02T10:30:00.000Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "pages": 1
    }
  }
}
```

---

### PUT `/api/notifications/:id/read`

Đánh dấu thông báo đã đọc.

**Auth Required:** ✅

**Path Parameters:**
| Param | Description |
|-------|-------------|
| id | ID của notification |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã đánh dấu đã đọc"
}
```

---

### PUT `/api/notifications/read-all`

Đánh dấu tất cả đã đọc.

**Auth Required:** ✅

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "modifiedCount": 5
  },
  "message": "Đã đánh dấu tất cả đã đọc"
}
```

---

### POST `/api/notifications/alert`

Tạo cảnh báo giá mới.

**Auth Required:** ✅

**Request Body:**
```json
{
  "symbol": "BTC",
  "coinId": "bitcoin",
  "targetPrice": 80000,
  "condition": "above"
}
```

**Validation:**
- `symbol`: Required
- `targetPrice`: Required, positive number
- `condition`: Required, "above" or "below"

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439066",
    "symbol": "BTC",
    "coinId": "bitcoin",
    "targetPrice": 80000,
    "condition": "above",
    "isActive": true,
    "triggered": false,
    "createdAt": "2024-01-03T12:00:00.000Z"
  },
  "message": "Tạo cảnh báo thành công"
}
```

---

### GET `/api/notifications/alerts`

Lấy danh sách cảnh báo giá.

**Auth Required:** ✅

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| active | boolean | - | Filter active/inactive |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439066",
      "symbol": "BTC",
      "targetPrice": 80000,
      "condition": "above",
      "isActive": true,
      "triggered": false,
      "createdAt": "2024-01-03T12:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439067",
      "symbol": "ETH",
      "targetPrice": 3500,
      "condition": "below",
      "isActive": false,
      "triggered": true,
      "triggeredAt": "2024-01-05T08:00:00.000Z",
      "createdAt": "2024-01-04T09:00:00.000Z"
    }
  ]
}
```

---

### DELETE `/api/notifications/alert/:id`

Xóa cảnh báo giá.

**Auth Required:** ✅

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã xóa cảnh báo"
}
```

---

## 👑 Admin APIs

> Yêu cầu role = "admin"

### GET `/api/users/admin/users`

Lấy danh sách tất cả users.

**Auth Required:** ✅ Admin

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Trang hiện tại |
| limit | number | 20 | Số items/trang |
| search | string | - | Tìm theo email/name |
| role | string | - | Filter theo role |
| isActive | boolean | - | Filter theo status |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "email": "user@example.com",
        "fullName": "Nguyễn Văn A",
        "role": "user",
        "balance": 850.50,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "stats": {
      "totalUsers": 100,
      "activeUsers": 95,
      "adminUsers": 2,
      "totalBalance": 85000
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

---

### PUT `/api/users/admin/users/:id/toggle`

Khóa/Mở khóa tài khoản.

**Auth Required:** ✅ Admin

**Path Parameters:**
| Param | Description |
|-------|-------------|
| id | ID của user |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "isActive": false
  },
  "message": "Đã khóa tài khoản"
}
```

---

### PUT `/api/users/admin/users/:id/balance`

Reset số dư về 1000 USDT.

**Auth Required:** ✅ Admin

**Path Parameters:**
| Param | Description |
|-------|-------------|
| id | ID của user |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "balance": 1000
  },
  "message": "Đã reset số dư về 1000 USDT"
}
```

---

## 🏥 Health Check

### GET `/health`

Kiểm tra trạng thái hệ thống.

**Auth Required:** ❌

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-02T10:30:00.000Z",
    "services": {
      "api-gateway": "up",
      "consul": "connected",
      "user-service": "up",
      "market-service": "up",
      "portfolio-service": "up",
      "trade-service": "up",
      "notification-service": "up"
    },
    "uptime": 86400
  }
}
```

---

## 🌐 WebSocket Events

### Connection

```javascript
// Client connect
const socket = io('http://localhost:3000', {
  auth: { token: 'jwt_token_here' }
});
```

### Events từ Server

| Event | Data | Description |
|-------|------|-------------|
| `trade_completed` | Trade object | Giao dịch hoàn thành |
| `price_alert` | Alert + Price | Cảnh báo giá triggered |
| `notification` | Notification object | Thông báo mới |
| `balance_updated` | { balance } | Số dư thay đổi |

**Example:**
```javascript
socket.on('trade_completed', (data) => {
  console.log('Trade completed:', data);
  // { type: 'buy', symbol: 'BTC', amount: 0.002, ... }
});

socket.on('price_alert', (data) => {
  console.log('Price alert:', data);
  // { symbol: 'BTC', targetPrice: 80000, currentPrice: 80500, condition: 'above' }
});
```

---

## 📋 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - No permission |
| 404 | Not Found |
| 429 | Too Many Requests - Rate limit |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Circuit open |

---

## 🧪 Testing với cURL

### Register
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","fullName":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### Get Prices (with token)
```bash
curl http://localhost:3000/api/market/prices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Buy Coin
```bash
curl -X POST http://localhost:3000/api/trade/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"symbol":"BTC","coinId":"bitcoin","amount":0.001}'
```

---

**Note:** Tất cả timestamps sử dụng ISO 8601 format (UTC).
