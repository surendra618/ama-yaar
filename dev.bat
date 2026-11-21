@echo off
title AMA YAAR Dev Server
cd /d "%~dp0"
cls
echo ========================================================
echo       AMA YAAR - Full Stack Dev Server Launcher
echo ========================================================
echo   - Storefront Website : http://localhost:5173
echo   - Backend API        : http://localhost:5000/api/v1
echo   - Admin Panel        : http://localhost:5174
echo   - Wi-Fi Phone Access : http://192.168.1.12:5173
echo ========================================================
echo Starting all services directly in this window...
echo Press Ctrl+C anytime to stop all servers.
echo.
npm run dev
