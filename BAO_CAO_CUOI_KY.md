# BÁO CÁO CUỐI KỲ

## HỆ THỐNG GIAO DỊCH CRYPTO ẢO - CRYPTOTRADING SOA

---

## 1. BÀI TOÁN

### 1.1. Phát biểu bài toán

Xây dựng một nền tảng giao dịch tiền điện tử ảo (simulation) cho phép người dùng:

- Học cách giao dịch cryptocurrency mà không gặp rủi ro tài chính thực
- Nhận 1000 USDT ảo ban đầu để thực hành giao dịch
- Theo dõi giá thị trường real-time từ các nguồn dữ liệu thực (CoinGecko, CoinPaprika)
- Mua/bán 8 loại coin phổ biến: BTC, ETH, BNB, SOL, XRP, ADA, DOGE, DOT
- Quản lý danh mục đầu tư và theo dõi lãi/lỗ
- Nhận thông báo real-time về giao dịch và cảnh báo giá

Hệ thống được thiết kế theo kiến trúc hướng dịch vụ (SOA - Service-Oriented Architecture) để đảm bảo khả năng mở rộng, bảo trì và phát triển dễ dàng.

---

## 2. PHÂN TÍCH CHỨC NĂNG CỦA HỆ THỐNG

### 2.1. Xác định mục tiêu của hệ thống

**Mục tiêu chính:**

- Cung cấp môi trường giao dịch crypto an toàn và không rủi ro cho người mới bắt đầu
- Mô phỏng chính xác cơ chế giao dịch thị trường thực với giá real-time
- Xây dựng hệ thống có khả năng mở rộng và bảo trì cao

**Mục tiêu con:**

1. **Quản lý người dùng:** Đăng ký, đăng nhập, quản lý tài khoản và ví ảo
2. **Dữ liệu thị trường:** Cung cấp giá real-time và biểu đồ giá lịch sử
3. **Quản lý danh mục:** Theo dõi tài sản, tính lãi/lỗ tự động
4. **Giao dịch:** Mua/bán coin với phí giao dịch, xác nhận real-time
5. **Thông báo:** Gửi thông báo và cảnh báo giá theo điều kiện người dùng đặt
6. **Quản trị:** Admin quản lý người dùng, reset balance, lock/unlock tài khoản

### 2.2. Xác định yêu cầu chức năng và phi chức năng

#### Yêu cầu chức năng:

**Người dùng (User):**

- FR-01: Đăng ký tài khoản mới với email, password, họ tên
- FR-02: Đăng nhập/đăng xuất hệ thống
- FR-03: Xem thông tin cá nhân và số dư ví USDT
- FR-04: Xem giá hiện tại của 8 loại coin được hỗ trợ
- FR-05: Xem biểu đồ giá lịch sử (7/14/30 ngày)
- FR-06: Mua coin với số lượng chỉ định (tối thiểu $5 USD)
- FR-07: Bán coin từ danh mục đầu tư
- FR-08: Xem danh mục đầu tư với giá trị hiện tại
- FR-09: Xem lịch sử giao dịch và thống kê
- FR-10: Tạo cảnh báo giá (price alert) khi coin đạt ngưỡng
- FR-11: Nhận thông báo real-time qua WebSocket

**Quản trị viên (Admin):**

- FR-12: Xem danh sách tất cả người dùng
- FR-13: Khóa/mở khóa tài khoản người dùng
- FR-14: Reset số dư về 1000 USDT
- FR-15: Xem thống kê tổng quan hệ thống

**Hệ thống:**

- FR-16: Tự động kiểm tra price alerts mỗi phút
- FR-17: Gửi thông báo khi price alert được trigger
- FR-18: Tự động xóa thông báo cũ hơn 30 ngày
- FR-19: Service discovery và health check

#### Yêu cầu phi chức năng:

**Hiệu năng (Performance):**

- NFR-01: API response time < 500ms (trừ external API calls)
- NFR-02: Hỗ trợ tối thiểu 100 concurrent users
- NFR-03: Cache giá crypto trong 2 phút để giảm API calls

**Bảo mật (Security):**

- NFR-04: Mã hóa password bằng bcrypt (10 rounds)
- NFR-05: JWT token với thời gian sống 7 ngày
- NFR-06: Rate limiting: Login (5/15min), Register (3/60min), Global (1000/15min)
- NFR-07: HTTPS cho production
- NFR-08: CORS whitelist origins

**Độ tin cậy (Reliability):**

- NFR-09: Circuit Breaker pattern cho tất cả inter-service calls
- NFR-10: Timeout 5 giây cho service calls
- NFR-11: Fallback mechanism khi service unavailable
- NFR-12: Database transaction cho atomic operations
- NFR-13: Rollback mechanism cho failed trades

**Khả năng mở rộng (Scalability):**

- NFR-14: Stateless services để hỗ trợ horizontal scaling
- NFR-15: Service discovery với Consul
- NFR-16: Load balancing cho multiple service instances

**Khả năng bảo trì (Maintainability):**

- NFR-17: Logging tập trung với Winston
- NFR-18: Health check endpoints cho tất cả services
- NFR-19: API documentation đầy đủ
- NFR-20: Code structure theo best practices

### 2.3. Biểu đồ chức năng dựa trên mục tiêu của hệ thống

```
[Chèn sơ đồ Use Case Diagram tổng quan ở đây]
- Actor: User, Admin, System
- Use cases chính: Authentication, Trading, Portfolio Management, Notifications, Market Data
```

---

## 3. PHÂN RÃ CHỨC NĂNG CON (DỊCH VỤ)

### 3.1. Kiến trúc SOA - 6 Services

Hệ thống được phân rã thành 6 microservices độc lập:

1. **API Gateway** (Port 3000)
2. **User Service** (Port 3001)
3. **Market Service** (Port 3002)
4. **Portfolio Service** (Port 3003)
5. **Trade Service** (Port 3004)
6. **Notification Service** (Port 3005)

```
[Chèn sơ đồ kiến trúc SOA tổng quan ở đây]
- Mô tả luồng: Client → API Gateway → Consul → Microservices → MongoDB
```

### 3.2. Mô tả chi tiết chức năng con (dịch vụ)

#### 3.2.1. API Gateway (Port 3000)

**Mục đích:** Điểm vào duy nhất cho tất cả client requests

**Chức năng chính:**

- **Routing & Proxying:** Forward requests đến microservices phù hợp
- **Authentication:** Verify JWT token trước khi forward
- **Authorization:** Kiểm tra role (user/admin)
- **Rate Limiting:** Ngăn chặn spam và brute-force attacks
- **Service Discovery:** Tìm địa chỉ services thông qua Consul
- **Orchestration:** Điều phối logic phức tạp (buy/sell coin)
- **WebSocket Server:** Real-time communication với client
- **Circuit Breaker:** Ngăn cascading failures

**Technology Stack:**

- Express.js (Web framework)
- http-proxy-middleware (Proxying)
- Socket.IO (WebSocket)
- Opossum (Circuit Breaker)
- express-rate-limit (Rate limiting)
- Consul (Service discovery)

**API Endpoints Orchestrated:**

- `POST /api/trade/buy` - Orchestrate buy operation
- `POST /api/trade/sell` - Orchestrate sell operation
- `GET /api/portfolio` - Enrich portfolio with current prices
- `GET /api/health/circuit-breakers` - Circuit breaker status

**Orchestration Logic:**

_Buy Coin Flow:_

1. Get current price từ Market Service
2. Validate user balance từ User Service
3. Deduct balance từ User Service (ACID transaction)
4. Add holding vào Portfolio Service
5. Record trade vào Trade Service
6. Send notification qua Notification Service
7. Emit WebSocket event cho client

_Rollback Strategy:_

- Nếu step 4 fail → Refund balance
- Nếu step 5 fail → Remove holding + Refund balance
- Nếu step 6 fail → Log warning (không rollback)

---

#### 3.2.2. User Service (Port 3001)

**Mục đích:** Quản lý người dùng và ví USDT ảo

**Chức năng chính:**

- **Authentication:** Register, login với JWT
- **User Management:** CRUD operations cho user profile
- **Wallet Management:** Quản lý số dư USDT
- **Balance History:** Tracking mọi thay đổi số dư
- **Admin Functions:** Lock/unlock user, reset balance

**Database:** MongoDB - Collection `users`

**Schema:**

```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  fullName: String (required),
  role: Enum ['user', 'admin'],
  balance: Number (default: 1000),
  isActive: Boolean (default: true),
  balanceHistory: [{
    amount: Number,
    type: Enum ['deposit', 'withdraw', 'trade', 'initial', 'admin'],
    description: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**API Endpoints:**

- `POST /register` - Đăng ký tài khoản mới
- `POST /login` - Đăng nhập
- `GET /profile` - Lấy thông tin profile (auth required)
- `PUT /profile` - Cập nhật profile
- `GET /balance` - Lấy số dư hiện tại
- `PUT /balance/deduct` - Trừ tiền (internal API)
- `PUT /balance/add` - Cộng tiền (internal API)
- `GET /admin/users` - Danh sách users (admin only)
- `PUT /admin/users/:id/toggle` - Khóa/mở khóa user
- `PUT /admin/users/:id/reset-balance` - Reset về 1000 USDT

**Business Rules:**

- Initial balance: 1000 USDT
- Password minimum: 6 characters
- Email phải unique
- Balance không thể âm
- Hash password với bcrypt (10 rounds)

---

#### 3.2.3. Market Service (Port 3002)

**Mục đích:** Cung cấp dữ liệu giá crypto real-time

**Chức năng chính:**

- **Price Fetching:** Lấy giá từ CoinGecko API
- **Chart Data:** Historical price data (7/14/30 ngày)
- **Caching:** Cache 2 phút để tránh rate limit
- **Fallback Provider:** CoinPaprika khi CoinGecko down
- **Pre-warming:** Cache popular coins khi start

**Supported Coins:**

- Bitcoin (BTC)
- Ethereum (ETH)
- Binance Coin (BNB)
- Solana (SOL)
- Ripple (XRP)
- Cardano (ADA)
- Dogecoin (DOGE)
- Polkadot (DOT)

**External APIs:**

- Primary: CoinGecko (https://api.coingecko.com/api/v3)
- Fallback: CoinPaprika (https://api.coinpaprika.com/v1)

**API Endpoints:**

- `GET /prices` - Giá tất cả coins được hỗ trợ
- `GET /price/:coinId` - Giá 1 coin cụ thể
- `GET /chart/:coinId?days=7` - Historical chart data
- `GET /health` - Health check

**Cache Strategy:**

- TTL: 120 seconds (2 minutes)
- Key pattern: `current_prices`, `price_{coinId}`, `chart_{coinId}_{days}`
- Pre-warm: All prices + top 4 coins chart on startup

**Response Format:**

```javascript
{
  symbol: "BTC",
  coinId: "bitcoin",
  name: "Bitcoin",
  price: 43250.50,
  change24h: 2.5,
  volume24h: 25000000000,
  marketCap: 850000000000,
  lastUpdated: "2025-12-11T10:30:00Z"
}
```

---

#### 3.2.4. Portfolio Service (Port 3003)

**Mục đích:** Quản lý danh mục đầu tư của người dùng

**Chức năng chính:**

- **Holdings Management:** CRUD cho coin holdings
- **Value Calculation:** Tính giá trị portfolio với current prices
- **Profit/Loss Tracking:** Tính lãi/lỗ dựa trên average buy price
- **Atomic Operations:** Đảm bảo consistency khi update

**Database:** MongoDB - Collection `portfolios`

**Schema:**

```javascript
{
  userId: ObjectId (ref: User, unique),
  holdings: [{
    symbol: String (uppercase),
    coinId: String (lowercase),
    name: String,
    amount: Number,
    averageBuyPrice: Number,
    totalInvested: Number,
    lastUpdated: Date
  }],
  totalValue: Number,
  totalInvested: Number,
  totalProfit: Number,
  profitPercentage: Number,
  lastCalculated: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**API Endpoints:**

- `GET /` - Lấy portfolio của user (auth required)
- `POST /holding` - Thêm holding mới (internal)
- `PUT /holding` - Giảm holding (internal)
- `PUT /value` - Update portfolio value (internal)

**Business Rules:**

- Mỗi user chỉ có 1 portfolio
- Auto-create portfolio khi user đầu tiên trade
- Average buy price = (old_invested + new_invested) / total_amount
- Atomic update với MongoDB findOneAndUpdate

**Calculation Logic:**

```
Current Value = Σ(holding.amount × currentPrice)
Total Invested = Σ(holding.totalInvested)
Total Profit = Current Value - Total Invested
Profit % = (Total Profit / Total Invested) × 100
```

---

#### 3.2.5. Trade Service (Port 3004)

**Mục đích:** Ghi lại lịch sử giao dịch

**Chức năng chính:**

- **Trade Recording:** Lưu mọi giao dịch mua/bán
- **History Tracking:** Xem lịch sử với pagination
- **Statistics:** Tính toán thống kê giao dịch
- **Fee Calculation:** Tracking phí giao dịch

**Database:** MongoDB - Collection `trades`

**Schema:**

```javascript
{
  userId: ObjectId (ref: User),
  type: Enum ['buy', 'sell'],
  symbol: String (uppercase),
  coinId: String (lowercase),
  coinName: String,
  amount: Number,
  price: Number,
  totalCost: Number,
  fee: Number,
  feePercentage: Number (0.1%),
  status: Enum ['pending', 'completed', 'failed', 'cancelled'],
  balanceBefore: Number,
  balanceAfter: Number,
  notes: String,
  errorMessage: String,
  executedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**API Endpoints:**

- `POST /` - Tạo trade record (internal)
- `GET /history` - Lịch sử giao dịch với pagination
- `GET /stats` - Thống kê giao dịch
- `GET /:id` - Chi tiết 1 giao dịch

**Query Parameters:**

- `page` - Trang hiện tại (default: 1)
- `limit` - Số records/trang (default: 20)
- `type` - Filter by buy/sell
- `symbol` - Filter by coin

**Statistics Metrics:**

- Total trades count
- Buy/Sell trades count
- Total buy value
- Total sell value
- Total fees paid
- Net value (sell - buy)

**Trading Fee:**

- Fee: 0.1% of total cost
- Applied to both buy and sell
- Fee deducted từ USDT balance

---

#### 3.2.6. Notification Service (Port 3005)

**Mục đích:** Quản lý thông báo và cảnh báo giá

**Chức năng chính:**

- **Notification Management:** CRUD notifications
- **Price Alerts:** Tạo và kiểm tra price alerts
- **Real-time Delivery:** Gửi qua WebSocket
- **Email Notifications:** Optional email delivery
- **Cron Jobs:** Auto-check alerts mỗi phút

**Database:** MongoDB - 2 Collections

**Schema 1: `notifications`**

```javascript
{
  userId: ObjectId (ref: User),
  type: Enum ['trade', 'price_alert', 'system', 'warning'],
  title: String,
  message: String,
  data: Mixed (JSON),
  status: Enum ['unread', 'read', 'archived'],
  priority: Enum ['low', 'medium', 'high', 'urgent'],
  channel: Enum ['app', 'email', 'both'],
  sentAt: Date,
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Schema 2: `pricealerts`**

```javascript
{
  userId: ObjectId (ref: User),
  symbol: String (uppercase),
  coinId: String (lowercase),
  targetPrice: Number,
  condition: Enum ['above', 'below'],
  isActive: Boolean,
  triggered: Boolean,
  triggeredAt: Date,
  lastChecked: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**API Endpoints:**

- `GET /` - Danh sách notifications
- `GET /unread-count` - Số thông báo chưa đọc
- `PUT /:id/read` - Đánh dấu đã đọc
- `PUT /read-all` - Đánh dấu tất cả đã đọc
- `DELETE /:id` - Xóa notification
- `POST /send` - Gửi notification (internal)
- `GET /alerts` - Danh sách price alerts
- `POST /alerts` - Tạo price alert mới
- `DELETE /alerts/:id` - Xóa price alert

**Cron Jobs:**

1. **Price Alert Checker:** Mỗi phút (_/1 _ \* \* \*)

   - Lấy tất cả active alerts
   - Fetch current prices từ Market Service
   - So sánh với target price
   - Trigger alert nếu điều kiện thỏa mãn
   - Gửi notification + WebSocket event

2. **Cleanup Old Notifications:** Mỗi ngày (0 0 \* \* \*)
   - Xóa notifications > 30 ngày và đã đọc

**Delivery Channels:**

- **App:** WebSocket real-time (Socket.IO)
- **Email:** Nodemailer (optional, requires SMTP config)

---

### 3.3. Biểu đồ luồng dữ liệu (theo chức năng)

#### 3.3.1. Data Flow Diagram - Level 0 (Context Diagram)

```
[Chèn DFD Level 0 ở đây]
- External Entities: User, Admin, CoinGecko API, CoinPaprika API
- System: CryptoTrading SOA
- Data flows: User requests, Market data, Notifications
```

#### 3.3.2. Data Flow Diagram - Level 1

```
[Chèn DFD Level 1 ở đây]
- Processes:
  1.0 Authentication
  2.0 Market Data Management
  3.0 Trading Management
  4.0 Portfolio Management
  5.0 Notification Management
- Data stores: Users DB, Portfolios DB, Trades DB, Notifications DB
```

#### 3.3.3. Data Flow Diagram - Level 2 (Buy Coin Process)

```
[Chèn DFD Level 2 cho Buy Coin ở đây]
- Chi tiết orchestration flow:
  2.1 Get Price
  2.2 Validate Balance
  2.3 Deduct Balance
  2.4 Add Holding
  2.5 Record Trade
  2.6 Send Notification
```

#### 3.3.4. Sequence Diagram - Buy Coin Transaction

```
[Chèn Sequence Diagram cho Buy Coin ở đây]
- Actors: Client, API Gateway, User Service, Market Service, Portfolio Service, Trade Service, Notification Service
- Messages: HTTP requests/responses, WebSocket events
```

#### 3.3.5. Sequence Diagram - Price Alert Checking

```
[Chèn Sequence Diagram cho Price Alert ở đây]
- Actors: Cron Job, Notification Service, Market Service, WebSocket
- Flow: Check alerts → Fetch prices → Compare → Trigger → Notify
```

---

## 4. PHÂN TÍCH VÀ THIẾT KẾ DỮ LIỆU CỦA HỆ THỐNG

### 4.1. Mô hình thực thể liên kết (ERD)

#### 4.1.1. ERD - User Service

```
[Chèn ERD cho User Service ở đây]
- Entity: User
- Attributes: _id, email, password, fullName, role, balance, isActive, balanceHistory, createdAt, updatedAt
```

#### 4.1.2. ERD - Portfolio Service

```
[Chèn ERD cho Portfolio Service ở đây]
- Entity: Portfolio
- Relationship: User (1) --- (1) Portfolio
- Nested: Holdings array
```

#### 4.1.3. ERD - Trade Service

```
[Chèn ERD cho Trade Service ở đây]
- Entity: Trade
- Relationship: User (1) --- (N) Trade
```

#### 4.1.4. ERD - Notification Service

```
[Chèn ERD cho Notification Service ở đây]
- Entities: Notification, PriceAlert
- Relationships:
  - User (1) --- (N) Notification
  - User (1) --- (N) PriceAlert
```

#### 4.1.5. ERD - Tổng quan toàn hệ thống

```
[Chèn ERD tổng quan ở đây]
- Quan hệ giữa các entities:
  - User (1) --- (1) Portfolio
  - User (1) --- (N) Trade
  - User (1) --- (N) Notification
  - User (1) --- (N) PriceAlert
```

### 4.2. Mô hình quan hệ (Relational Schema)

**Lưu ý:** Hệ thống sử dụng MongoDB (NoSQL) nên không có mô hình quan hệ truyền thống. Dưới đây là normalized schema nếu áp dụng relational database.

#### 4.2.1. User Service Tables

**Table: users**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  balance DECIMAL(18, 2) DEFAULT 1000.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

**Table: balance_history**

```sql
CREATE TABLE balance_history (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(18, 2) NOT NULL,
  type ENUM('deposit', 'withdraw', 'trade', 'initial', 'admin'),
  description VARCHAR(500),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_timestamp (user_id, timestamp DESC)
);
```

#### 4.2.2. Portfolio Service Tables

**Table: portfolios**

```sql
CREATE TABLE portfolios (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  total_value DECIMAL(18, 2) DEFAULT 0,
  total_invested DECIMAL(18, 2) DEFAULT 0,
  total_profit DECIMAL(18, 2) DEFAULT 0,
  profit_percentage DECIMAL(10, 2) DEFAULT 0,
  last_calculated TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Table: holdings**

```sql
CREATE TABLE holdings (
  id UUID PRIMARY KEY,
  portfolio_id UUID NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  coin_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  average_buy_price DECIMAL(18, 2) NOT NULL,
  total_invested DECIMAL(18, 2) NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  INDEX idx_portfolio_symbol (portfolio_id, symbol)
);
```

#### 4.2.3. Trade Service Tables

**Table: trades**

```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  type ENUM('buy', 'sell') NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  coin_id VARCHAR(50) NOT NULL,
  coin_name VARCHAR(100) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  price DECIMAL(18, 2) NOT NULL,
  total_cost DECIMAL(18, 2) NOT NULL,
  fee DECIMAL(18, 2) DEFAULT 0,
  fee_percentage DECIMAL(5, 2) DEFAULT 0.1,
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
  balance_before DECIMAL(18, 2) NOT NULL,
  balance_after DECIMAL(18, 2) NOT NULL,
  notes TEXT,
  error_message TEXT,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at DESC),
  INDEX idx_type (type),
  INDEX idx_symbol (symbol)
);
```

#### 4.2.4. Notification Service Tables

**Table: notifications**

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  type ENUM('trade', 'price_alert', 'system', 'warning') NOT NULL,
  title VARCHAR(200) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  data JSON,
  status ENUM('unread', 'read', 'archived') DEFAULT 'unread',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  channel ENUM('app', 'email', 'both') DEFAULT 'app',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at DESC),
  INDEX idx_status (status),
  INDEX idx_type (type)
);
```

**Table: price_alerts**

```sql
CREATE TABLE price_alerts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  coin_id VARCHAR(50) NOT NULL,
  target_price DECIMAL(18, 2) NOT NULL,
  condition ENUM('above', 'below') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  triggered BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMP NULL,
  last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_active (user_id, is_active),
  INDEX idx_symbol_active (symbol, is_active)
);
```

### 4.3. Bảng dữ liệu (Data Dictionary)

#### 4.3.1. Collection: users

| Field          | Type     | Required | Default | Description            | Constraints                    |
| -------------- | -------- | -------- | ------- | ---------------------- | ------------------------------ |
| \_id           | ObjectId | Yes      | Auto    | Primary key            | Unique                         |
| email          | String   | Yes      | -       | Email đăng nhập        | Unique, lowercase, valid email |
| password       | String   | Yes      | -       | Password đã hash       | Min 6 chars, bcrypt hash       |
| fullName       | String   | Yes      | -       | Họ tên đầy đủ          | Trim whitespace                |
| role           | String   | Yes      | 'user'  | Vai trò người dùng     | Enum: 'user', 'admin'          |
| balance        | Number   | Yes      | 1000    | Số dư USDT             | Min: 0                         |
| isActive       | Boolean  | Yes      | true    | Trạng thái tài khoản   | Admin có thể toggle            |
| balanceHistory | Array    | No       | []      | Lịch sử thay đổi số dư | Embedded array                 |
| createdAt      | Date     | Yes      | Auto    | Ngày tạo               | Timestamp                      |
| updatedAt      | Date     | Yes      | Auto    | Ngày cập nhật          | Timestamp                      |

**Indexes:**

- `email` (unique)
- `role`

#### 4.3.2. Collection: portfolios

| Field            | Type     | Required | Default | Description             | Constraints         |
| ---------------- | -------- | -------- | ------- | ----------------------- | ------------------- |
| \_id             | ObjectId | Yes      | Auto    | Primary key             | Unique              |
| userId           | ObjectId | Yes      | -       | Reference to User       | Ref: 'User', unique |
| holdings         | Array    | No       | []      | Danh sách coin holdings | Embedded array      |
| totalValue       | Number   | No       | 0       | Tổng giá trị hiện tại   | Calculated          |
| totalInvested    | Number   | No       | 0       | Tổng tiền đã đầu tư     | Calculated          |
| totalProfit      | Number   | No       | 0       | Lãi/lỗ tổng             | Calculated          |
| profitPercentage | Number   | No       | 0       | % lãi/lỗ                | Calculated          |
| lastCalculated   | Date     | No       | Now     | Lần tính gần nhất       | Timestamp           |
| createdAt        | Date     | Yes      | Auto    | Ngày tạo                | Timestamp           |
| updatedAt        | Date     | Yes      | Auto    | Ngày cập nhật           | Timestamp           |

**holdings (embedded):**

| Field           | Type   | Required | Description                    |
| --------------- | ------ | -------- | ------------------------------ |
| symbol          | String | Yes      | Ký hiệu coin (BTC, ETH...)     |
| coinId          | String | Yes      | ID coin (bitcoin, ethereum...) |
| name            | String | Yes      | Tên coin                       |
| amount          | Number | Yes      | Số lượng coin sở hữu           |
| averageBuyPrice | Number | Yes      | Giá mua trung bình             |
| totalInvested   | Number | Yes      | Tổng tiền đã bỏ ra             |
| lastUpdated     | Date   | Yes      | Lần cập nhật gần nhất          |

**Indexes:**

- `userId` (unique)
- `holdings.symbol`

#### 4.3.3. Collection: trades

| Field         | Type     | Required | Default     | Description                 | Constraints                                         |
| ------------- | -------- | -------- | ----------- | --------------------------- | --------------------------------------------------- |
| \_id          | ObjectId | Yes      | Auto        | Primary key                 | Unique                                              |
| userId        | ObjectId | Yes      | -           | Reference to User           | Ref: 'User'                                         |
| type          | String   | Yes      | -           | Loại giao dịch              | Enum: 'buy', 'sell'                                 |
| symbol        | String   | Yes      | -           | Ký hiệu coin                | Uppercase                                           |
| coinId        | String   | Yes      | -           | ID coin                     | Lowercase                                           |
| coinName      | String   | Yes      | -           | Tên coin                    | -                                                   |
| amount        | Number   | Yes      | -           | Số lượng                    | Min: 0                                              |
| price         | Number   | Yes      | -           | Giá tại thời điểm giao dịch | Min: 0                                              |
| totalCost     | Number   | Yes      | -           | Tổng giá trị giao dịch      | Calculated                                          |
| fee           | Number   | Yes      | 0           | Phí giao dịch               | 0.1% of totalCost                                   |
| feePercentage | Number   | Yes      | 0.1         | % phí                       | Default: 0.1                                        |
| status        | String   | Yes      | 'completed' | Trạng thái                  | Enum: 'pending', 'completed', 'failed', 'cancelled' |
| balanceBefore | Number   | Yes      | -           | Balance trước giao dịch     | -                                                   |
| balanceAfter  | Number   | Yes      | -           | Balance sau giao dịch       | -                                                   |
| notes         | String   | No       | -           | Ghi chú                     | Max: 500 chars                                      |
| errorMessage  | String   | No       | -           | Thông báo lỗi (nếu có)      | -                                                   |
| executedAt    | Date     | Yes      | Now         | Thời điểm thực hiện         | Timestamp                                           |
| createdAt     | Date     | Yes      | Auto        | Ngày tạo                    | Timestamp                                           |
| updatedAt     | Date     | Yes      | Auto        | Ngày cập nhật               | Timestamp                                           |

**Indexes:**

- `userId, createdAt` (compound, descending)
- `type`
- `symbol`
- `status`

#### 4.3.4. Collection: notifications

| Field     | Type     | Required | Default  | Description       | Constraints                                       |
| --------- | -------- | -------- | -------- | ----------------- | ------------------------------------------------- |
| \_id      | ObjectId | Yes      | Auto     | Primary key       | Unique                                            |
| userId    | ObjectId | Yes      | -        | Reference to User | Ref: 'User'                                       |
| type      | String   | Yes      | -        | Loại thông báo    | Enum: 'trade', 'price_alert', 'system', 'warning' |
| title     | String   | Yes      | -        | Tiêu đề           | Max: 200 chars                                    |
| message   | String   | Yes      | -        | Nội dung          | Max: 1000 chars                                   |
| data      | Mixed    | No       | {}       | Metadata JSON     | Any structure                                     |
| status    | String   | Yes      | 'unread' | Trạng thái đọc    | Enum: 'unread', 'read', 'archived'                |
| priority  | String   | Yes      | 'medium' | Mức độ ưu tiên    | Enum: 'low', 'medium', 'high', 'urgent'           |
| channel   | String   | Yes      | 'app'    | Kênh gửi          | Enum: 'app', 'email', 'both'                      |
| sentAt    | Date     | Yes      | Now      | Thời điểm gửi     | Timestamp                                         |
| readAt    | Date     | No       | null     | Thời điểm đọc     | Timestamp                                         |
| createdAt | Date     | Yes      | Auto     | Ngày tạo          | Timestamp                                         |
| updatedAt | Date     | Yes      | Auto     | Ngày cập nhật     | Timestamp                                         |

**Indexes:**

- `userId, createdAt` (compound, descending)
- `status`
- `type`

#### 4.3.5. Collection: pricealerts

| Field       | Type     | Required | Default | Description         | Constraints            |
| ----------- | -------- | -------- | ------- | ------------------- | ---------------------- |
| \_id        | ObjectId | Yes      | Auto    | Primary key         | Unique                 |
| userId      | ObjectId | Yes      | -       | Reference to User   | Ref: 'User'            |
| symbol      | String   | Yes      | -       | Ký hiệu coin        | Uppercase              |
| coinId      | String   | Yes      | -       | ID coin             | Lowercase              |
| targetPrice | Number   | Yes      | -       | Giá mục tiêu        | Min: 0                 |
| condition   | String   | Yes      | -       | Điều kiện trigger   | Enum: 'above', 'below' |
| isActive    | Boolean  | Yes      | true    | Còn hoạt động không | -                      |
| triggered   | Boolean  | Yes      | false   | Đã trigger chưa     | -                      |
| triggeredAt | Date     | No       | null    | Thời điểm trigger   | Timestamp              |
| lastChecked | Date     | Yes      | Now     | Lần check gần nhất  | Timestamp              |
| createdAt   | Date     | Yes      | Auto    | Ngày tạo            | Timestamp              |
| updatedAt   | Date     | Yes      | Auto    | Ngày cập nhật       | Timestamp              |

**Indexes:**

- `userId, isActive` (compound)
- `symbol, isActive` (compound)

---

## 5. GIAO DIỆN CỦA HỆ THỐNG

### 5.1. Xây dựng giao diện API cho từng dịch vụ

#### 5.1.1. API Gateway Endpoints

**Base URL:** `http://localhost:3000/api`

**Authentication:** JWT Bearer Token (except /register, /login, /market/\*)

##### Health & Info

| Method | Endpoint                   | Description                      | Auth |
| ------ | -------------------------- | -------------------------------- | ---- |
| GET    | `/health`                  | Gateway health check             | No   |
| GET    | `/`                        | Welcome message + endpoints list | No   |
| GET    | `/health/circuit-breakers` | Circuit breaker status           | Yes  |

##### User & Authentication

| Method | Endpoint                     | Description       | Auth | Rate Limit |
| ------ | ---------------------------- | ----------------- | ---- | ---------- |
| POST   | `/api/users/register`        | Đăng ký tài khoản | No   | 3/60min    |
| POST   | `/api/users/login`           | Đăng nhập         | No   | 5/15min    |
| GET    | `/api/users/profile`         | Xem profile       | Yes  | -          |
| PUT    | `/api/users/profile`         | Cập nhật profile  | Yes  | -          |
| GET    | `/api/users/balance`         | Xem số dư         | Yes  | -          |

##### Admin

| Method | Endpoint                                   | Description        | Auth | Role  |
| ------ | ------------------------------------------ | ------------------ | ---- | ----- |
| GET    | `/api/users/admin/users`                   | Danh sách users    | Yes  | Admin |
| PUT    | `/api/users/admin/users/:id/toggle`        | Khóa/mở tài khoản  | Yes  | Admin |
| PUT    | `/api/users/admin/users/:id/reset-balance` | Reset về 1000 USDT | Yes  | Admin |

##### Market Data

| Method | Endpoint                           | Description      | Auth     |
| ------ | ---------------------------------- | ---------------- | -------- |
| GET    | `/api/market/prices`               | Giá tất cả coins | Optional |
| GET    | `/api/market/price/:coinId`        | Giá 1 coin       | Optional |
| GET    | `/api/market/chart/:coinId?days=7` | Biểu đồ giá      | Optional |

##### Trading (Orchestrated)

| Method | Endpoint          | Description | Auth | Min Amount |
| ------ | ----------------- | ----------- | ---- | ---------- |
| POST   | `/api/trade/buy`  | Mua coin    | Yes  | $5 USD     |
| POST   | `/api/trade/sell` | Bán coin    | Yes  | -          |

**Request Body - Buy:**

```json
{
  "symbol": "BTC",
  "coinId": "bitcoin",
  "amount": 0.001
}
```

**Request Body - Sell:**

```json
{
  "symbol": "BTC",
  "amount": 0.0005
}
```

##### Trade History

| Method | Endpoint             | Description          | Auth | Query Params              |
| ------ | -------------------- | -------------------- | ---- | ------------------------- |
| GET    | `/api/trade/history` | Lịch sử giao dịch    | Yes  | page, limit, type, symbol |

##### Portfolio (Orchestrated)

| Method | Endpoint         | Description                | Auth |
| ------ | ---------------- | -------------------------- | ---- |
| GET    | `/api/portfolio` | Portfolio với giá hiện tại | Yes  |

**Response Format:**

```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "holdings": [
      {
        "symbol": "BTC",
        "coinId": "bitcoin",
        "name": "Bitcoin",
        "amount": 0.001,
        "averageBuyPrice": 43000,
        "totalInvested": 43,
        "currentPrice": 43250.5,
        "currentValue": 43.25,
        "profit": 0.25,
        "profitPercentage": 0.58
      }
    ],
    "totalValue": 43.25,
    "totalInvested": 43,
    "totalProfit": 0.25,
    "profitPercentage": 0.58,
    "lastCalculated": "2025-12-11T10:30:00Z"
  }
}
```

##### Notifications

| Method | Endpoint                          | Description         | Auth | Query Params              |
| ------ | --------------------------------- | ------------------- | ---- | ------------------------- |
| GET    | `/api/notifications`              | Danh sách thông báo | Yes  | page, limit, status, type |
| GET    | `/api/notifications/unread-count` | Số chưa đọc         | Yes  | -                         |
| PUT    | `/api/notifications/:id/read`     | Đánh dấu đã đọc     | Yes  | -                         |
| PUT    | `/api/notifications/read-all`     | Đọc tất cả          | Yes  | -                         |
| DELETE | `/api/notifications/:id`          | Xóa thông báo       | Yes  | -                         |

##### Price Alerts

| Method | Endpoint                        | Description      | Auth |
| ------ | ------------------------------- | ---------------- | ---- |
| GET    | `/api/notifications/alerts`     | Danh sách alerts | Yes  |
| POST   | `/api/notifications/alerts`     | Tạo alert mới    | Yes  |
| DELETE | `/api/notifications/alerts/:id` | Xóa alert        | Yes  |

**Request Body - Create Alert:**

```json
{
  "symbol": "BTC",
  "coinId": "bitcoin",
  "targetPrice": 45000,
  "condition": "above"
}
```

#### 5.1.2. WebSocket Events (Socket.IO)

**Connection:**

```javascript
const socket = io("http://localhost:3000", {
  auth: { token: "jwt_token_here" },
});
```

**Client → Server Events:**

- `connect` - Kết nối thành công
- `disconnect` - Ngắt kết nối

**Server → Client Events:**

| Event                | Data                | Description              |
| -------------------- | ------------------- | ------------------------ |
| `notification`       | Notification object | Thông báo mới            |
| `price_alert`        | Alert object        | Cảnh báo giá triggered   |
| `trade_confirmation` | Trade object        | Xác nhận giao dịch       |
| `price_update`       | Array of prices     | Cập nhật giá (broadcast) |

**Example - Notification Event:**

```javascript
socket.on("notification", (data) => {
  console.log(data);
  // {
  //   type: 'trade',
  //   title: 'Buy Order Completed',
  //   message: 'Successfully bought 0.001 BTC',
  //   priority: 'high',
  //   timestamp: '2025-12-11T10:30:00Z'
  // }
});
```

#### 5.1.3. Error Response Format

**Standard Error Response:**

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Detailed error (development only)"
}
```

**HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `503` - Service Unavailable (circuit breaker open)

#### 5.1.4. API Documentation (Swagger/OpenAPI)

```
[Tham khảo file API_DOCUMENTATION.md trong source code để xem chi tiết đầy đủ]
```

### 5.2. Xây dựng giao diện người dùng (Web)

**Technology Stack:**

- React 19 (UI library)
- Vite (Build tool)
- TailwindCSS (Styling)
- Recharts (Charts)
- Socket.IO Client (Real-time)
- Axios (HTTP client)

#### 5.2.1. Sơ đồ cấu trúc giao diện

```
[Chèn Sitemap/Navigation diagram ở đây]

App Structure:
├── Auth Pages
│   ├── Login
│   └── Register
├── Main Layout (Authenticated)
│   ├── Navbar (top)
│   ├── Sidebar (left)
│   └── Content Area
│       ├── Dashboard
│       ├── Trade
│       ├── Portfolio
│       ├── History
│       ├── Notifications
│       ├── Settings
│       └── Admin (admin only)
```

#### 5.2.2. Wireframes các trang chính

##### Trang Login

```
[Chèn wireframe Login page ở đây]
- Email input
- Password input
- Login button
- Register link
```

##### Trang Dashboard

```
[Chèn wireframe Dashboard ở đây]
- Balance card
- Portfolio summary
- Top coins list
- Recent trades
- Quick trade widget
```

##### Trang Trade

```
[Chèn wireframe Trade page ở đây]
- Coin selector
- Price chart (7/14/30 days)
- Buy/Sell tabs
- Amount input
- Fee calculation
- Balance display
- Confirm button
```

##### Trang Portfolio

```
[Chèn wireframe Portfolio page ở đây]
- Total value card
- Profit/Loss summary
- Holdings table:
  - Coin | Amount | Avg Buy | Current Price | Value | Profit | Action
- Pie chart (holdings distribution)
```

##### Trang History

```
[Chèn wireframe History page ở đây]
- Filter options (type, coin, date range)
- Trades table:
  - Date | Type | Coin | Amount | Price | Total | Fee | Status
- Pagination
- Export button
```

##### Trang Notifications

```
[Chèn wireframe Notifications page ở đây]
- Unread count badge
- Filter by type
- Notification list:
  - Icon | Title | Message | Time | Read status
- Mark all as read button
- Price alerts section
```

##### Trang Admin

```
[Chèn wireframe Admin page ở đây]
- Statistics cards
- Users table:
  - ID | Email | Name | Balance | Role | Active | Actions
- Actions: Toggle active, Reset balance
- Search and filter
```

#### 5.2.3. UI Components Library

**Shared Components:**

- `Navbar` - Top navigation bar
- `Sidebar` - Left sidebar menu
- `Layout` - Main layout wrapper
- `Toast` - Notification toast
- `Modal` - Reusable modal dialog
- `Button` - Styled buttons
- `Input` - Form inputs
- `Table` - Data table
- `Chart` - Recharts wrapper
- `Loader` - Loading spinner
- `ErrorBoundary` - Error handling

#### 5.2.4. Responsive Design

**Breakpoints (TailwindCSS):**

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Mobile Behavior:**

- Sidebar collapses to hamburger menu
- Tables scroll horizontally
- Cards stack vertically
- Font sizes scale down

#### 5.2.5. Screenshots giao diện

```
[Chèn screenshots các trang chính ở đây]
1. Login page
2. Dashboard
3. Trade page with chart
4. Portfolio overview
5. History with filters
6. Notifications panel
7. Admin user management
8. Mobile responsive views
```

#### 5.2.6. Color Scheme & Branding

**Colors:**

- Primary: `#3B82F6` (Blue)
- Success: `#10B981` (Green)
- Danger: `#EF4444` (Red)
- Warning: `#F59E0B` (Yellow)
- Dark: `#1F2937`
- Light: `#F9FAFB`

**Typography:**

- Font Family: Inter, system-ui, sans-serif
- Headings: Bold, larger sizes
- Body: Regular, 16px base

#### 5.2.7. User Flows

##### Flow 1: Đăng ký và mua coin đầu tiên

```
[Chèn user flow diagram ở đây]
1. Truy cập trang chủ
2. Click "Đăng ký"
3. Nhập thông tin
4. Nhận 1000 USDT
5. Vào trang Trade
6. Chọn coin (BTC)
7. Nhập số lượng
8. Xác nhận mua
9. Nhận thông báo thành công
10. Xem trong Portfolio
```

##### Flow 2: Tạo price alert

```
[Chèn user flow diagram ở đây]
1. Vào trang Notifications
2. Tab "Price Alerts"
3. Click "Create Alert"
4. Chọn coin
5. Nhập target price
6. Chọn condition (above/below)
7. Save
8. Đợi alert trigger
9. Nhận notification real-time
```

---

## 6. KẾT LUẬN

### 6.1. Tổng kết công việc đã thực hiện

Dự án **CryptoTrading SOA** đã hoàn thành xây dựng một hệ thống giao dịch tiền điện tử ảo đầy đủ với các thành tựu chính:

**1. Kiến trúc hệ thống:**

- Thiết kế và triển khai kiến trúc SOA với 6 microservices độc lập
- Áp dụng API Gateway pattern để tập trung hóa routing và authentication
- Sử dụng Service Discovery (Consul) cho dynamic service location
- Implement Circuit Breaker pattern để tăng reliability

**2. Chức năng nghiệp vụ:**

- Hoàn thiện 15+ chức năng chính cho user
- Xây dựng admin panel với 4 chức năng quản trị
- Tích hợp dữ liệu thị trường real-time từ CoinGecko và CoinPaprika
- Thực hiện orchestration logic phức tạp cho buy/sell operations với rollback mechanism

**3. Cơ sở dữ liệu:**

- Thiết kế 5 MongoDB collections với schemas tối ưu
- Áp dụng indexes để tăng performance
- Đảm bảo data consistency với atomic operations

**4. Giao diện người dùng:**

- Xây dựng React SPA với 7 trang chính
- Responsive design cho mobile/tablet/desktop
- Real-time updates với WebSocket
- UX/UI thân thiện và trực quan

**5. Tính năng kỹ thuật:**

- JWT authentication với 7-day expiry
- Rate limiting: Global, login, register
- Caching: 2-minute TTL cho market data
- Logging tập trung với Winston
- WebSocket notifications real-time
- Cron jobs cho price alert checking

### 6.2. Ưu điểm của hệ thống

**Về kiến trúc:**
✅ **Loose Coupling:** Services độc lập, dễ phát triển/bảo trì riêng lẻ
✅ **Scalability:** Có thể scale từng service theo nhu cầu
✅ **Resilience:** Circuit Breaker ngăn cascading failures
✅ **Flexibility:** Dễ thêm/thay đổi/xóa services

**Về tính năng:**
✅ **Real-time:** WebSocket cho notifications và price updates
✅ **User-friendly:** Giao diện đơn giản, dễ sử dụng
✅ **Safe Learning:** Môi trường thực hành không rủi ro
✅ **Complete Features:** Đầy đủ tính năng của một trading platform

**Về bảo mật:**
✅ **Strong Authentication:** JWT với expiry
✅ **Password Security:** Bcrypt hashing
✅ **Rate Limiting:** Chống brute-force
✅ **Input Validation:** Joi schemas
✅ **CORS Protection:** Whitelist origins

**Về hiệu năng:**
✅ **Caching:** Giảm external API calls
✅ **Database Indexes:** Tăng query speed
✅ **Pre-warming:** Cache popular data on startup
✅ **Pagination:** Giảm payload size

### 6.3. Hạn chế và hướng phát triển

#### Hạn chế hiện tại:

**1. Scalability:**

- Chưa có load balancer cho multiple instances
- MongoDB chưa setup replication/sharding
- WebSocket chưa hỗ trợ Redis adapter cho multi-server

**2. Monitoring:**

- Thiếu centralized logging (ELK stack)
- Chưa có metrics collection (Prometheus)
- Chưa có distributed tracing (Jaeger)
- Thiếu alerting system

**3. Testing:**

- Chưa có unit tests
- Chưa có integration tests
- Chưa có E2E tests
- Chưa có performance testing

**4. DevOps:**

- Chưa containerize (Docker)
- Chưa có CI/CD pipeline
- Chưa có automated deployment
- Chưa setup staging environment

**5. Features:**

- Chưa hỗ trợ nhiều currency (chỉ có USDT)
- Chưa có stop-loss/take-profit orders
- Chưa có trading bots
- Chưa có social features (copy trading, leaderboard)
- Chưa có email verification

#### Hướng phát triển tương lai:

**Phase 1 - Nâng cao chất lượng (1-2 tháng):**

- [ ] Viết unit tests (coverage > 80%)
- [ ] Setup CI/CD với GitHub Actions
- [ ] Containerize với Docker + Docker Compose
- [ ] Implement centralized logging (ELK)
- [ ] Add metrics với Prometheus + Grafana

**Phase 2 - Scalability (2-3 tháng):**

- [ ] Setup MongoDB replica set
- [ ] Add Redis cho caching layer
- [ ] Implement API Gateway clustering
- [ ] WebSocket với Redis adapter
- [ ] Setup Nginx load balancer
- [ ] Kubernetes deployment

**Phase 3 - Tính năng mới (3-4 tháng):**

- [ ] Advanced order types (limit, stop-loss)
- [ ] Multiple fiat currencies support
- [ ] Trading view charts (TradingView library)
- [ ] Price prediction với ML
- [ ] Social trading features
- [ ] Mobile app (React Native)

**Phase 4 - Production Ready (1-2 tháng):**

- [ ] Security audit
- [ ] Performance optimization
- [ ] Load testing (JMeter)
- [ ] Documentation hoàn chỉnh
- [ ] Disaster recovery plan
- [ ] SLA monitoring

### 6.4. Kết luận

Dự án **CryptoTrading SOA** đã đạt được mục tiêu ban đầu là xây dựng một nền tảng giao dịch crypto ảo hoàn chỉnh với kiến trúc SOA. Hệ thống không chỉ đáp ứng đầy đủ các yêu cầu chức năng mà còn áp dụng nhiều best practices trong software architecture như Circuit Breaker, Service Discovery, API Gateway, và Real-time Communication.

Thông qua việc phát triển dự án này, nhóm đã:

- Hiểu sâu về kiến trúc SOA và microservices
- Thực hành orchestration và inter-service communication
- Áp dụng design patterns trong real-world scenario
- Học cách xử lý distributed system challenges
- Nâng cao kỹ năng full-stack development

Hệ thống đã sẵn sàng để sử dụng trong môi trường development và có thể mở rộng lên production với một số cải tiến về infrastructure và DevOps.

---

## PHỤ LỤC

### A. Tài liệu tham khảo

1. **API Documentation:** `API_DOCUMENTATION.md`
2. **Database Schema:** `DATABASE_SCHEMA.md`
3. **Circuit Breaker Guide:** `CIRCUIT_BREAKER_GUIDE.md`
4. **React Guide:** `REACT_GUIDE.md`
5. **Tailwind Guide:** `TAILWIND_GUIDE.md`
6. **Learning Guide:** `LEARNING_GUIDE.md`
7. **Team Assignment:** `TEAM_ASSIGNMENT.md`

### B. External Resources

1. **CoinGecko API:** https://www.coingecko.com/en/api/documentation
2. **CoinPaprika API:** https://api.coinpaprika.com/
3. **Consul Documentation:** https://www.consul.io/docs
4. **Opossum (Circuit Breaker):** https://nodeshift.dev/opossum/
5. **Socket.IO:** https://socket.io/docs/

### C. Repository & Demo

- **GitHub Repository:** https://github.com/doanthetin193/CryptoTradingSOA
- **Demo Video:** [Link to demo video]
- **Live Demo:** [Link to deployed app]

### D. Team Members & Contributions

```
[Chèn bảng phân công công việc ở đây]
Tham khảo file TEAM_ASSIGNMENT.md
```

---

**Ngày hoàn thành:** 11/12/2025  
**Version:** 1.0.0  
**Tác giả:** [Tên nhóm/Sinh viên]
