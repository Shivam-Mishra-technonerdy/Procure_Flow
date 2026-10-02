@echo off
setlocal enabledelayedexpansion

title ProcureFlow - Starting Local Environment
cd /d "%~dp0"

echo ====================================================================
echo  ProcureFlow: One-Click Local Development Launcher
echo ====================================================================
echo.

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-project.ps1" %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ====================================================================
    echo  [ERROR] Startup encountered an issue. See details above.
    echo  Logs are available in: %~dp0logs\
    echo ====================================================================
    pause
    exit /b %ERRORLEVEL%
)

exit /b 0
