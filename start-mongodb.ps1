# Start MongoDB Service Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting MongoDB Service" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB service exists
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

if (-not $mongoService) {
    Write-Host "❌ MongoDB service not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "MongoDB might not be installed." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "1. Install MongoDB Community Server:" -ForegroundColor White
    Write-Host "   https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "2. Use MongoDB Atlas (Cloud - No installation needed):" -ForegroundColor White
    Write-Host "   https://www.mongodb.com/cloud/atlas/register" -ForegroundColor Yellow
    Write-Host "   See setup-mongodb.md for instructions" -ForegroundColor Cyan
    exit 1
}

# Check current status
Write-Host "Current Status: " -NoNewline
if ($mongoService.Status -eq "Running") {
    Write-Host "✅ Already Running" -ForegroundColor Green
    Write-Host ""
    Write-Host "MongoDB is already running. No action needed." -ForegroundColor Green
} else {
    Write-Host "❌ Stopped" -ForegroundColor Red
    Write-Host ""
    Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
    
    try {
        Start-Service -Name "MongoDB"
        Write-Host "✅ MongoDB service started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Failed to start MongoDB service" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Try running PowerShell as Administrator" -ForegroundColor Yellow
    }
}

Write-Host ""


