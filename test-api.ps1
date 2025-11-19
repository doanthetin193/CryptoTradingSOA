# Test Script for CryptoTrading SOA APIs

$BASE_URL = "http://localhost:3000/api"

Write-Host "`n=== Testing CryptoTrading SOA APIs ===`n" -ForegroundColor Cyan

# Test 1: Market Prices
Write-Host "1. Testing Market Prices..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/market/prices" -Method Get
    if ($response.success) {
        Write-Host "   ✓ Market API working - Found $($response.data.Count) coins" -ForegroundColor Green
        Write-Host "   Sample: $($response.data[0].symbol) = `$$($response.data[0].price)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Market API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Register User
Write-Host "`n2. Testing User Registration..." -ForegroundColor Yellow
$testEmail = "test_$(Get-Random)@example.com"
$testPassword = "Test123456"
try {
    $body = @{
        email = $testEmail
        password = $testPassword
        fullName = "Test User"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/users/register" -Method Post -Body $body -ContentType "application/json"
    if ($response.success) {
        Write-Host "   ✓ Registration successful" -ForegroundColor Green
        $token = $response.data.token
        $userId = $response.data.user._id
        Write-Host "   Token: $($token.Substring(0,20))..." -ForegroundColor Gray
        Write-Host "   Balance: `$$($response.data.user.balance)" -ForegroundColor Gray

        # Test 3: Get Portfolio
        Write-Host "`n3. Testing Portfolio API..." -ForegroundColor Yellow
        try {
            $headers = @{
                "Authorization" = "Bearer $token"
            }
            $portfolio = Invoke-RestMethod -Uri "$BASE_URL/portfolio" -Method Get -Headers $headers
            if ($portfolio.success) {
                Write-Host "   ✓ Portfolio API working" -ForegroundColor Green
                Write-Host "   Balance: `$$($portfolio.data.balance)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "   ✗ Portfolio API failed: $($_.Exception.Message)" -ForegroundColor Red
        }

        # Test 4: Buy Crypto
        Write-Host "`n4. Testing Buy Trade..." -ForegroundColor Yellow
        try {
            $buyBody = @{
                symbol = "BTC"
                coinId = "bitcoin"
                amount = 0.001
            } | ConvertTo-Json

            $trade = Invoke-RestMethod -Uri "$BASE_URL/trade/buy" -Method Post -Body $buyBody -ContentType "application/json" -Headers $headers
            if ($trade.success) {
                Write-Host "   ✓ Buy trade successful" -ForegroundColor Green
                Write-Host "   Bought: $($trade.data.amount) $($trade.data.symbol)" -ForegroundColor Gray
                Write-Host "   Price: `$$($trade.data.price)" -ForegroundColor Gray
                Write-Host "   Total: `$$($trade.data.total)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "   ✗ Buy trade failed: $($_.Exception.Message)" -ForegroundColor Red
        }

        # Test 5: Get Trade History
        Write-Host "`n5. Testing Trade History..." -ForegroundColor Yellow
        try {
            $history = Invoke-RestMethod -Uri "$BASE_URL/trade/history" -Method Get -Headers $headers
            if ($history.success) {
                Write-Host "   ✓ History API working" -ForegroundColor Green
                Write-Host "   Total trades: $($history.data.trades.Count)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "   ✗ History API failed: $($_.Exception.Message)" -ForegroundColor Red
        }

    }
} catch {
    Write-Host "   ✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===`n" -ForegroundColor Cyan
