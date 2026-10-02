$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host " TEST 1: Execute start-project.ps1" -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Magenta
& powershell.exe -ExecutionPolicy Bypass -File "scripts\start-project.ps1"

Write-Host "`n==========================================================" -ForegroundColor Magenta
Write-Host " TEST 2: Verify Endpoints and Services" -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Magenta

# Check MySQL
$mysqlOk = (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue) -ne $null
Write-Host "MySQL Port 3306 Listening: $mysqlOk"
if (-not $mysqlOk) { throw "MySQL 3306 is not listening!" }

# Check Backend Port
$backendOk = (Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue) -ne $null
Write-Host "Backend Port 8080 Listening: $backendOk"
if (-not $backendOk) { throw "Backend 8080 is not listening!" }

# Check Health Endpoint
$healthResp = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -TimeoutSec 5
Write-Host "Health Check (/api/health): $($healthResp | ConvertTo-Json -Compress)"
if ($healthResp.status -ne "UP") { throw "Health status is not UP!" }

# Check Swagger UI
$swaggerResp = Invoke-WebRequest -Uri "http://localhost:8080/swagger-ui.html" -TimeoutSec 5
Write-Host "Swagger UI (/swagger-ui.html): HTTP $($swaggerResp.StatusCode)"
if ($swaggerResp.StatusCode -ne 200) { throw "Swagger UI failed!" }

# Check Frontend Port
$frontendOk = (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) -ne $null
Write-Host "Frontend Port 5173 Listening: $frontendOk"
if (-not $frontendOk) { throw "Frontend 5173 is not listening!" }

# Check Frontend HTML
$feResp = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5
Write-Host "Frontend App (http://localhost:5173): HTTP $($feResp.StatusCode)"
if ($feResp.StatusCode -ne 200) { throw "Frontend page failed!" }

Write-Host "`n==========================================================" -ForegroundColor Magenta
Write-Host " TEST 3: Duplicate Process Prevention Test" -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Magenta
$dupOutput = & powershell.exe -ExecutionPolicy Bypass -File "scripts\start-project.ps1"
Write-Host $dupOutput
if ($dupOutput -notmatch "Skipping duplicate startup") {
    throw "Duplicate prevention did not trigger!"
}
Write-Host "Duplicate prevention test: PASSED!" -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Magenta
Write-Host " TEST 4: Execute stop-project.ps1" -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Magenta
& powershell.exe -ExecutionPolicy Bypass -File "scripts\stop-project.ps1"

Write-Host "`n==========================================================" -ForegroundColor Magenta
Write-Host " TEST 5: Verify Stopped Services & MySQL Persistence" -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Magenta
Start-Sleep -Seconds 2

$backendStopped = (Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue) -eq $null
Write-Host "Port 8080 is freed: $backendStopped"

$frontendStopped = (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) -eq $null
Write-Host "Port 5173 is freed: $frontendStopped"

$mysqlStillRunning = (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue) -ne $null
Write-Host "MySQL Port 3306 is STILL RUNNING: $mysqlStillRunning"

if (-not $backendStopped) { throw "Backend port 8080 was not freed!" }
if (-not $frontendStopped) { throw "Frontend port 5173 was not freed!" }
if (-not $mysqlStillRunning) { throw "MySQL was stopped, but should remain running!" }

Write-Host "`n ALL LAUNCHER AND LIFECYCLE TESTS COMPLETED SUCCESSFULLY!" -ForegroundColor Green
