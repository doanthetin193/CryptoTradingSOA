# Script to test if all services start correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing SOA Services Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Consul is running
Write-Host "[1/7] Checking Consul..." -ForegroundColor Yellow
try {
    $consulCheck = Invoke-WebRequest -Uri "http://localhost:8500/v1/agent/self" -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Consul is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Consul is NOT running. Please start Consul first:" -ForegroundColor Red
    Write-Host "    cd D:\tools\consul" -ForegroundColor Yellow
    Write-Host "    .\consul.exe agent -dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Now you can start services in separate terminals:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1 - User Service:" -ForegroundColor Yellow
Write-Host "  cd backend\services\user-service" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 - Market Service:" -ForegroundColor Yellow
Write-Host "  cd backend\services\market-service" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 3 - Portfolio Service:" -ForegroundColor Yellow
Write-Host "  cd backend\services\portfolio-service" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 4 - Trade Service:" -ForegroundColor Yellow
Write-Host "  cd backend\services\trade-service" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 5 - Notification Service:" -ForegroundColor Yellow
Write-Host "  cd backend\services\notification-service" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 6 - API Gateway:" -ForegroundColor Yellow
Write-Host "  cd backend\api-gateway" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Then check Consul UI: http://localhost:8500" -ForegroundColor Cyan
