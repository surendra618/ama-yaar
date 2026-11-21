Set-Location $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       AMA YAAR - Full Stack Dev Server Launcher        " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  - Storefront Website : http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend API        : http://localhost:5000/api/v1" -ForegroundColor White
Write-Host "  - Admin Panel        : http://localhost:5174" -ForegroundColor White
Write-Host "  - Wi-Fi Phone Access : http://192.168.1.12:5173" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting all services directly in this window..." -ForegroundColor Green
Write-Host "Press Ctrl+C anytime to stop all servers." -ForegroundColor Gray
Write-Host ""

npm run dev
