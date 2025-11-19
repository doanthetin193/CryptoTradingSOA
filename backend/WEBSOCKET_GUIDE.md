# WebSocket & Email Integration Guide

## 🔌 WebSocket Real-time Notifications

### Overview
Hệ thống đã được tích hợp Socket.IO để gửi notifications real-time cho users.

### Features
1. **Trade Confirmations**: Thông báo ngay lập tức khi mua/bán coin
2. **Price Alerts**: Thông báo khi giá coin đạt ngưỡng đã set
3. **Price Updates**: Broadcast giá crypto real-time cho tất cả users
4. **General Notifications**: Thông báo hệ thống, cảnh báo

### WebSocket Events

#### Client → Server
```javascript
// Connect with authentication
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

#### Server → Client Events
```javascript
// 1. Trade confirmation
socket.on('trade_confirmation', (data) => {
  // data: { type, symbol, amount, price, totalCost, newBalance, timestamp }
});

// 2. Price alert
socket.on('price_alert', (data) => {
  // data: { symbol, targetPrice, currentPrice, condition, timestamp }
});

// 3. Price update (broadcast)
socket.on('price_update', (prices) => {
  // prices: Array of coin prices
});

// 4. General notification
socket.on('notification', (notification) => {
  // notification: { title, message, type, data }
});
```

### Frontend Integration Example
```javascript
import io from 'socket.io-client';

// Connect to WebSocket
const token = localStorage.getItem('token');
const socket = io('http://localhost:3000', {
  auth: { token }
});

// Listen for trade confirmations
socket.on('trade_confirmation', (trade) => {
  toast.success(`${trade.type === 'buy' ? 'Bought' : 'Sold'} ${trade.amount} ${trade.symbol}`);
  // Update UI, refresh balance, etc.
});

// Listen for price alerts
socket.on('price_alert', (alert) => {
  toast.warning(`${alert.symbol} is now ${alert.condition} $${alert.targetPrice}`);
});

// Handle connection errors
socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
});
```

---

## 📧 Email Notifications

### Overview
Hệ thống hỗ trợ gửi email notifications qua Nodemailer (Gmail SMTP).

### Configuration
Thêm vào `.env`:
```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ENABLE_EMAIL_NOTIFICATIONS=true
```

### Gmail App Password Setup
1. Vào Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy 16-character password
   - Paste vào `EMAIL_PASSWORD` trong .env

### Email Types

#### 1. Welcome Email
Gửi khi user đăng ký mới.

#### 2. Trade Confirmation Email
Gửi sau mỗi giao dịch mua/bán.

#### 3. Price Alert Email
Gửi khi giá coin đạt ngưỡng đã set.

### Disable Email (Optional)
Nếu không muốn dùng email, set:
```env
ENABLE_EMAIL_NOTIFICATIONS=false
```
System vẫn hoạt động bình thường với WebSocket only.

---

## 🔔 Price Alerts

### How It Works
1. User tạo price alert qua API
2. Cron job chạy mỗi phút kiểm tra giá
3. Khi giá đạt ngưỡng:
   - Trigger alert trong database
   - Tạo notification record
   - Gửi WebSocket notification
   - Gửi email (nếu enabled)
   - Deactivate alert

### Create Price Alert
```javascript
POST /api/notifications/alert
{
  "symbol": "BTC",
  "targetPrice": 70000,
  "condition": "above"  // or "below"
}
```

### Get Alerts
```javascript
GET /api/notifications/alerts
```

### Delete Alert
```javascript
DELETE /api/notifications/alert/:id
```

### Enable/Disable Price Alert Checker
```env
ENABLE_PRICE_ALERTS=true  # Check every minute
```

---

## 🚀 Testing

### 1. Test WebSocket Connection
```javascript
// Browser console
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
  console.log('✅ Connected');
});

socket.on('trade_confirmation', (data) => {
  console.log('📢 Trade:', data);
});
```

### 2. Test Price Alert
```bash
# Create alert
curl -X POST http://localhost:3000/api/notifications/alert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC",
    "targetPrice": 50000,
    "condition": "above"
  }'

# Wait for cron job to check (every minute)
# You'll receive WebSocket notification + email when price reaches target
```

### 3. Test Email
```javascript
// In backend console
const emailService = require('./shared/utils/emailService');

emailService.sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'This is a test',
  html: '<h1>Test Email</h1>'
});
```

---

## 📊 Architecture Flow

### Trade Flow with WebSocket
```
Frontend → API Gateway → Trade Orchestration:
  1. Get price from Market Service
  2. Check balance from User Service
  3. Update balance
  4. Update portfolio
  5. Create trade record
  6. Send DB notification
  7. ✨ Send WebSocket notification (NEW!)
  8. 📧 Send email (if enabled, NEW!)
  
Frontend receives real-time notification via WebSocket
```

### Price Alert Flow
```
Cron Job (every minute):
  1. Get all active alerts from DB
  2. Get current prices from Market Service
  3. Compare prices with target prices
  4. If triggered:
     - Update alert in DB
     - Create notification
     - ✨ Send WebSocket notification
     - 📧 Send email (if enabled)
```

---

## ⚡ Performance

### WebSocket
- ✅ Instant notifications (< 100ms)
- ✅ Persistent connection
- ✅ Auto-reconnect on disconnect
- ✅ Room-based targeting (1 user only)

### Email
- ⚠️ Slower (1-3 seconds)
- ✅ Reliable delivery
- ✅ Works when app closed
- ✅ Non-blocking (async)

---

## 🔒 Security

### WebSocket Authentication
- JWT token required in handshake
- User-specific rooms (`user_${userId}`)
- Cannot listen to other users' events

### Email
- App password (not real password)
- Encrypted SMTP connection
- Rate limiting via cron (max 1 email/minute per alert)

---

## 📦 Dependencies Added

```json
{
  "socket.io": "^4.7.2",      // WebSocket server
  "nodemailer": "^6.9.7"      // Email service
}
```

Install:
```bash
cd backend
npm install
```

---

## ✅ Checklist

### Backend Ready
- [x] WebSocket server in API Gateway
- [x] WebSocket utility helpers
- [x] Email service utility
- [x] Price alert checker with WebSocket + Email
- [x] Trade orchestration with WebSocket notifications
- [x] Environment variables configured

### Frontend TODO
- [ ] Socket.IO client integration
- [ ] Listen for trade_confirmation events
- [ ] Listen for price_alert events
- [ ] Display real-time notifications (toast/popup)
- [ ] Auto-refresh balance/portfolio on events

---

## 🎯 Result

**Backend bây giờ hỗ trợ:**
✅ Real-time WebSocket notifications
✅ Email notifications (optional)
✅ Price alerts với cron job
✅ Trade confirmations instant
✅ 100% yêu cầu đề cương!
