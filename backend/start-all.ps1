# Script khởi động tất cả services
Write-Host "🚀 Starting all services..." -ForegroundColor Green

# Khởi động User Service
Write-Host "`n📦 Starting User Service (port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\services\user-service'; npm start"

# Đợi 2 giây
Start-Sleep -Seconds 2

# Khởi động Market Service
Write-Host "📦 Starting Market Service (port 3002)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\services\market-service'; npm start"

# Đợi 2 giây
Start-Sleep -Seconds 2

# Khởi động Portfolio Service
Write-Host "📦 Starting Portfolio Service (port 3003)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\services\portfolio-service'; npm start"

# Đợi 2 giây
Start-Sleep -Seconds 2

# Khởi động Trade Service
Write-Host "📦 Starting Trade Service (port 3004)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\services\trade-service'; npm start"

# Đợi 2 giây
Start-Sleep -Seconds 2

# Khởi động Notification Service
Write-Host "📦 Starting Notification Service (port 3005)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\services\notification-service'; npm start"

# Đợi 2 giây
Start-Sleep -Seconds 2

# Khởi động API Gateway
Write-Host "📦 Starting API Gateway (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\api-gateway'; npm start"

Write-Host "`n✅ All services are starting in separate windows!" -ForegroundColor Green
Write-Host "⏳ Wait about 10-15 seconds for all services to be ready..." -ForegroundColor Yellow
Write-Host "🌐 Check Consul UI: http://localhost:8500/ui" -ForegroundColor Magenta
