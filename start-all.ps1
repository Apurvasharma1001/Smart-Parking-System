# Smart Parking System - Start All Services (Backend, Frontend, OpenCV)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Smart Parking System - Starting ALL Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue 2>$null
    return $connection
}

# Check dependencies
Write-Host "Checking dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing root dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "server\node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    Set-Location server
    npm install
    Set-Location ..
}

if (-not (Test-Path "client\node_modules")) {
    Write-Host "Installing client dependencies..." -ForegroundColor Yellow
    Set-Location client
    npm install
    Set-Location ..
}

# Check OpenCV service setup
if (-not (Test-Path "server\opencv_service\venv")) {
    Write-Host "OpenCV service virtual environment not found!" -ForegroundColor Yellow
    Write-Host "Setting up OpenCV service..." -ForegroundColor Yellow
    Set-Location server\opencv_service
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    Set-Location ..\..
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Starting Services..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend Server:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend Client: http://localhost:3000" -ForegroundColor Cyan
Write-Host "OpenCV Service:  http://localhost:5001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Get the current directory
$projectRoot = Get-Location

# Start OpenCV service in a new window
Write-Host "[1/3] Starting OpenCV Service in new window..." -ForegroundColor Yellow
$opencvPath = Join-Path $projectRoot "server\opencv_service"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$opencvPath'; .\venv\Scripts\Activate.ps1; python service.py" -WindowStyle Normal

# Wait a moment for OpenCV service to start
Start-Sleep -Seconds 3

# Start Node.js services (backend and frontend) using concurrently
Write-Host "[2/3] Starting Backend and Frontend..." -ForegroundColor Yellow
Set-Location $projectRoot
npm run dev

