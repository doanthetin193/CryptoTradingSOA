@echo off
REM Script khởi động tất cả Backend Services (Windows CMD)

echo ========================================
echo   Starting CryptoTrading SOA Backend
echo ========================================
echo.

cd /d D:\CryptoTradingSOA\backend

echo [1/6] Starting API Gateway...
start "API Gateway (Port 3000)" cmd /k "node api-gateway/server.js"
timeout /t 3 /nobreak >nul

echo [2/6] Starting User Service...
start "User Service (Port 3001)" cmd /k "node services/user-service/server.js"
timeout /t 2 /nobreak >nul

echo [3/6] Starting Market Service...
start "Market Service (Port 3002)" cmd /k "node services/market-service/server.js"
timeout /t 2 /nobreak >nul

echo [4/6] Starting Portfolio Service...
start "Portfolio Service (Port 3003)" cmd /k "node services/portfolio-service/server.js"
timeout /t 2 /nobreak >nul

echo [5/6] Starting Trade Service...
start "Trade Service (Port 3004)" cmd /k "node services/trade-service/server.js"
timeout /t 2 /nobreak >nul

echo [6/6] Starting Notification Service...
start "Notification Service (Port 3005)" cmd /k "node services/notification-service/server.js"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   All Services Started Successfully!
echo ========================================
echo.
echo Next: Start frontend
echo   cd D:\CryptoTradingSOA\frontend
echo   npm run dev
echo.
echo To stop all: taskkill /F /IM node.exe
echo.
pause
