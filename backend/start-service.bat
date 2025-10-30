@echo off
REM Script to start individual service
REM Usage: start-service.bat [service-name]
REM Example: start-service.bat user-service

set SERVICE=%1

if "%SERVICE%"=="" (
    echo Usage: start-service.bat [service-name]
    echo.
    echo Available services:
    echo   - user-service
    echo   - market-service
    echo   - portfolio-service
    echo   - trade-service
    echo   - notification-service
    echo   - api-gateway
    exit /b 1
)

if "%SERVICE%"=="api-gateway" (
    cd api-gateway
    npm start
) else (
    cd services\%SERVICE%
    npm start
)
