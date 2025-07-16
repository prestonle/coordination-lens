Write-Host "`nTo capture screenshots:" -ForegroundColor Cyan
Write-Host "1. Open each HTML file in Chrome" -ForegroundColor Yellow
Write-Host "2. Press F12 to open DevTools" -ForegroundColor Yellow
Write-Host "3. Click the device toolbar icon (or Ctrl+Shift+M)" -ForegroundColor Yellow
Write-Host "4. Set dimensions to 1280x800" -ForegroundColor Yellow
Write-Host "5. Take screenshot with DevTools capture button" -ForegroundColor Yellow
Write-Host "`nOpening screenshot templates..." -ForegroundColor Green

Start-Process "$PWD\chrome-store-assets\screenshot-1-template.html"
