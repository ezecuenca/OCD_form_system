@echo off
REM Start LibreOffice in listener mode for fast PDF conversion (~2 sec instead of 5+).
REM Leave this window open while using the app. Close it to stop the listener.
REM Edit the path below if LibreOffice is installed elsewhere.

set "SOFFICE=C:\Program Files\LibreOffice\program\soffice.exe"
if not exist "%SOFFICE%" (
    echo LibreOffice not found at %SOFFICE%
    echo Edit this script and set SOFFICE to your soffice.exe path.
    pause
    exit /b 1
)

echo Starting LibreOffice listener on port 2083...
echo Keep this window open. PDF conversion will be much faster.
echo.
"%SOFFICE%" --headless --accept="socket,host=127.0.0.1,port=2083;urp;StarOffice.ServiceManager"
pause
