# 🎬 Demo Script - CryptoTrading SOA

## 📝 Chuẩn bị trước Demo

### Backend
1. Mở 6 terminal windows và start tất cả services:
   ```
   cd backend
   .\start-all-services.bat
   ```
2. Đợi tất cả services ready (~10 giây)
3. Kiểm tra: http://localhost:3000/health

### Frontend
1. Mở terminal thứ 7:
   ```
   cd frontend
   npm run dev
   ```
2. Mở browser: http://localhost:5173

### Demo Data
- Sử dụng email mới để demo: `demo@cryptotrading.com`
- Password: `demo123456`

---

## 🎥 Demo Flow (10 phút)

### 1. Giới thiệu (1 phút)
**Script:**
> "Xin chào! Hôm nay tôi sẽ demo ứng dụng CryptoTrading SOA - một nền tảng giao dịch tiền điện tử được xây dựng với kiến trúc SOA.
> 
> Ứng dụng gồm:
> - Frontend: React + Vite + Tailwind CSS
> - Backend: 6 microservices với Node.js + Express
> - Database: MongoDB Atlas
> - Real-time market data từ CoinGecko API"

**Show:**
- Terminal windows với 6 services đang chạy
- Architecture diagram từ README.md

---

### 2. Đăng ký tài khoản (1 phút)
**Script:**
> "Đầu tiên, tôi sẽ tạo một tài khoản mới. Mỗi user mới sẽ nhận $10,000 số dư ban đầu để thử nghiệm."

**Actions:**
1. Click "Đăng ký"
2. Điền form:
   - Email: demo@cryptotrading.com
   - Password: demo123456
   - Confirm: demo123456
   - Họ tên: Demo User
3. Click "Đăng ký"

**Show:**
- Backend terminal: Log request đến User Service
- Frontend: Redirect to Dashboard
- Balance hiển thị: $10,000.00

---

### 3. Dashboard Overview (1 phút)
**Script:**
> "Đây là Dashboard - trang tổng quan. Tôi có thể thấy:
> - Số dư hiện tại: $10,000
> - Tổng giá trị danh mục: $0 (vì chưa mua gì)
> - Top 5 cryptocurrencies với giá real-time từ CoinGecko"

**Show:**
- Số dư card
- Portfolio card
- Danh sách top coins (BTC, ETH, BNB, XRP, ADA...)
- Prices cập nhật real-time

---

### 4. Mua Bitcoin (2 phút)
**Script:**
> "Bây giờ tôi sẽ mua Bitcoin. Process này được orchestrate bởi API Gateway qua 6 bước:
> 1. Lấy giá từ Market Service
> 2. Check số dư từ User Service
> 3. Trừ tiền
> 4. Thêm holding vào Portfolio
> 5. Tạo trade record
> 6. Gửi notification"

**Actions:**
1. Click menu "Giao dịch"
2. Tab "Mua" already selected
3. Search/Select "Bitcoin (BTC)"
4. Nhập amount: `0.01`
5. Xem calculated total (ví dụ: ~$900)
6. Click "Mua Bitcoin"

**Show:**
- Backend terminal: Watch orchestration logs
- Success message
- Balance giảm từ $10,000 → ~$9,100
- Holding appear: 0.01 BTC

**Backend Demo (show logs):**
```
📊 Starting BUY orchestration for BTC
✓ Step 1/6: Got price: $90,000
✓ Step 2/6: Balance checked: $10,000
✓ Step 3/6: Balance deducted: -$900
✓ Step 4/6: Holding added: 0.01 BTC
✓ Step 5/6: Trade record created
✓ Step 6/6: Notification sent
🎉 BUY completed successfully
```

---

### 5. Portfolio View (1.5 phút)
**Script:**
> "Sang trang Danh mục, tôi có thể thấy visualization của tài sản đang nắm giữ."

**Actions:**
1. Click menu "Danh mục"
2. Xem pie chart
3. Xem holdings table

**Show:**
- Pie chart: BTC chiếm 100%
- Table: 
  - Symbol: BTC
  - Amount: 0.01
  - Current Price: $90,000
  - Value: $900
  - Profit/Loss: 0% (vừa mới mua)

---

### 6. Bán một phần Bitcoin (2 phút)
**Script:**
> "Giả sử giá BTC tăng và tôi muốn chốt lời. Tôi sẽ bán 50% holdings."

**Actions:**
1. Back to "Giao dịch"
2. Click tab "Bán"
3. Select BTC from holdings
4. Nhập amount: `0.005` (half)
5. Click "Bán Bitcoin"

**Show:**
- Backend: SELL orchestration logs (7 steps)
- Success message
- Balance tăng lên ~$9,550
- Portfolio updated: 0.005 BTC remaining

**Backend Demo:**
```
📊 Starting SELL orchestration for BTC
✓ Step 1/7: Holding checked: 0.01 BTC
✓ Step 2/7: Got price: $90,000
✓ Step 3/7: Balance retrieved
✓ Step 4/7: Proceeds added: +$450
✓ Step 5/7: Holding reduced to 0.005 BTC
✓ Step 6/7: Trade record created
✓ Step 7/7: Notification sent
🎉 SELL completed successfully
```

---

### 7. Lịch sử giao dịch (1 phút)
**Script:**
> "Cuối cùng, tôi có thể xem toàn bộ lịch sử giao dịch."

**Actions:**
1. Click menu "Lịch sử"
2. Scroll qua table

**Show:**
- 2 transactions:
  
  | Type | Coin | Amount | Price | Total | Time |
  |------|------|--------|-------|-------|------|
  | BUY  | BTC  | 0.01   | $90k  | $900  | 2m ago |
  | SELL | BTC  | 0.005  | $90k  | $450  | 30s ago |

---

### 8. Architecture Deep Dive (0.5 phút)
**Script:**
> "Về mặt kỹ thuật, ứng dụng follow SOA pattern nghiêm ngặt:
> - Không có service nào gọi service khác trực tiếp
> - Tất cả orchestration logic nằm ở API Gateway
> - Mỗi service chỉ quản lý data của riêng mình
> - Single point of entry cho frontend"

**Show:**
- Open architecture diagram
- Open `backend/ARCHITECTURE.md`
- Show orchestration code: `api-gateway/orchestration/tradeOrchestration.js`

---

### 9. Q&A / Kết thúc (0.5 phút)
**Script:**
> "Đó là demo hoàn chỉnh của CryptoTrading SOA. 
> 
> Key features:
> ✅ Real-time market data
> ✅ Seamless buy/sell flow
> ✅ Portfolio management
> ✅ Transaction history
> ✅ SOA architecture với proper orchestration
> 
> Cảm ơn các bạn đã theo dõi!"

---

## 🎯 Demo Talking Points

### Technical Highlights
1. **SOA Pattern**: Explain orchestration vs service-to-service calls
2. **Real-time Data**: CoinGecko API integration
3. **Authentication**: JWT tokens, secure
4. **Error Handling**: Centralized middleware
5. **Logging**: Winston with pretty format
6. **Database**: MongoDB Atlas, Mongoose schemas

### Business Value
1. **User Experience**: Smooth, responsive UI
2. **Scalability**: Each service can scale independently
3. **Maintainability**: Clear separation of concerns
4. **Reliability**: Error handling at every layer
5. **Extensibility**: Easy to add new features/services

### Future Enhancements
- WebSocket for real-time price updates
- Advanced charts (candlestick)
- Price alerts with push notifications
- Transaction rollback mechanism
- Docker containerization
- CI/CD pipeline

---

## 🐛 Backup Plans

### If something goes wrong:

**Service crashed:**
- Restart in terminal window
- Or use: `taskkill /F /IM node.exe` then restart all

**Frontend error:**
- Clear localStorage
- Hard refresh (Ctrl+Shift+R)
- Check console for actual error

**MongoDB connection:**
- Have backup MONGODB_URI ready
- Or switch to demo mode (mock data)

**Market API down:**
- Show cached data
- Or use mock prices in Market Service

---

## 📸 Screenshots to Prepare

1. Architecture diagram
2. All 6 service terminals running
3. Dashboard with balance
4. Trading page (buy form)
5. Portfolio with pie chart
6. Transaction history table
7. Code snippet: orchestration logic

---

## ⏱️ Time Management

- **1:00** - Intro + Architecture
- **2:00** - Registration + Dashboard
- **4:00** - Buy flow + Backend logs
- **5:30** - Portfolio view
- **7:30** - Sell flow + Backend logs
- **8:30** - History
- **9:00** - Technical deep dive
- **10:00** - Conclusion + Q&A

**Total: 10 minutes**

---

## ✅ Pre-Demo Checklist

- [ ] All services running and healthy
- [ ] Frontend running on :5173
- [ ] Browser window prepared (incognito mode)
- [ ] Terminal windows arranged nicely
- [ ] Architecture diagram open
- [ ] README.md open in editor
- [ ] Email ready: demo@cryptotrading.com
- [ ] MongoDB connection tested
- [ ] CoinGecko API responding
- [ ] Screen recording software ready (if recording)
- [ ] Backup plans reviewed

Good luck! 🚀
