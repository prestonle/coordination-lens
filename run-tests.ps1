Write-Host "`n🧪 TESTING JACCARD IMPLEMENTATION" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Test 1: Identical responses
$response1 = "AI can help with many tasks"
$response2 = "AI can help with many tasks"
Write-Host "`nTest 1 - Identical:" -ForegroundColor Yellow
Write-Host "Expected: 0% divergence"

# Test 2: Similar but different
$response1 = "Machine learning is a subset of artificial intelligence"
$response2 = "Artificial intelligence includes machine learning as a subset"
Write-Host "`nTest 2 - Similar:" -ForegroundColor Yellow
Write-Host "Expected: ~20-30% divergence"

# Test 3: Very different
$response1 = "The weather today is sunny and warm"
$response2 = "Programming requires logical thinking and practice"
Write-Host "`nTest 3 - Different:" -ForegroundColor Yellow
Write-Host "Expected: ~90-100% divergence"

Write-Host "`n✅ Open test-jaccard.html in your browser to test with real AI responses!" -ForegroundColor Green
Start-Process "test-jaccard.html"
