# Start all backend services for CryptoTrading SOA.
# Run from PowerShell:
#   cd D:\CryptoTradingSOA\backend
#   .\start-all-services.ps1

Write-Host "Starting CryptoTrading SOA Backend Services..." -ForegroundColor Cyan
Write-Host ""

$backendPath = $PSScriptRoot
$projectRoot = Split-Path -Parent $backendPath

function Stop-PortIfListening {
    param([int]$Port)

    $existingPid = netstat -ano 2>$null |
        Select-String ":$Port\s.*LISTENING" |
        ForEach-Object { ($_ -split '\s+')[-1] } |
        Select-Object -First 1

    if ($existingPid) {
        Write-Host "  - Port $Port is already in use. Stopping PID $existingPid..." -ForegroundColor Yellow
        Stop-Process -Id $existingPid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
}

function Read-EnvFile {
    param([string]$Path)

    $map = @{}
    if (-not (Test-Path $Path)) {
        return $map
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line -split "=", 2
            $key = $parts[0].Trim()
            $value = $parts[1].Trim().Trim('"').Trim("'")
            $map[$key] = $value
        }
    }

    return $map
}

function Get-EnvValue {
    param(
        [hashtable]$Map,
        [string]$Key,
        [string]$Default = ""
    )

    if ($Map.ContainsKey($Key) -and $Map[$Key]) {
        return $Map[$Key]
    }
    if ([Environment]::GetEnvironmentVariable($Key)) {
        return [Environment]::GetEnvironmentVariable($Key)
    }
    return $Default
}

if (-not (Test-Path "$backendPath\node_modules")) {
    Write-Host "node_modules not found. Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location $backendPath
    npm install
}

$services = @(
    @{Name="API Gateway"; Path="api-gateway/server.js"; Port=3000},
    @{Name="User Service"; Path="services/user-service/server.js"; Port=3001},
    @{Name="Market Service"; Path="services/market-service/server.js"; Port=3002},
    @{Name="Portfolio Service"; Path="services/portfolio-service/server.js"; Port=3003},
    @{Name="Trade Service"; Path="services/trade-service/server.js"; Port=3004},
    @{Name="Notification Service"; Path="services/notification-service/server.js"; Port=3005}
)

Write-Host "Services to start:" -ForegroundColor Yellow
foreach ($service in $services) {
    Write-Host "  - $($service.Name) (Port: $($service.Port))" -ForegroundColor Gray
}
Write-Host "  - News Service (Port: 3006)" -ForegroundColor Gray
Write-Host "  - Academy Service (Port: 3007)" -ForegroundColor Gray
Write-Host "  - Sentiment Service (Port: 3008)" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Do you want to start all services? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Cancelled" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Starting Node.js services in new windows..." -ForegroundColor Green
Write-Host ""

foreach ($service in $services) {
    Stop-PortIfListening -Port $service.Port

    $title = $service.Name
    $command = "Set-Location '$backendPath'; `$host.UI.RawUI.WindowTitle='$title'; Write-Host 'Starting $title on port $($service.Port)...'; node $($service.Path)"

    Write-Host "  - Starting: $title" -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $command
    Start-Sleep -Seconds 2
}

$envFile = "$backendPath\.env"
$envMap = Read-EnvFile -Path $envFile
$apiGatewayUrl = Get-EnvValue -Map $envMap -Key "API_GATEWAY_URL" -Default "http://localhost:3000"
$internalServiceKey = Get-EnvValue -Map $envMap -Key "INTERNAL_SERVICE_KEY" -Default "cryptotrading-internal-svc-key-2026"
$consulHost = Get-EnvValue -Map $envMap -Key "CONSUL_HOST" -Default "localhost"
$consulPort = Get-EnvValue -Map $envMap -Key "CONSUL_PORT" -Default "8500"

Write-Host ""
Write-Host "Starting Do An 2 services in new windows..." -ForegroundColor Green
Write-Host ""

$newsDir = Join-Path $projectRoot "news-service"
if (Test-Path (Join-Path $newsDir "mvnw.cmd")) {
    Stop-PortIfListening -Port 3006

    $cryptoCompareKey = Get-EnvValue -Map $envMap -Key "CRYPTOCOMPARE_API_KEY"
    $newsApiKey = Get-EnvValue -Map $envMap -Key "NEWSAPI_KEY"

    Write-Host "  - Starting: News Service (Java Spring Boot) on port 3006" -ForegroundColor Green
    $newsCmd = "Set-Location '$newsDir'; `$host.UI.RawUI.WindowTitle='News Service (Java) :3006'; `$env:CRYPTOCOMPARE_API_KEY='$cryptoCompareKey'; `$env:NEWSAPI_KEY='$newsApiKey'; `$env:API_GATEWAY_URL='$apiGatewayUrl'; `$env:INTERNAL_SERVICE_KEY='$internalServiceKey'; `$env:CONSUL_HOST='$consulHost'; `$env:CONSUL_PORT='$consulPort'; Write-Host 'Starting News Service on port 3006...'; .\mvnw.cmd spring-boot:run"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $newsCmd
    Start-Sleep -Seconds 2
} else {
    Write-Host "  - News Service not found at $newsDir" -ForegroundColor Yellow
}

$academyDir = Join-Path $projectRoot "academy-service"
if (Test-Path (Join-Path $academyDir "mvnw.cmd")) {
    Stop-PortIfListening -Port 3007

    $dbUsername = Get-EnvValue -Map $envMap -Key "DB_USERNAME" -Default "root"
    $dbPassword = Get-EnvValue -Map $envMap -Key "DB_PASSWORD"
    $youtubeApiKey = Get-EnvValue -Map $envMap -Key "YOUTUBE_API_KEY"

    Write-Host "  - Starting: Academy Service (Java Spring Boot) on port 3007" -ForegroundColor Green
    $academyCmd = "Set-Location '$academyDir'; `$host.UI.RawUI.WindowTitle='Academy Service (Java) :3007'; `$env:DB_USERNAME='$dbUsername'; `$env:DB_PASSWORD='$dbPassword'; `$env:YOUTUBE_API_KEY='$youtubeApiKey'; `$env:CONSUL_HOST='$consulHost'; `$env:CONSUL_PORT='$consulPort'; Write-Host 'Starting Academy Service on port 3007...'; .\mvnw.cmd spring-boot:run"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $academyCmd
    Start-Sleep -Seconds 2
} else {
    Write-Host "  - Academy Service not found at $academyDir" -ForegroundColor Yellow
}

$sentimentDir = Join-Path $projectRoot "sentiment-service"
$sentimentStartScript = Join-Path $sentimentDir "start.ps1"
if (Test-Path $sentimentStartScript) {
    Stop-PortIfListening -Port 3008

    Write-Host "  - Starting: Sentiment Service (Python FinBERT) on port 3008" -ForegroundColor Green
    $sentimentCmd = "Set-Location '$sentimentDir'; `$host.UI.RawUI.WindowTitle='Sentiment Service (Python FinBERT) :3008'; `$env:API_GATEWAY_URL='$apiGatewayUrl'; `$env:INTERNAL_SERVICE_KEY='$internalServiceKey'; `$env:CONSUL_HOST='$consulHost'; `$env:CONSUL_PORT='$consulPort'; Write-Host 'Starting Sentiment Service with start.ps1...'; .\start.ps1"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $sentimentCmd
    Start-Sleep -Seconds 2
} else {
    Write-Host "  - Sentiment Service start script not found at $sentimentStartScript" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "All service windows were opened." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Wait for all service windows to finish starting."
Write-Host "  2. Open a new VS Code terminal and run:"
Write-Host "       cd $projectRoot\frontend"
Write-Host "       npm run dev"
Write-Host "  3. Open browser: http://localhost:5173"
Write-Host ""
Write-Host "To stop services quickly:" -ForegroundColor Red
Write-Host "   taskkill /F /IM node.exe"
Write-Host "   taskkill /F /IM java.exe"
Write-Host "   taskkill /F /IM python.exe"
Write-Host ""
