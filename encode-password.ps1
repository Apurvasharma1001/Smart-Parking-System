# Password URL Encoder for MongoDB Connection String
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MongoDB Password URL Encoder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$password = Read-Host "Enter your MongoDB password (it will be hidden)"

if ([string]::IsNullOrWhiteSpace($password)) {
    Write-Host "❌ Password cannot be empty!" -ForegroundColor Red
    exit 1
}

# URL encode the password
$encodedPassword = [System.Web.HttpUtility]::UrlEncode($password)

Write-Host ""
Write-Host "✅ Encoded Password: $encodedPassword" -ForegroundColor Green
Write-Host ""

# Show the full connection string
$clusterUrl = "parkit.or61wwr.mongodb.net"
$username = "apurvasharmahk"

$connectionString = "mongodb+srv://$username`:$encodedPassword@$clusterUrl/smart-parking?retryWrites=true&w=majority"

Write-Host "📋 Full Connection String:" -ForegroundColor Yellow
Write-Host $connectionString -ForegroundColor White
Write-Host ""

# Ask if user wants to update .env file
$update = Read-Host "Do you want to update server/.env file? (y/n)"

if ($update -eq "y" -or $update -eq "Y") {
    $envPath = "server\.env"
    
    if (Test-Path $envPath) {
        $content = Get-Content $envPath
        $newContent = $content | ForEach-Object {
            if ($_ -match "^MONGODB_URI=") {
                "MONGODB_URI=$connectionString"
            } else {
                $_
            }
        }
        $newContent | Set-Content $envPath
        Write-Host "✅ Updated server/.env file!" -ForegroundColor Green
    } else {
        Write-Host "❌ server/.env file not found!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan


