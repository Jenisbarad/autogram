@echo off
title InstaAutogram Complete Startup

echo =========================================
echo       InstaAutogram Startup Script
echo =========================================
echo.

echo [1/3] Please make sure Redis and PostgreSQL are running.
echo       (If you use Docker, ensure your containers are up)
echo.

echo [2/3] Starting Backend Server...
start "InstaAutogram Backend" cmd /k "cd backend && npm run dev"

echo [3/3] Starting Frontend Server...
start "InstaAutogram Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================
echo  All services are starting!
echo  Backend will run on http://localhost:4000
echo  Frontend will run on http://localhost:3000
echo =========================================
pause
