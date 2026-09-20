@echo off
rem Serves the working app in app/ and prints its address. Usage: run-app.bat [port]   (default 8080)
set PORT=%1
if "%PORT%"=="" set PORT=8080
cd /d "%~dp0app"
echo IntentWorkbench is at http://localhost:%PORT%  (press Ctrl+C to stop)
python -m http.server %PORT%
