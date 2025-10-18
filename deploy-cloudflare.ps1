# Deploy script cho Cloudflare Workers
# Run this with: powershell -ExecutionPolicy Bypass -File deploy-cloudflare.ps1

$NODE_PATH = "C:\Program Files\nodejs"
$env:Path = "$NODE_PATH;$env:Path"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Cloudflare Workers Deployment  " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if wrangler is installed
Write-Host "Checking Wrangler installation..." -ForegroundColor Yellow
$wranglerInstalled = Test-Path "$NODE_PATH\wrangler.cmd"

if (-not $wranglerInstalled) {
    Write-Host "Installing Wrangler CLI..." -ForegroundColor Yellow
    & "$NODE_PATH\npm.cmd" install -g wrangler
    Write-Host "Wrangler installed!" -ForegroundColor Green
}

# Login to Cloudflare
Write-Host ""
Write-Host "Step 1: Login to Cloudflare" -ForegroundColor Yellow
Write-Host "A browser window will open. Please login to Cloudflare." -ForegroundColor Gray
& "$NODE_PATH\npx.cmd" wrangler login

# Deploy
Write-Host ""
Write-Host "Step 2: Deploying to Cloudflare Workers..." -ForegroundColor Yellow
& "$NODE_PATH\npx.cmd" wrangler deploy

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  Deployment Complete! 🎉        " -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your site is now live on Cloudflare Workers!" -ForegroundColor Green
Write-Host "Check the URL above for your deployed site." -ForegroundColor Gray
