$exercises = Get-Content -Raw -Path "C:\Users\matil\.gemini\antigravity\scratch\vteamfit-demo\exercises.json" | ConvertFrom-Json
$rootDir = "C:\Users\matil\BACKUP\VIDEOS_STAGING"
$total = $exercises.Count
$current = 0
$success = 0
$failed = 0

Write-Host "Starting video processing ($total videos)..." -ForegroundColor Cyan

foreach ($ex in $exercises) {
    $current++
    $videoName = $ex.video
    $carpeta = $ex.carpeta
    $start = $ex.inicio
    $end = $ex.fin
    
    $inputFile = Join-Path $rootDir "$carpeta\for-editing\$videoName.mp4"
    $outputFile = Join-Path $rootDir "$carpeta\$videoName.mp4"
    
    Write-Host "[$current/$total] Processing: $videoName in $carpeta..." -NoNewline
    
    if (-Not (Test-Path $inputFile)) {
        Write-Host " FAILED (Input file not found)" -ForegroundColor Red
        $failed++
        continue
    }
    
    # Run FFmpeg
    # -y to overwrite
    # -ss before -i for faster seeking (as precision isn't critical)
    # -an to remove audio
    # -preset ultrafast for speed
    $ffmpegCmd = "ffmpeg -y -ss $start -to $end -i `"$inputFile`" -c:v libx264 -crf 23 -preset ultrafast -an `"$outputFile`""
    
    Invoke-Expression $ffmpegCmd 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " DONE" -ForegroundColor Green
        $success++
    } else {
        Write-Host " FAILED (FFmpeg error)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`nProcessing Complete!" -ForegroundColor Cyan
Write-Host "Total: $total"
Write-Host "Success: $success" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
