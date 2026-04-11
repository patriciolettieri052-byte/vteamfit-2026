$videoDir = "C:\Users\matil\OneDrive\Desktop\vicky\plan gluteos"
$thumbDir = ".\public\thumbnails"

New-Item -ItemType Directory -Force -Path $thumbDir | Out-Null

$videos = Get-ChildItem -Path $videoDir -Include "*.mp4","*.mov","*.MP4","*.MOV" -Recurse

foreach ($video in $videos) {
    $slug = $video.BaseName.ToLower() -replace ' ', '-'
    $outputPath = Join-Path $thumbDir "$slug.jpg"
    
    Write-Host "Procesando: $($video.Name) → $slug.jpg"
    
    ffmpeg -i $video.FullName -ss 00:00:01 -vframes 1 -vf "scale=480:270" $outputPath -y -loglevel quiet
    
    if (Test-Path $outputPath) {
        Write-Host "✅ $slug.jpg generado"
    } else {
        Write-Host "⚠️ Error generando $slug.jpg"
    }
}

Write-Host ""
Write-Host "Thumbnails generados en: $thumbDir"
Write-Host "Total: $((Get-ChildItem $thumbDir -Filter '*.jpg').Count) archivos"
