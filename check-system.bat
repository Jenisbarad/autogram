@echo off
echo ============================================
echo   Insta-Autogram System Check
echo ============================================
echo.

echo [1/6] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found! Please install Node.js 18+
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js %NODE_VERSION% found
)

echo.
echo [2/6] Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [OK] npm %NPM_VERSION% found
)

echo.
echo [3/6] Checking FFmpeg...
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] FFmpeg not found! Video processing will fail
    echo Install: choco install ffmpeg
) else (
    echo [OK] FFmpeg found
)

echo.
echo [4/6] Checking yt-dlp...
yt-dlp --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] yt-dlp not found! Media downloads will fail
    echo Install: pip install yt-dlp
) else (
    echo [OK] yt-dlp found
)

echo.
echo [5/6] Checking PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] PostgreSQL client not found in PATH
    echo Make sure PostgreSQL is installed and running
) else (
    echo [OK] PostgreSQL client found
)

echo.
echo [6/6] Checking Redis...
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Redis not responding! Queue system will fail
    echo Start Redis: redis-server
) else (
    echo [OK] Redis is running
)

echo.
echo ============================================
echo   Checking Backend Dependencies
echo ============================================
cd backend
if not exist "node_modules" (
    echo [INFO] Installing backend dependencies...
    npm install
) else (
    echo [OK] Backend dependencies installed
)

echo.
echo ============================================
echo   Checking Frontend Dependencies
echo ============================================
cd ..\frontend
if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies...
    npm install
) else (
    echo [OK] Frontend dependencies installed
)

cd ..
echo.
echo ============================================
echo   System Check Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Create PostgreSQL database: createdb insta_autogram
echo 2. Run migrations: cd backend ^&^& npm run migrate
echo 3. Configure .env files (see PROJECT_STATUS.md)
echo 4. Start servers: npm start
echo.
pause
