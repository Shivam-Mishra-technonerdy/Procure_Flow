<#
.SYNOPSIS
    Gracefully stops the ProcureFlow Spring Boot backend and Vite frontend processes.
    Leaves MySQL running.
#>

$ErrorActionPreference = "SilentlyContinue"

# Determine project directories
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$logsDir = Join-Path $projectRoot "logs"

$backendPidFile = Join-Path $logsDir "backend.pid"
$frontendPidFile = Join-Path $logsDir "frontend.pid"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       ProcureFlow: Stop Project Services                        " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Helper to check if a local port is listening
function Test-PortListening {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return ($null -ne $conn)
}

# ---------------------------------------------------------------------------
# STEP 1: Stop Spring Boot Backend
# ---------------------------------------------------------------------------
Write-Host "[1/3] Stopping Spring Boot Backend (Port 8080)..." -ForegroundColor White

$backendStopped = $false

# 1a. Stop via recorded PID
if (Test-Path $backendPidFile) {
    $backendPid = Get-Content $backendPidFile -ErrorAction SilentlyContinue | Out-String
    $backendPid = $backendPid.Trim()
    if ($backendPid -match '^\d+$') {
        & taskkill /PID $backendPid /T /F 2>$null
        $backendStopped = $true
    }
    Remove-Item $backendPidFile -Force -ErrorAction SilentlyContinue
}

# 1b. Check port 8080 listener
$backendConn = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($backendConn) {
    & taskkill /PID $backendConn.OwningProcess /T /F 2>$null
    $backendStopped = $true
}

# 1c. Stop any java process running supplier-po-management JAR
$javaProcs = Get-CimInstance Win32_Process -Filter "Name = 'java.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like "*supplier-po-management*" }

foreach ($p in $javaProcs) {
    & taskkill /PID $p.ProcessId /T /F 2>$null
    $backendStopped = $true
}

Start-Sleep -Seconds 1

if (-not (Test-PortListening 8080)) {
    Write-Host "      [OK] Spring Boot backend stopped successfully (port 8080 freed)." -ForegroundColor Green
} else {
    Write-Host "      [WARN] Port 8080 still appears active. Please check Task Manager." -ForegroundColor Yellow
}
Write-Host ""

# ---------------------------------------------------------------------------
# STEP 2: Stop Vite Frontend
# ---------------------------------------------------------------------------
Write-Host "[2/3] Stopping Vite Frontend (Port 5173)..." -ForegroundColor White

$frontendStopped = $false

# 2a. Stop via recorded PID
if (Test-Path $frontendPidFile) {
    $frontendPid = Get-Content $frontendPidFile -ErrorAction SilentlyContinue | Out-String
    $frontendPid = $frontendPid.Trim()
    if ($frontendPid -match '^\d+$') {
        & taskkill /PID $frontendPid /T /F 2>$null
        $frontendStopped = $true
    }
    Remove-Item $frontendPidFile -Force -ErrorAction SilentlyContinue
}

# 2b. Check port 5173 listener
$frontendConn = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($frontendConn) {
    & taskkill /PID $frontendConn.OwningProcess /T /F 2>$null
    $frontendStopped = $true
}

Start-Sleep -Seconds 1

if (-not (Test-PortListening 5173)) {
    Write-Host "      [OK] Frontend dev server stopped successfully (port 5173 freed)." -ForegroundColor Green
} else {
    Write-Host "      [WARN] Port 5173 still appears active. Please check Task Manager." -ForegroundColor Yellow
}
Write-Host ""

# ---------------------------------------------------------------------------
# STEP 3: MySQL Status Confirmation
# ---------------------------------------------------------------------------
Write-Host "[3/3] Checking MySQL Database..." -ForegroundColor White

if (Test-PortListening 3306) {
    Write-Host "      [INFO] MySQL service is active on port 3306 and was left running as required." -ForegroundColor Cyan
} else {
    Write-Host "      [INFO] MySQL service was not running." -ForegroundColor DarkGray
}
Write-Host ""

Write-Host "================================================================" -ForegroundColor Green
Write-Host "  ProcureFlow Project Services Stopped Successfully!             " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
