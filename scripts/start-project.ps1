<#
.SYNOPSIS
    Reliable one-click local development launcher for ProcureFlow.
    Starts MySQL service (if needed), Spring Boot backend, and Vite frontend.
#>

$ErrorActionPreference = "Stop"

# Determine project directories
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"
$logsDir = Join-Path $projectRoot "logs"

if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

$backendLog = Join-Path $logsDir "backend.log"
$frontendLog = Join-Path $logsDir "frontend.log"
$backendPidFile = Join-Path $logsDir "backend.pid"
$frontendPidFile = Join-Path $logsDir "frontend.pid"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       ProcureFlow: One-Click Local Development Launcher         " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Project Root: $projectRoot" -ForegroundColor DarkGray
Write-Host ""

# Helper to check if a local port is listening
function Test-PortListening {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return ($null -ne $conn)
}

# ---------------------------------------------------------------------------
# STEP 1: Check & Start MySQL Service
# ---------------------------------------------------------------------------
Write-Host "[1/4] Checking MySQL Database..." -ForegroundColor White

if (Test-PortListening 3306) {
    Write-Host "      [OK] MySQL is active and listening on port 3306." -ForegroundColor Green
} else {
    Write-Host "      [WAIT] Port 3306 is not listening. Searching for MySQL Windows service..." -ForegroundColor Yellow
    $mysqlService = Get-Service -Name *mysql* -ErrorAction SilentlyContinue | Select-Object -First 1

    if ($mysqlService) {
        Write-Host "      Found service '$($mysqlService.Name)' (Status: $($mysqlService.Status)). Starting service..." -ForegroundColor Cyan
        try {
            Start-Service -Name $mysqlService.Name -ErrorAction Stop
        } catch {
            Write-Host "      [WARN] Could not automatically start service '$($mysqlService.Name)': $_" -ForegroundColor Yellow
            Write-Host "             Run 'net start $($mysqlService.Name)' as Administrator if startup fails." -ForegroundColor Yellow
        }
    } else {
        Write-Host "      [WARN] No Windows service matching '*mysql*' was detected." -ForegroundColor Yellow
    }

    # Wait up to 10 seconds for MySQL to listen on port 3306
    $maxWait = 10
    $waited = 0
    while ($waited -lt $maxWait -and -not (Test-PortListening 3306)) {
        Start-Sleep -Seconds 1
        $waited++
    }

    if (Test-PortListening 3306) {
        Write-Host "      [OK] MySQL service started and listening on port 3306." -ForegroundColor Green
    } else {
        Write-Host "      [ERROR] MySQL is NOT running on port 3306." -ForegroundColor Red
        Write-Host "              Please start your MySQL server/service and re-run start-project." -ForegroundColor Red
        Write-Host "              Example command (Run as Administrator): net start MySQL80" -ForegroundColor Yellow
        exit 1
    }
}
Write-Host ""

# ---------------------------------------------------------------------------
# STEP 2: Check & Start Spring Boot Backend
# ---------------------------------------------------------------------------
Write-Host "[2/4] Checking Spring Boot Backend..." -ForegroundColor White

$jarPath = Join-Path $backendDir "target\supplier-po-management-1.0.0.jar"
if (-not (Test-Path $jarPath)) {
    Write-Host "      [ERROR] Backend executable JAR not found at:" -ForegroundColor Red
    Write-Host "              $jarPath" -ForegroundColor Yellow
    Write-Host "              Please run 'mvn package -DskipTests' inside '$backendDir' first." -ForegroundColor Yellow
    exit 1
}

if (Test-PortListening 8080) {
    $existingConn = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    Write-Host "      [OK] Backend is already running on port 8080 (PID: $($existingConn.OwningProcess)). Skipping duplicate startup." -ForegroundColor Green
} else {
    Write-Host "      [START] Launching Spring Boot in background terminal..." -ForegroundColor Cyan
    Write-Host "              Backend log: $backendLog" -ForegroundColor DarkGray

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "=== Spring Boot Started at $timestamp ===" | Out-File -FilePath $backendLog -Encoding utf8 -Append

    # Launch java jar in background terminal redirecting stdout & stderr
    $backendCmd = "title ProcureFlow-Backend && java -jar `"$jarPath`" >> `"$backendLog`" 2>&1"
    $backendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $backendCmd -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru

    Write-Host "      Waiting for port 8080 and /api/health to become available..." -ForegroundColor Yellow
    $backendReady = $false
    $timeoutSeconds = 45
    $elapsed = 0

    while ($elapsed -lt $timeoutSeconds) {
        if (Test-PortListening 8080) {
            try {
                $response = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -TimeoutSec 2 -ErrorAction Stop
                if ($response.status -eq "UP") {
                    $backendReady = $true
                    break
                }
            } catch {
                # Port open, context initializing
            }
        }
        Start-Sleep -Seconds 1
        $elapsed++
        Write-Host -NoNewline "."
    }
    Write-Host ""

    if (-not $backendReady) {
        Write-Host "      [ERROR] Backend failed to start on port 8080 within $timeoutSeconds seconds." -ForegroundColor Red
        Write-Host "              Exact log-file path: $backendLog" -ForegroundColor Red
        Write-Host "              Last 15 lines of log:" -ForegroundColor Yellow
        Get-Content $backendLog -Tail 15 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "              $_" -ForegroundColor DarkRed }
        exit 1
    }

    # Record actual listening PID
    $conn = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    $actualPid = if ($conn) { $conn.OwningProcess } else { $backendProcess.Id }
    $actualPid | Out-File -FilePath $backendPidFile -Encoding ascii -Force

    Write-Host "      [OK] Backend is healthy and listening on http://localhost:8080 (PID: $actualPid)" -ForegroundColor Green
}
Write-Host ""

# ---------------------------------------------------------------------------
# STEP 3: Check & Start Frontend (Vite)
# ---------------------------------------------------------------------------
Write-Host "[3/4] Checking Vite React Frontend..." -ForegroundColor White

if (Test-PortListening 5173) {
    $existingConn = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    Write-Host "      [OK] Frontend is already running on port 5173 (PID: $($existingConn.OwningProcess)). Skipping duplicate startup." -ForegroundColor Green
} else {
    Write-Host "      [START] Launching Vite frontend in background terminal..." -ForegroundColor Cyan
    Write-Host "              Frontend log: $frontendLog" -ForegroundColor DarkGray

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "=== Vite Frontend Started at $timestamp ===" | Out-File -FilePath $frontendLog -Encoding utf8 -Append

    # Launch npm run dev in background terminal redirecting stdout & stderr
    $frontendCmd = "title ProcureFlow-Frontend && npm run dev -- --host --port 5173 >> `"$frontendLog`" 2>&1"
    $frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $frontendCmd -WorkingDirectory $frontendDir -WindowStyle Hidden -PassThru

    Write-Host "      Waiting for port 5173 to become available..." -ForegroundColor Yellow
    $frontendReady = $false
    $timeoutSeconds = 20
    $elapsed = 0

    while ($elapsed -lt $timeoutSeconds) {
        if (Test-PortListening 5173) {
            $frontendReady = $true
            break
        }
        Start-Sleep -Seconds 1
        $elapsed++
        Write-Host -NoNewline "."
    }
    Write-Host ""

    if (-not $frontendReady) {
        Write-Host "      [ERROR] Frontend failed to start on port 5173 within $timeoutSeconds seconds." -ForegroundColor Red
        Write-Host "              Exact log-file path: $frontendLog" -ForegroundColor Red
        Get-Content $frontendLog -Tail 15 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "              $_" -ForegroundColor DarkRed }
        exit 1
    }

    # Record actual listening PID
    $conn = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    $actualPid = if ($conn) { $conn.OwningProcess } else { $frontendProcess.Id }
    $actualPid | Out-File -FilePath $frontendPidFile -Encoding ascii -Force

    Write-Host "      [OK] Frontend is active and listening on http://localhost:5173 (PID: $actualPid)" -ForegroundColor Green
}
Write-Host ""

# ---------------------------------------------------------------------------
# STEP 4: Launch Web Browser
# ---------------------------------------------------------------------------
Write-Host "[4/4] Launching Browser..." -ForegroundColor White
Start-Process "http://localhost:5173"
Write-Host "      [OK] Opened http://localhost:5173 in your default browser." -ForegroundColor Green
Write-Host ""

Write-Host "================================================================" -ForegroundColor Green
Write-Host "  ProcureFlow Development Environment is Ready!                 " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  * Frontend Web App:  http://localhost:5173" -ForegroundColor White
Write-Host "  * Backend API:       http://localhost:8080" -ForegroundColor White
Write-Host "  * Swagger API Docs:  http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host "  * Backend Health:    http://localhost:8080/api/health" -ForegroundColor White
Write-Host "  * Backend Log:       $backendLog" -ForegroundColor DarkGray
Write-Host "  * Frontend Log:      $frontendLog" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  To stop the application cleanly, run: stop-project.bat" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Green
