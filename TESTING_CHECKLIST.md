# ✅ Testing Checklist - CryptoTrading SOA

## 🔧 Pre-flight Checks

### Backend Setup
- [x] `backend/.env` file exists with correct values
- [x] `backend/node_modules` installed (`npm install`)
- [x] MongoDB Atlas connection string valid
- [x] All 6 services can start without errors
- [x] API Gateway accessible at http://localhost:3000

### Frontend Setup
- [x] `frontend/.env` file exists
- [x] `frontend/node_modules` installed
- [x] Frontend starts on http://localhost:5173
- [x] No console errors in browser

## 🧪 Backend API Testing

### 1. Health Check
```bash
curl http://localhost:3000/health
```
**Expected:** Status 200, JSON with service status

### 2. User Registration
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test1@example.com",
    "password": "123456",
    "fullName": "Test User One"
  }'
```
**Expected:** 
- Status 201
- Returns user object + JWT token
- User balance = $10,000

### 3. User Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test1@example.com",
    "password": "123456"
  }'
```
**Expected:**
- Status 200
- Returns user + token

### 4. Get Market Prices
```bash
curl http://localhost:3000/api/market/prices
```
**Expected:**
- Status 200
- Array of coins with current prices

### 5. Get User Profile (Authenticated)
```bash
# Replace <TOKEN> with actual JWT from login
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <TOKEN>"
```
**Expected:**
- Status 200
- User profile with balance

## 🎨 Frontend UI Testing

### 1. Registration Flow
- [ ] Navigate to http://localhost:5173
- [ ] Should redirect to `/auth` (login page)
- [ ] Click "Đăng ký" tab
- [ ] Fill form:
  - Email: test2@example.com
  - Password: 123456
  - Confirm Password: 123456
  - Họ tên: Test User Two
- [ ] Click "Đăng ký" button
- [ ] Should redirect to `/` (Dashboard)
- [ ] Dashboard shows balance: $10,000.00

### 2. Login Flow
- [ ] Logout (click user menu → Đăng xuất)
- [ ] Should redirect to `/auth`
- [ ] Click "Đăng nhập" tab
- [ ] Fill credentials (test2@example.com / 123456)
- [ ] Click "Đăng nhập"
- [ ] Should redirect to Dashboard

### 3. Dashboard
- [ ] Shows current balance
- [ ] Shows portfolio value
- [ ] Shows top 5 coins with prices
- [ ] Prices are real-time from CoinGecko

### 4. Trading - BUY
- [ ] Navigate to "Giao dịch" (Trade) page
- [ ] Select "Mua" (Buy) tab
- [ ] Search for "Bitcoin" or select BTC
- [ ] Enter amount: 0.01
- [ ] Shows calculated total in USD
- [ ] Click "Mua Bitcoin"
- [ ] Success message appears
- [ ] Balance decreases
- [ ] Can see new holding in Portfolio

### 5. Portfolio
- [ ] Navigate to "Danh mục" (Portfolio) page
- [ ] See pie chart with holdings
- [ ] BTC holding shows correct amount (0.01)
- [ ] Shows current value in USD
- [ ] Shows profit/loss percentage

### 6. Trading - SELL
- [ ] Back to "Giao dịch" (Trade)
- [ ] Select "Bán" (Sell) tab
- [ ] Select BTC from holdings
- [ ] Enter amount: 0.005 (half of holdings)
- [ ] Click "Bán Bitcoin"
- [ ] Success message
- [ ] Balance increases
- [ ] Portfolio updated

### 7. History
- [ ] Navigate to "Lịch sử" (History) page
- [ ] See 2 transactions (1 BUY, 1 SELL)
- [ ] Each row shows:
  - Type (BUY/SELL)
  - Coin symbol
  - Amount
  - Price at time of trade
  - Total value
  - Timestamp

### 8. Settings (if implemented)
- [ ] Navigate to "Cài đặt" (Settings)
- [ ] Can update profile
- [ ] Changes saved successfully

## 🔗 Integration Testing

### Complete User Journey
1. [ ] Register new account
2. [ ] Receive $10,000 initial balance
3. [ ] View market prices on Dashboard
4. [ ] Buy 0.01 BTC (should cost ~$500-1000)
5. [ ] Check Portfolio - see BTC holding
6. [ ] Check History - see BUY transaction
7. [ ] Sell 0.005 BTC
8. [ ] Check Portfolio - BTC reduced to 0.005
9. [ ] Check History - see both transactions
10. [ ] Check balance increased after sell

### Orchestration Testing (Backend)
Buy orchestration should:
- [ ] Get price from Market Service
- [ ] Check balance from User Service
- [ ] Deduct balance (User Service)
- [ ] Add holding (Portfolio Service)
- [ ] Create trade record (Trade Service)
- [ ] Send notification (Notification Service)

Sell orchestration should:
- [ ] Check holding (Portfolio Service)
- [ ] Get price (Market Service)
- [ ] Calculate proceeds
- [ ] Add balance (User Service)
- [ ] Reduce holding (Portfolio Service)
- [ ] Create trade record (Trade Service)
- [ ] Send notification (Notification Service)

## 🚨 Error Handling Testing

### Backend
- [ ] Login with wrong password → 401 error
- [ ] Access protected route without token → 401 error
- [ ] Buy with insufficient balance → 400 error
- [ ] Sell more than holdings → 400 error
- [ ] Invalid email format → 400 error
- [ ] Duplicate email registration → 409 error

### Frontend
- [ ] Registration with mismatched passwords → Error message
- [ ] Login with wrong credentials → Error message
- [ ] Buy with amount = 0 → Validation error
- [ ] Network error → User-friendly message
- [ ] Session expired → Auto redirect to login

## 🔒 Security Testing

- [ ] JWT token stored in localStorage
- [ ] Token sent in Authorization header
- [ ] Protected routes require authentication
- [ ] Passwords hashed (bcrypt) in database
- [ ] CORS enabled for frontend origin
- [ ] Helmet security headers applied
- [ ] Rate limiting on API Gateway

## 📊 Performance Testing

- [ ] Dashboard loads < 2 seconds
- [ ] Trade execution < 3 seconds
- [ ] Portfolio refresh < 2 seconds
- [ ] Market prices update every 30 seconds
- [ ] No memory leaks after 10 trades
- [ ] Handles 10 concurrent users

## 🐛 Known Issues / Edge Cases

### To Fix:
- [ ] Consul warning (can be ignored if not using service discovery)
- [ ] Price alerts not fully implemented
- [ ] No transaction rollback on partial failure

### Edge Cases to Handle:
- [ ] What if CoinGecko API is down?
- [ ] What if MongoDB connection drops?
- [ ] What if user has exactly enough balance (boundary test)?
- [ ] Concurrent trades from same user

## 📝 Test Results

### Date: _______________
### Tester: _______________

**Backend Tests:** _____ / 5 passed
**Frontend Tests:** _____ / 8 passed
**Integration Tests:** _____ / 10 passed
**Error Handling:** _____ / 8 passed

**Overall Status:** ✅ PASS / ❌ FAIL

**Notes:**
_____________________________________
_____________________________________
_____________________________________

## 🎯 Sign-off

- [ ] All critical features working
- [ ] No blocking bugs
- [ ] Documentation complete
- [ ] Ready for demo/deployment

**Signed:** _______________
**Date:** _______________
