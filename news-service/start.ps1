# Start News Service (Java Spring Boot)
# Port: 3006

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  NEWS SERVICE (Java Spring Boot) - Port 3006" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variables (optional: set your API key here)
# $env:CRYPTOPANIC_API_KEY = "your-api-key-here"

$newsServiceDir = $PSScriptRoot
$mvn = "C:\maven\apache-maven-3.9.6\bin\mvn.cmd"

Write-Host "📁 Working directory: $newsServiceDir" -ForegroundColor Yellow

# Check Java
$javaVersion = java -version 2>&1 | Select-Object -First 1
Write-Host "☕ $javaVersion" -ForegroundColor Green

# Check for existing JAR
$jarPath = "$newsServiceDir\target\news-service-1.0.0.jar"

if (-not (Test-Path $jarPath)) {
    Write-Host ""
    Write-Host "🔨 Building project (first run)..." -ForegroundColor Yellow
    & $mvn -f "$newsServiceDir\pom.xml" clean package -DskipTests -q

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✅ Build successful!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting News Service on port 3006..." -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

java -jar $jarPath
