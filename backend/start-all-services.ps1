# Script khởi động tất cả Backend Services
# Chạy script này trong PowerShell: .\start-all-services.ps1

Write-Host "🚀 Starting CryptoTrading SOA Backend Services..." -ForegroundColor Cyan
Write-Host ""

$backendPath = "D:\CryptoTradingSOA\backend"

# Kiểm tra node_modules
if (-not (Test-Path "$backendPath\node_modules")) {
    Write-Host "❌ node_modules not found. Installing dependencies..." -ForegroundColor Red
    Set-Location $backendPath
    npm install
}

# Array các services cần start
$services = @(
    @{Name="API Gateway"; Path="api-gateway/server.js"; Port=3000},
    @{Name="User Service"; Path="services/user-service/server.js"; Port=3001},
    @{Name="Market Service"; Path="services/market-service/server.js"; Port=3002},
    @{Name="Portfolio Service"; Path="services/portfolio-service/server.js"; Port=3003},
    @{Name="Trade Service"; Path="services/trade-service/server.js"; Port=3004},
    @{Name="Notification Service"; Path="services/notification-service/server.js"; Port=3005}
)

Write-Host "📋 Services to start:" -ForegroundColor Yellow
foreach ($service in $services) {
    Write-Host "  - $($service.Name) (Port: $($service.Port))" -ForegroundColor Gray
}
Write-Host ""

# Hỏi xác nhận
$confirm = Read-Host "Do you want to start all services? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "❌ Cancelled" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🔧 Starting services in new windows..." -ForegroundColor Green
Write-Host ""

# Start từng service trong window mới
foreach ($service in $services) {
    $title = $service.Name
    $command = "node $($service.Path)"
    
    Write-Host "  ✓ Starting: $title" -ForegroundColor Green
    
    # Mở PowerShell window mới với title
    Start-Process powershell -ArgumentList "-NoExit", "-Command", `
        "Set-Location '$backendPath'; `$host.UI.RawUI.WindowTitle='$title'; `
        Write-Host '🚀 Starting $title on port $($service.Port)...' -ForegroundColor Cyan; `
        $command"
    
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "✅ All services started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Wait for all services to be ready (check each window)"
Write-Host "  2. Open new terminal and run: cd D:\CryptoTradingSOA\frontend && npm run dev"
Write-Host "  3. Open browser: http://localhost:5173"
Write-Host ""
Write-Host "🛑 To stop all services:" -ForegroundColor Red
Write-Host "   taskkill /F /IM node.exe"
Write-Host ""
