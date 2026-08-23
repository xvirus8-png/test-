@echo off
title OpenCode Web Server - Port 4096
set OPENCODE_SERVER_PASSWORD=
cd /d "%~dp0"
echo ============================================
echo   OpenCode Web Server
echo   Local : http://localhost:4096
echo   Phone : http://192.168.100.4:4096
echo ============================================
echo.
opencode.cmd web --hostname 0.0.0.0 --port 4096
pause
