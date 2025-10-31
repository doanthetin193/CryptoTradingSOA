# 🔴 LỖI MONGODB CONNECTION TIMEOUT

## Vấn đề
Frontend báo lỗi "timeout of 15000ms exceeded" khi đăng ký vì:
```
Operation `users.findOne()` buffering timed out after 10000ms
```

## Nguyên nhân
MongoDB Atlas không kết nối được từ User Service.

## Giải pháp

### 1. Kiểm tra MongoDB Atlas

**Bước 1: Login MongoDB Atlas**
- Truy cập: https://cloud.mongodb.com
- Login với account: doanthetindeveloper

**Bước 2: Check Database Access**
- Click "Database Access" (menu bên trái)
- Kiểm tra user `doanthetindeveloper` có tồn tại không
- Password: `doanthetin193`
- Nếu sai, reset password và cập nhật lại .env

**Bước 3: Check Network Access** ⚠️ QUAN TRỌNG!
- Click "Network Access" (menu bên trái)
- Kiểm tra IP của bạn có trong whitelist không
- **GIẢI PHÁP TẠM:** Click "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)
- Hoặc thêm IP hiện tại của bạn

**Bước 4: Check Cluster Status**
- Click "Database" (menu bên trái)
- Cluster có đang "Paused" không?
- Nếu paused, click "Resume" để bật lại

### 2. Test lại connection

Sau khi fix MongoDB Atlas, test:

```powershell
# Test User Service health
curl http://localhost:3001/health

# Test register
$body = @{
    email = 'test@example.com'
    password = '123456'
    fullName = 'Test User'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3001/register' -Method Post -Body $body -ContentType 'application/json'
```

### 3. Nếu vẫn không được: Dùng MongoDB Local

**Option A: Install MongoDB Community Edition**
```powershell
# Download từ: https://www.mongodb.com/try/download/community
# Hoặc dùng Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: Cập nhật .env để dùng local MongoDB**

File: `backend/services/*/`.env`
```properties
# Thay vì MongoDB Atlas:
# MONGODB_URI=mongodb+srv://...

# Dùng local MongoDB:
MONGODB_URI=mongodb://localhost:27017/crypto_trading_soa
```

Sau đó restart tất cả services.

---

## Quick Fix: Allow All IPs (Development Only)

1. Login MongoDB Atlas
2. Network Access → Add IP Address
3. Chọn "Allow Access from Anywhere"
4. Confirm

Đợi 1-2 phút để changes apply, rồi test lại!

---

## Kiểm tra logs

Check terminal đang chạy User Service, sẽ thấy log:
- ✅ `MongoDB Connected: ...` - Kết nối OK
- ❌ `MongoDB connection error` - Có lỗi connection
