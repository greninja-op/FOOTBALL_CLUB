# ============================================================
# LaTeX Build Script — Football Club Management System Report
# Usage: .\build.ps1
# Compiles main.tex → main.pdf (3 passes for cross-references)
# ============================================================

$ErrorActionPreference = "Continue"
$reportDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$texFile = Join-Path $reportDir "main.tex"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Building LaTeX Report..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Pass 1
Write-Host "[1/3] First pass..." -ForegroundColor Yellow
pdflatex -interaction=nonstopmode -output-directory="$reportDir" "$texFile" 2>&1 | Out-Null

# Pass 2
Write-Host "[2/3] Second pass (resolving references)..." -ForegroundColor Yellow
pdflatex -interaction=nonstopmode -output-directory="$reportDir" "$texFile" 2>&1 | Out-Null

# Pass 3
Write-Host "[3/3] Third pass (finalizing)..." -ForegroundColor Yellow
pdflatex -interaction=nonstopmode -output-directory="$reportDir" "$texFile" 2>&1 | Out-Null

# Check result
$pdf = Join-Path $reportDir "main.pdf"
if (Test-Path $pdf) {
    $info = Get-Item $pdf
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "  Output: $pdf" -ForegroundColor Green
    Write-Host "  Size:   $([math]::Round($info.Length / 1024)) KB" -ForegroundColor Green
    Write-Host "  Time:   $($info.LastWriteTime)" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green

    # Open PDF
    Start-Process $pdf
} else {
    Write-Host "`n  BUILD FAILED — check main.log for errors" -ForegroundColor Red
}
