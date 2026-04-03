# Start Academy Service (Java Spring Boot)
# Port: 3007

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  ACADEMY SERVICE (Java Spring Boot) - Port 3007" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$academyServiceDir = $PSScriptRoot
$mvn = "$env:USERPROFILE\.m2\wrapper\dists\apache-maven-3.9.6-bin\3311e1d4\apache-maven-3.9.6\bin\mvn.cmd"

Write-Host "📁 Working directory: $academyServiceDir" -ForegroundColor Yellow

# Check Java
$javaVersion = java -version 2>&1 | Select-Object -First 1
Write-Host "☕ $javaVersion" -ForegroundColor Green

# Require environment variables
if (-not $env:YOUTUBE_API_KEY) {
    Write-Host "⚠️  YOUTUBE_API_KEY not set — YouTube data will be skipped (DB metadata only)." -ForegroundColor Yellow
}
if (-not $env:YOUTUBE_PLAYLIST_ID) {
    Write-Host "⚠️  YOUTUBE_PLAYLIST_ID not set — YouTube data will be skipped." -ForegroundColor Yellow
}
if (-not $env:DB_PASSWORD) {
    Write-Host "ℹ️  DB_PASSWORD not set — using empty password (root default)." -ForegroundColor Gray
}

# Check for existing JAR
$jarPath = "$academyServiceDir\target\academy-service-1.0.0.jar"

if (-not (Test-Path $jarPath)) {
    Write-Host ""
    Write-Host "🔨 Building project (first run)..." -ForegroundColor Yellow
    & $mvn -f "$academyServiceDir\pom.xml" clean package -DskipTests -q

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✅ Build successful!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting Academy Service on port 3007..." -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

java -jar $jarPath
