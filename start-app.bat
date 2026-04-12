@echo off
echo ============================================
echo   Starting Insta-Autogram
echo ============================================
echo.

REM Check if backend .env exists
if not exist "backend\.env" (
    echo [ERROR] Backend .env file not found!
    echo Please create backend\.env with required variables
    echo See PROJECT_STATUS.md for details
    pause
    exit /b 1
)

REM Check if frontend .env.local exists
if not exist "frontend\.env.local" (
    echo [WARNING] Frontend .env.local not found, creating default...
    echo NEXT_PUBLIC_BACKEND_URL=http://localhost:4000 > frontend\.env.local
)

echo [1/2] Starting Backend Server...
start "Insta-Autogram Backend" cmd /k "cd backend && npm run dev"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [2/2] Starting Frontend Server...
start "Insta-Autogram Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo   Servers Starting!
echo ============================================
echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:3000
echo Bull Board: http://localhost:4000/bull-board
echo.
echo Press any key to open browser...
pause >nul

start http://localhost:3000

echo.
echo Servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
