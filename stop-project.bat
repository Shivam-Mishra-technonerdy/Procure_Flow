@echo off
setlocal enabledelayedexpansion

title ProcureFlow - Stopping Local Environment
cd /d "%~dp0"

echo ====================================================================
echo  ProcureFlow: Stopping Local Development Services
echo ====================================================================
echo.

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-project.ps1" %*

echo.
exit /b 0
