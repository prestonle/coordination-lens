Write-Host "`nRunning performance benchmark..." -ForegroundColor Yellow

# Test analysis speed
$testText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " * 100

Write-Host "`nBenchmarking analysis speed:" -ForegroundColor White
Write-Host "- Short text (100 chars)" -ForegroundColor Gray
Write-Host "- Medium text (1000 chars)" -ForegroundColor Gray  
Write-Host "- Long text (10000 chars)" -ForegroundColor Gray

Write-Host "`nOpen DevTools Console and run:" -ForegroundColor Yellow
Write-Host @"
// Performance benchmark
const analyzer = new CoordinationAnalyzer();
const shortText = 'This is a short test';
const longText = 'Lorem ipsum dolor sit amet. '.repeat(100);

console.time('Short analysis');
analyzer.detectDivergence(shortText, shortText);
console.timeEnd('Short analysis');

console.time('Long analysis');
analyzer.detectDivergence(longText, longText);
console.timeEnd('Long analysis');
"@ -ForegroundColor Cyan
