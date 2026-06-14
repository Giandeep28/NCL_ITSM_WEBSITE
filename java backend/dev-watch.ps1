# =============================================================================
# NCL ITSM Platform — Java Auto-Build Watcher
# =============================================================================
# HOW IT WORKS:
#   1. Watches all src/main/java folders in every module for .java file changes
#   2. When a .java file is saved, runs: mvn install -DskipTests (full rebuild)
#   3. Spring Boot DevTools detects the new .class files and auto-restarts server
#
# USAGE:
#   Open TWO terminals in:  D:\GIANDEEP MAIN\NCL_ITSM_SOFTWARE_WEBSITE\java backend
#
#   Terminal 1 (Watcher — run this first):
#     .\dev-watch.ps1
#
#   Terminal 2 (Server):
#     .\.maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run -pl ncl-itsm-config
#
# =============================================================================

$MVN       = ".\.maven\apache-maven-3.9.6\bin\mvn.cmd"
$WATCH_DIR = "$PSScriptRoot\ncl-itsm-modules"
$DEBOUNCE  = 3   # seconds to wait after last change before rebuilding

# ── Colours ──────────────────────────────────────────────────────────────────
function Write-Info  ($msg) { Write-Host "  [INFO]  $msg" -ForegroundColor Cyan    }
function Write-Ok    ($msg) { Write-Host "  [OK]    $msg" -ForegroundColor Green   }
function Write-Warn  ($msg) { Write-Host "  [WARN]  $msg" -ForegroundColor Yellow  }
function Write-Err   ($msg) { Write-Host "  [ERROR] $msg" -ForegroundColor Red     }
function Write-Build ($msg) { Write-Host "  [BUILD] $msg" -ForegroundColor Magenta }

# ── Banner ────────────────────────────────────────────────────────────────────
Clear-Host
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════════════════╗" -ForegroundColor DarkCyan
Write-Host "  ║        NCL ITSM Platform — Auto Build Watcher           ║" -ForegroundColor DarkCyan
Write-Host "  ╚══════════════════════════════════════════════════════════╝" -ForegroundColor DarkCyan
Write-Host ""
Write-Info "Watching: $WATCH_DIR"
Write-Info "Trigger : Any .java file save"
Write-Info "Action  : mvn install -DskipTests (all modules)"
Write-Host ""
Write-Ok   "Watcher started. Waiting for changes..."
Write-Host ""

# ── Initial build to ensure everything is compiled ───────────────────────────
Write-Build "Running initial build to sync all modules..."
$initialResult = & $MVN install -DskipTests -q 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Ok "Initial build complete. Server is ready."
} else {
    Write-Warn "Initial build had warnings/errors. Check output above."
    Write-Host ($initialResult | Out-String) -ForegroundColor Yellow
}
Write-Host ""

# ── Set up FileSystemWatcher ─────────────────────────────────────────────────
$watcher                     = New-Object System.IO.FileSystemWatcher
$watcher.Path                = $WATCH_DIR
$watcher.Filter              = "*.java"
$watcher.IncludeSubdirectories = $true
$watcher.NotifyFilter        = [System.IO.NotifyFilters]::LastWrite -bor
                               [System.IO.NotifyFilters]::FileName

$watcher.EnableRaisingEvents = $true

# ── Debounce state ────────────────────────────────────────────────────────────
$lastChangedFile = ""
$lastChangeTime  = [DateTime]::MinValue
$buildPending    = $false

# ── Event handler ─────────────────────────────────────────────────────────────
$onChange = {
    param($source, $e)
    $script:lastChangedFile = $e.FullPath
    $script:lastChangeTime  = [DateTime]::Now
    $script:buildPending    = $true
}

Register-ObjectEvent $watcher Changed -Action $onChange | Out-Null
Register-ObjectEvent $watcher Created -Action $onChange | Out-Null
Register-ObjectEvent $watcher Renamed -Action $onChange | Out-Null

# ── Main polling loop ─────────────────────────────────────────────────────────
try {
    while ($true) {
        Start-Sleep -Milliseconds 500

        if ($buildPending) {
            $elapsed = ([DateTime]::Now - $lastChangeTime).TotalSeconds

            if ($elapsed -ge $DEBOUNCE) {
                $buildPending = $false

                # Get relative path for display
                $relPath = $lastChangedFile.Replace($WATCH_DIR, "").TrimStart("\")

                Write-Host ""
                Write-Host "  ─────────────────────────────────────────────────────" -ForegroundColor DarkGray
                Write-Build "Change detected: $relPath"
                Write-Build "Rebuilding all modules (mvn install -DskipTests)..."

                $stopwatch = [Diagnostics.Stopwatch]::StartNew()
                & $MVN install -DskipTests -q
                $stopwatch.Stop()
                $elapsed = [Math]::Round($stopwatch.Elapsed.TotalSeconds, 1)

                if ($LASTEXITCODE -eq 0) {
                    Write-Ok   "Build SUCCESS in ${elapsed}s — Spring Boot DevTools will auto-restart."
                } else {
                    Write-Err  "Build FAILED in ${elapsed}s — Fix the errors above and save again."
                }
                Write-Host "  ─────────────────────────────────────────────────────" -ForegroundColor DarkGray
                Write-Host ""
                Write-Info "Watching for next change..."
            }
        }
    }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Warn "Watcher stopped."
}
