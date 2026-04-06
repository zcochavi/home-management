$folder = "C:\private projects\FamilyHub"
$file   = "index.html"

$watcher = New-Object System.IO.FileSystemWatcher $folder, $file
$watcher.NotifyFilter = [System.IO.NotifyFilters]'LastWrite'
$watcher.EnableRaisingEvents = $true

Write-Host "Watching $folder\$file  —  press Ctrl+C to stop." -ForegroundColor Cyan
Write-Host ""

$action = {
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "[$ts] Change detected — refreshing browser..." -ForegroundColor Green
    Start-Sleep -Milliseconds 150    # let the write flush
    $ws = New-Object -ComObject WScript.Shell
    $activated = $ws.AppActivate("Google Chrome") -or
                 $ws.AppActivate("Firefox")        -or
                 $ws.AppActivate("Microsoft Edge") -or
                 $ws.AppActivate("Chromium")
    if ($activated) {
        Start-Sleep -Milliseconds 100
        $ws.SendKeys("{F5}")
    } else {
        Write-Host "  (no browser window found to focus)" -ForegroundColor Yellow
    }
}

Register-ObjectEvent $watcher Changed -Action $action | Out-Null

try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    $watcher.Dispose()
    Write-Host "`nWatcher stopped." -ForegroundColor Red
}
