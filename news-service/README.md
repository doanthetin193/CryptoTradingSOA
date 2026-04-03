# News Service (Java Spring Boot)

Microservice cung cấp tin tức crypto, chứng minh kiến trúc **SOA language-agnostic**.

## Tech Stack

- **Language**: Java 21
- **Framework**: Spring Boot 3.2.4
- **Cache**: Guava Cache (in-memory, TTL 24h)
- **Port**: 3006
- **Build**: Maven 3.9.6

## Khởi động

```powershell
# Chạy script start
.\start.ps1

# Hoặc trực tiếp (sau khi đã build)
java -jar target\news-service-1.0.0.jar
```

## Build

```powershell
# Maven cài tại C:\maven\apache-maven-3.9.6
& "C:\maven\apache-maven-3.9.6\bin\mvn.cmd" clean package -DskipTests
```

## API Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/news` | Danh sách tin (hỗ trợ filter + paginate) |
| GET | `/news/{id}` | Chi tiết bài báo |
| GET | `/news/trending` | Top tin trending |
| GET | `/news/coins/{coin}` | Tin theo coin |
| GET | `/health` | Health check |

### Query Params cho GET /news

| Param | Mặc định | Mô tả |
|-------|---------|-------|
| page | 1 | Trang (1-based) |
| limit | 10 | Tin/trang (max 50) |
| coin | - | Lọc theo coin (BTC, ETH,...) |
| sentiment | - | positive / negative / neutral |
| search | - | Tìm kiếm trong tiêu đề |

## Cấu hình CryptoPanic API (tùy chọn)

1. Đăng ký tại https://cryptopanic.com/developers/
2. Lấy API key
3. Set environment variable:

```powershell
$env:CRYPTOPANIC_API_KEY = "your-api-key"
```

Khi không có API key, service tự động dùng **10 bài tin mẫu** để demo.

## Tích hợp

- **API Gateway**: `GET /api/news/*` proxy tới service này
- **Consul**: Tự động đăng ký khi Consul đang chạy (fail-safe nếu không có)
- **Frontend**: Trang `/news` và widget trên Dashboard
