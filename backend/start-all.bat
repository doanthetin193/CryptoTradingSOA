@echo off
echo ============================================
echo Starting CryptoTrading SOA Backend
echo ============================================
echo.

echo [1/7] Starting Consul...
start "Consul" cmd /k "cd /d D:\tools\consul && consul.exe agent -dev"
timeout /t 5 /nobreak > nul

echo [2/7] Starting User Service...
start "User Service" cmd /k "cd /d %~dp0services\user-service && npm start"
timeout /t 3 /nobreak > nul

echo [3/7] Starting Market Service...
start "Market Service" cmd /k "cd /d %~dp0services\market-service && npm start"
timeout /t 3 /nobreak > nul

echo [4/7] Starting Portfolio Service...
start "Portfolio Service" cmd /k "cd /d %~dp0services\portfolio-service && npm start"
timeout /t 3 /nobreak > nul

echo [5/7] Starting Trade Service...
start "Trade Service" cmd /k "cd /d %~dp0services\trade-service && npm start"
timeout /t 3 /nobreak > nul

echo [6/7] Starting Notification Service...
start "Notification Service" cmd /k "cd /d %~dp0services\notification-service && npm start"
timeout /t 3 /nobreak > nul

echo [7/7] Starting API Gateway...
start "API Gateway" cmd /k "cd /d %~dp0api-gateway && npm start"

echo.
echo ============================================
echo All services are starting...
echo ============================================
echo.
echo API Gateway: http://localhost:3000
echo User Service: http://localhost:3001
echo Market Service: http://localhost:3002
echo Portfolio Service: http://localhost:3003
echo Trade Service: http://localhost:3004
echo Notification Service: http://localhost:3005
echo Consul UI: http://localhost:8500
echo.
echo Press any key to exit...
pause > nul
