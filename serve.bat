@echo off
REM Batch script to start Laravel server and open in Brave browser

echo Starting Laravel development server...

REM Start server in background and open Brave
start /B php artisan serve
timeout /t 2 /nobreak >nul

REM Try to find and open Brave browser
set "BRAVE_PATH="

if exist "%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe" (
    set "BRAVE_PATH=%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe"
) else if exist "%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe" (
    set "BRAVE_PATH=%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"
) else if exist "%ProgramFiles(x86)%\BraveSoftware\Brave-Browser\Application\brave.exe" (
    set "BRAVE_PATH=%ProgramFiles(x86)%\BraveSoftware\Brave-Browser\Application\brave.exe"
)

if defined BRAVE_PATH (
    echo Opening http://localhost:8000 in Brave browser...
    start "" "%BRAVE_PATH%" "http://localhost:8000"
) else (
    echo Brave browser not found. Please open http://localhost:8000 manually.
)

echo.
echo Server is running. Press Ctrl+C to stop.
php artisan serve
