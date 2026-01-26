# PowerShell script to start Laravel server and open in Brave browser

Write-Host "Starting Laravel development server..." -ForegroundColor Green

# Start the server in the background
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    php artisan serve
}

# Wait a moment for the server to start
Start-Sleep -Seconds 2

# Open Brave browser
$bravePath = @(
    "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\Application\brave.exe",
    "$env:ProgramFiles\BraveSoftware\Brave-Browser\Application\brave.exe",
    "$env:ProgramFiles(x86)\BraveSoftware\Brave-Browser\Application\brave.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($bravePath) {
    Write-Host "Opening http://localhost:8000 in Brave browser..." -ForegroundColor Green
    Start-Process $bravePath "http://localhost:8000"
} else {
    Write-Host "Brave browser not found. Please open http://localhost:8000 manually." -ForegroundColor Yellow
    Write-Host "Server is running. Press Ctrl+C to stop." -ForegroundColor Yellow
}

# Wait for the job and show output
Write-Host "`nServer is running. Press Ctrl+C to stop." -ForegroundColor Cyan
Write-Host "View server output with: Receive-Job $($serverJob.Id)`n" -ForegroundColor Gray

# Keep script running and show server output
try {
    Receive-Job $serverJob -Wait
} finally {
    Stop-Job $serverJob
    Remove-Job $serverJob
}
