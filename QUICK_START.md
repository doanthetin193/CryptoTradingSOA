# 🚀 CryptoTradingSOA - Quick Start

## Khởi động hệ thống (7 terminals)

### 1. Start Consul
```powershell
cd D:\tools\consul
.\consul.exe agent -dev
```

### 2. Start Backend Services

**Terminal 1 - API Gateway:**
```powershell
cd d:\CryptoTradingSOA\backend\api-gateway
npm start
```

**Terminal 2 - User Service:**
```powershell
cd d:\CryptoTradingSOA\backend\services\user-service
npm start
```

**Terminal 3 - Market Service:**
```powershell
cd d:\CryptoTradingSOA\backend\services\market-service
npm start
```

**Terminal 4 - Portfolio Service:**
```powershell
cd d:\CryptoTradingSOA\backend\services\portfolio-service
npm start
```

**Terminal 5 - Trade Service:**
```powershell
cd d:\CryptoTradingSOA\backend\services\trade-service
npm start
```

**Terminal 6 - Notification Service:**
```powershell
cd d:\CryptoTradingSOA\backend\services\notification-service
npm start
```

### 3. Start Frontend

**Terminal 7 - Frontend:**
```powershell
cd d:\CryptoTradingSOA\frontend
npm run dev
```

---

## 🌐 Access

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Consul UI**: http://localhost:8500/ui

---

## 📌 Ports

| Service | Port |
|---------|------|
| Consul | 8500 |
| API Gateway | 3000 |
| User Service | 3001 |
| Market Service | 3002 |
| Portfolio Service | 3003 |
| Trade Service | 3004 |
| Notification Service | 3005 |
| Frontend | 5173 |

---

## 🛑 Stop Services

Đóng từng terminal hoặc `Ctrl+C` trong mỗi terminal.
