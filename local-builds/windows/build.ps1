#!/usr/bin/env pwsh
# ============================================================================
# Neural Voice OS - Windows PowerShell Build Script
# ============================================================================
# This advanced script builds the Neural Voice OS application for Windows.
# Supports both Electron and Tauri builds with enhanced features.
# ============================================================================

[CmdletBinding(DefaultParameterSetName = 'Default')]
param(
    [Parameter(ParameterSetName = 'Default')]
    [ValidateSet('electron', 'tauri')]
    [string]$Mode = 'tauri',
    
    [Parameter(ParameterSetName = 'Default')]
    [ValidateSet('x64', 'ia32')]
    [string]$Arch = 'x64',
    
    [Parameter(ParameterSetName = 'Default')]
    [ValidateSet('release', 'debug')]
    [string]$Config = 'release',
    
    [Parameter(ParameterSetName = 'Default')]
    [switch]$Clean,
    
    [Parameter(ParameterSetName = 'Default')]
    [switch]$Verbose,
    
    [Parameter(ParameterSetName = 'Help')]
    [switch]$Help
)

# ============================================================================
# Configuration and Setup
# ============================================================================

$ErrorActionPreference = 'Stop'
$Script:StartTime = Get-Date

# ANSI color codes
$Colors = @{
    Green  = [System.ConsoleColor]::Green
    Red    = [System.ConsoleColor]::Red
    Yellow = [System.ConsoleColor]::Yellow
    Cyan   = [System.ConsoleColor]::Cyan
    White  = [System.ConsoleColor]::White
    NC     = [System.ConsoleColor]::Gray
}

function Write-Color {
    param(
        [Parameter(Mandatory)]
        [string]$Message,
        
        [Parameter(Mandatory)]
        [System.ConsoleColor]$ForegroundColor,
        
        [System.ConsoleColor]$BackgroundColor = [System.ConsoleColor]::Black
    )
    
    $originalBg = [System.Console]::BackgroundColor
    $originalFg = [System.Console]::ForegroundColor
    
    [System.Console]::ForegroundColor = $ForegroundColor
    if ($BackgroundColor) {
        [System.Console]::BackgroundColor = $BackgroundColor
    }
    
    Write-Host $Message -NoNewline
    [System.Console]::ResetColor()
}

function Write-Section {
    param(
        [int]$Step,
        [int]$Total,
        [string]$Message
    )
    
    Write-Host "`n"
    Write-Color "[$Step/$Total] " -ForegroundColor Yellow
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "  " -NoNewline
    Write-Color "✓" -ForegroundColor Green
    Write-Host " $Message" -ForegroundColor White
}

function Write-Error {
    param([string]$Message)
    Write-Host "  " -NoNewline
    Write-Color "✗" -ForegroundColor Red
    Write-Host " $Message" -ForegroundColor White
}

function Write-Warning {
    param([string]$Message)
    Write-Host "  " -NoNewline
    Write-Color "⚠" -ForegroundColor Yellow
    Write-Host " $Message" -ForegroundColor White
}

function Write-Info {
    param([string]$Message)
    Write-Host "  " -NoNewline
    Write-Color "●" -ForegroundColor Cyan
    Write-Host " $Message" -ForegroundColor White
}

function Show-Help {
    Write-Host @"

Neural Voice OS - Windows Build Script (PowerShell)
==================================================

Usage:
    .\build.ps1 [-Mode <electron|tauri>] [-Arch <x64|ia32>] 
                [-Config <release|debug>] [-Clean] [-Verbose]

Parameters:
    -Mode      Build mode: electron or tauri (default: tauri)
    -Arch      Target architecture: x64 or ia32 (default: x64)
    -Config    Build configuration: release or debug (default: release)
    -Clean     Clean build artifacts before building
    -Verbose   Enable verbose output
    -Help      Show this help message

Examples:
    .\build.ps1                              # Build Tauri x64 release
    .\build.ps1 -Mode electron               # Build Electron instead
    .\build.ps1 -Arch ia32                   # Build for 32-bit Windows
    .\build.ps1 -Clean -Verbose              # Clean build with verbose output

Requirements:
    - Node.js 18+
    - npm 9+
    - Rust/Cargo (for Tauri builds)
    - Visual Studio C++ Build Tools
    - Windows SDK 10+

"@
    exit 0
}

# ============================================================================
# Main Execution
# ============================================================================

function Main {
    # Change to project root
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    Set-Location -Path (Join-Path $ScriptDir '..\..')
    
    Write-Host "`n"
    Write-Color "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Color "║         Neural Voice OS - Windows Build Script              ║" -ForegroundColor Cyan
    Write-Color "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    # Step 1: Check Prerequisites
    Write-Section -Step 1 -Total 5 -Message "Checking prerequisites..."
    
    $missingPrereqs = @()
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js $($nodeVersion -replace 'v', '')"
    } catch {
        Write-Error "Node.js not found"
        $missingPrereqs += "Node.js"
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm $($npmVersion)"
    } catch {
        Write-Error "npm not found"
        $missingPrereqs += "npm"
    }
    
    # Check Rust (if building Tauri)
    if ($Mode -eq 'tauri') {
        try {
            $rustVersion = cargo --version 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success $rustVersion
            } else {
                throw
            }
        } catch {
            Write-Error "Rust/Cargo not found (required for Tauri)"
            $missingPrereqs += "Rust/Cargo"
        }
    }
    
    # Check Visual Studio Build Tools
    $vsKey = Get-Item "HKLM:\SOFTWARE\Microsoft\VisualStudio\Setup" -ErrorAction SilentlyContinue
    if (-not $vsKey) {
        $vsKey = Get-Item "HKLM:\SOFTWARE\Wow6432Node\Microsoft\VisualStudio\Setup" -ErrorAction SilentlyContinue
    }
    
    if ($vsKey) {
        Write-Success "Visual Studio Build Tools detected"
    } else {
        Write-Warning "Visual Studio Build Tools not detected"
        Write-Warning "Tauri builds require Microsoft C++ Build Tools"
        Write-Info "Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/"
    }
    
    if ($missingPrereqs.Count -gt 0) {
        Write-Host ""
        Write-Error "Missing required prerequisites:"
        $missingPrereqs | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        Write-Host ""
        Write-Host "Please install the missing components and try again." -ForegroundColor Yellow
        exit 1
    }
    
    # Step 2: Install Dependencies
    Write-Section -Step 2 -Total 5 -Message "Installing dependencies..."
    
    if (-not (Test-Path 'node_modules')) {
        try {
            Write-Info "Running npm install..."
            npm install --no-progress --loglevel=error
            
            if ($LASTEXITCODE -ne 0) {
                throw "npm install failed"
            }
            Write-Success "Dependencies installed"
        } catch {
            Write-Error "Failed to install dependencies: $_"
            exit 1
        }
    } else {
        Write-Info "Dependencies already installed, skipping npm install"
    }
    
    # Step 3: Prepare Build
    Write-Section -Step 3 -Total 5 -Message "Preparing build..."
    
    if ($Clean) {
        Write-Info "Cleaning previous build artifacts..."
        
        if (Test-Path 'dist') {
            Remove-Item -Recurse -Force 'dist' -ErrorAction SilentlyContinue
        }
        if (Test-Path 'builds\tauri\target') {
            Remove-Item -Recurse -Force 'builds\tauri\target' -ErrorAction SilentlyContinue
        }
        
        Write-Success "Build artifacts cleaned"
    }
    
    # Create output directory
    if (-not (Test-Path 'dist')) {
        New-Item -ItemType Directory -Force -Path 'dist' | Out-Null
    }
    
    # Step 4: Build Application
    Write-Section -Step 4 -Total 5 -Message "Building for Windows $Arch-bit ($Mode)..."
    
    if ($Mode -eq 'electron') {
        Write-Info "Building Electron application..."
        
        $buildArgs = @('--win', "--$Config", "--$Arch")
        
        if ($Verbose) {
            npx electron-builder @buildArgs
        } else {
            npx electron-builder @buildArgs 2>&1 | Where-Object { 
                $_ -notmatch '\[webpack' -and 
                $_ -notmatch 'building' -and 
                $_ -notmatch 'processing' 
            } | ForEach-Object { Write-Host $_ }
        }
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Electron build failed"
            exit 1
        }
        Write-Success "Electron build complete"
        
    } elseif ($Mode -eq 'tauri') {
        Write-Info "Building Tauri application..."
        
        $target = "$Arch-pc-windows-msvc"
        
        Set-Location -Path 'builds\tauri'
        
        $cargoArgs = @('build', '--bundles', 'msi', '--target', $target)
        if ($Config -eq 'release') {
            $cargoArgs += '--release'
        }
        
        if ($Verbose) {
            cargo @cargoArgs
        } else {
            cargo @cargoArgs 2>&1 | Where-Object { 
                $_ -notmatch 'Finished' -and 
                $_ -notmatch 'Compiling' -and 
                $_ -notmatch 'Downloading' 
            } | ForEach-Object { Write-Host $_ }
        }
        
        if ($LASTEXITCODE -ne 0) {
            Set-Location -Path '..\..'
            Write-Error "Tauri build failed"
            exit 1
        }
        
        Set-Location -Path '..\..'
        
        # Copy build artifacts
        $bundlePath = "builds\tauri\target\$target\$Config\bundle\msi"
        $outputPath = "dist\windows\tauri\$Arch"
        
        if (Test-Path $bundlePath) {
            if (-not (Test-Path $outputPath)) {
                New-Item -ItemType Directory -Force -Path $outputPath | Out-Null
            }
            
            Copy-Item "$bundlePath\*.msi" $outputPath -ErrorAction SilentlyContinue
            Copy-Item "$bundlePath\*.exe" $outputPath -ErrorAction SilentlyContinue
            
            Write-Success "Build artifacts copied to dist\windows\tauri\$Arch"
        }
    }
    
    # Step 5: Summary
    Write-Section -Step 5 -Total 5 -Message "Build Summary:"
    
    Write-Host "  " -NoNewline
    Write-Color "Mode:      " -ForegroundColor Green
    Write-Host $Mode -ForegroundColor White
    Write-Host "  " -NoNewline
    Write-Color "Arch:      " -ForegroundColor Green
    Write-Host "$Arch-bit" -ForegroundColor White
    Write-Host "  " -NoNewline
    Write-Color "Config:    " -ForegroundColor Green
    Write-Host $Config -ForegroundColor White
    Write-Host "  " -NoNewline
    Write-Color "Platform:  " -ForegroundColor Green
    Write-Host "Windows" -ForegroundColor White
    
    $elapsed = New-TimeSpan -Start $Script:StartTime -End (Get-Date)
    Write-Host "  " -NoNewline
    Write-Color "Time:      " -ForegroundColor Green
    Write-Host ("{0:mm}m {0:ss}s" -f $elapsed) -ForegroundColor White
    
    Write-Host ""
    Write-Host ""
    Write-Color "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Color "║                    Build Complete!                           ║" -ForegroundColor Green
    Write-Color "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    # Display output files
    if (Test-Path 'dist') {
        Write-Color "Build artifacts:" -ForegroundColor Cyan
        Get-ChildItem -Path 'dist' -Recurse -Filter '*.exe' -ErrorAction SilentlyContinue | 
            ForEach-Object { Write-Host "  - $($_.FullName.Replace((Get-Location).Path, '').TrimStart('\', '/'))" -ForegroundColor White }
        Get-ChildItem -Path 'dist' -Recurse -Filter '*.msi' -ErrorAction SilentlyContinue | 
            ForEach-Object { Write-Host "  - $($_.FullName.Replace((Get-Location).Path, '').TrimStart('\', '/'))" -ForegroundColor White }
    }
    
    Write-Host ""
}

# Run main function or show help
if ($Help) {
    Show-Help
} else {
    Main
}
