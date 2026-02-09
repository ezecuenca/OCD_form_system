@echo off
REM Batch script to start Laravel server and open in Microsoft Edge

echo Starting Laravel development server...
echo.

REM Start server in a new window so it keeps running; wait, then open Edge
start "Laravel Server" cmd /k "php artisan serve"
timeout /t 3 /nobreak >nul

echo Opening http://127.0.0.1:8000 in Microsoft Edge...
start msedge http://127.0.0.1:8000

echo.
echo Server is running in the other window. Close that window or press Ctrl+C there to stop.
pause
