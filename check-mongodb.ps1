# MongoDB Connection Checker
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MongoDB Connection Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
$envPath = "server\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file not found at: $envPath" -ForegroundColor Red
    Write-Host "   Please create server/.env file with MONGODB_URI" -ForegroundColor Yellow
    exit 1
}

# Read MONGODB_URI from .env
$envContent = Get-Content $envPath
$mongodbUri = ($envContent | Select-String "MONGODB_URI=").ToString().Split("=")[1]

if (-not $mongodbUri) {
    Write-Host "❌ MONGODB_URI not found in .env file" -ForegroundColor Red
    exit 1
}

Write-Host "📋 MongoDB URI: $mongodbUri" -ForegroundColor Yellow
Write-Host ""

# Check if it's local or Atlas
if ($mongodbUri -like "*mongodb+srv://*") {
    Write-Host "🌐 Detected: MongoDB Atlas (Cloud)" -ForegroundColor Green
    Write-Host "   Testing connection..." -ForegroundColor Yellow
    
    # Test Atlas connection (requires node)
    Write-Host "   Run 'npm run dev' to test connection" -ForegroundColor Cyan
} else {
    Write-Host "💻 Detected: Local MongoDB" -ForegroundColor Green
    
    # Check if MongoDB service is running
    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    
    if ($mongoService) {
        Write-Host "   Service Status: " -NoNewline
        if ($mongoService.Status -eq "Running") {
            Write-Host "✅ Running" -ForegroundColor Green
        } else {
            Write-Host "❌ Stopped" -ForegroundColor Red
            Write-Host ""
            Write-Host "   To start MongoDB service:" -ForegroundColor Yellow
            Write-Host "   Start-Service MongoDB" -ForegroundColor Cyan
            Write-Host "   Or use Services app (services.msc)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   ⚠️  MongoDB service not found" -ForegroundColor Yellow
        Write-Host "   MongoDB might not be installed or service name is different" -ForegroundColor Yellow
    }
    
    # Check if port 27017 is listening
    Write-Host ""
    Write-Host "   Checking port 27017..." -ForegroundColor Yellow
    $portCheck = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    
    if ($portCheck.TcpTestSucceeded) {
        Write-Host "   ✅ Port 27017 is open" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Port 27017 is not accessible" -ForegroundColor Red
        Write-Host "   MongoDB is not running or not listening on port 27017" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Ensure MongoDB is running (local) or connection string is correct (Atlas)" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Look for: ✅ MongoDB Connected" -ForegroundColor White
Write-Host ""


