# Sentiment Service startup script
# Run: .\start.ps1

$host.UI.RawUI.WindowTitle = "Sentiment Service (Python FinBERT) :3008"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Sentiment Service - FinBERT NLP (port 3008)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Python not found. Install Python 3.10+ first." -ForegroundColor Red
    exit 1
}

# Install torch CPU-only if not present
$torchInstalled = pip show torch 2>$null
if (-not $torchInstalled) {
    Write-Host "Installing PyTorch (CPU-only, ~200MB)..." -ForegroundColor Yellow
    pip install torch --index-url https://download.pytorch.org/whl/cpu --quiet
}

# Install other dependencies
Write-Host "Checking dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet

Write-Host ""
Write-Host "Starting Sentiment Service on port 3008..." -ForegroundColor Green
Write-Host "(First run: FinBERT model downloading ~440MB to HuggingFace cache)" -ForegroundColor Yellow
Write-Host ""

python main.py
