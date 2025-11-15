# Starts the SignBridge camera server on Windows PowerShell
param(
    [int]$Port = 5001
)

$ErrorActionPreference = 'Stop'

# Move to the script directory
Set-Location -Path $PSScriptRoot

# Activate venv if present
if (Test-Path ..\.venv\Scripts\Activate.ps1) {
    . ..\.venv\Scripts\Activate.ps1
}

$env:PORT = "$Port"
Write-Host "Starting camera server on port $Port..." -ForegroundColor Green
python camera_simple.py
