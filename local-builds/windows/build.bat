@echo off
REM ============================================================================
REM Neural Voice OS - Windows Build Script
REM ============================================================================
REM This script builds the Neural Voice OS application for Windows platforms.
REM Supports both Electron and Tauri builds for x64 and ia32 architectures.
REM ============================================================================

setlocal EnableDelayedExpansion

REM Color codes for output
for /f "delims=#" %%a in ('"prompt #$E# & for %%b in (1) do rem"') do set "ESC=%%a"

set "GREEN=%ESC%[0;32m"
set "RED=%ESC%[0;31m"
set "YELLOW=%ESC%[0;33m"
set "CYAN=%ESC%[0;36m"
set "NC=%ESC%[0m"

REM Default configuration
set "MODE=tauri"
set "ARCH=x64"
set "CONFIG=release"
set "CLEAN=0"
set "VERBOSE=0"

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :end_parse
if /i "%~1"=="-Mode"      set "MODE=%~2" & shift & goto :parse_args
if /i "%~1"=="-Arch"      set "ARCH=%~2" & shift & goto :parse_args
if /i "%~1"=="-Config"    set "CONFIG=%~2" & shift & goto :parse_args
if /i "%~1"=="-Clean"     set "CLEAN=1" & goto :parse_args
if /i "%~1"=="-Verbose"   set "VERBOSE=1" & goto :parse_args
if /i "%~1"=="-Help"      goto :show_help
if /i "%~1"=="/?"         goto :show_help
shift
goto :parse_args

:end_parse

REM Change to project root directory
cd /d "%~dp0..\.."

echo.
echo %CYAN%╔══════════════════════════════════════════════════════════════╗%NC%
echo %CYAN%║         Neural Voice OS - Windows Build Script              ║%NC%
echo %CYAN%╚══════════════════════════════════════════════════════════════╝%NC%
echo.

REM ============================================================================
REM Step 1: Check Prerequisites
REM ============================================================================
echo %YELLOW%[1/5]%NC% Checking prerequisites...

set "MISSING_PREREQS="

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo %RED%  ✗ Node.js not found%NC%
    set "MISSING_PREREQS=!MISSING_PREREQS! Node.js"
) else (
    for /f "usebackq delims=" %%i in (`node --version`) do set "NODE_VERSION=%%i"
    echo %GREEN%  ✓ Node.js !NODE_VERSION!%NC%
)

REM Check npm
where npm >nul 2>nul
if errorlevel 1 (
    echo %RED%  ✗ npm not found%NC%
    set "MISSING_PREREQS=!MISSING_PREREQS! npm"
) else (
    for /f "usebackq delims=" %%i in (`npm --version`) do set "NPM_VERSION=%%i"
    echo %GREEN%  ✓ npm !NPM_VERSION!%NC%
)

REM Check Rust if building Tauri
if /i "%MODE%"=="tauri" (
    where cargo >nul 2>nul
    if errorlevel 1 (
        echo %RED%  ✗ Rust/Cargo not found (required for Tauri)%NC%
        set "MISSING_PREREQS=!MISSING_PREREQS! Rust/Cargo"
    ) else (
        for /f "usebackq delims=" %%i in (`cargo --version`) do set "RUST_VERSION=%%i"
        echo %GREEN%  ✓ !RUST_VERSION!%NC%
    )
)

REM Check Visual Studio Build Tools
reg query "HKLM\SOFTWARE\Microsoft\VisualStudio\Setup" >nul 2>nul
if errorlevel 1 (
    reg query "HKLM\SOFTWARE\Wow6432Node\Microsoft\VisualStudio\Setup" >nul 2>nul
    if errorlevel 1 (
        echo %YELLOW%  ⚠ Visual Studio Build Tools not detected%NC%
        echo %YELLOW%    Tauri builds require Microsoft C++ Build Tools%NC%
        echo %YELLOW%    Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/%NC%
    ) else (
        echo %GREEN%  ✓ Visual Studio Build Tools detected%NC%
    )
)

if defined MISSING_PREREQS (
    echo.
    echo %RED%Error: Missing required prerequisites:%NC%
    echo !MISSING_PREREQS!
    echo.
    echo Please install the missing components and try again.
    exit /b 1
)

REM ============================================================================
REM Step 2: Install Dependencies
REM ============================================================================
echo.
echo %YELLOW%[2/5]%NC% Installing dependencies...

if exist node_modules (
    echo %CYAN%  Dependencies already installed, skipping npm install%NC%
) else (
    echo %CYAN%  Running npm install...%NC%
    npm install --no-progress
    if errorlevel 1 (
        echo %RED%  ✗ npm install failed%NC%
        exit /b 1
    )
    echo %GREEN%  ✓ Dependencies installed%NC%
)

REM ============================================================================
REM Step 3: Clean Build (if requested)
REM ============================================================================
echo.
echo %YELLOW%[3/5]%NC% Preparing build...

if "%CLEAN%"=="1" (
    echo %CYAN%  Cleaning previous build artifacts...%NC%
    if exist dist rmdir /s /q dist 2>nul
    if exist builds\tauri\target rmdir /s /q builds\tauri\target 2>nul
    echo %GREEN%  ✓ Build artifacts cleaned%NC%
)

REM Create output directory
if not exist dist mkdir dist

REM ============================================================================
REM Step 4: Build Application
REM ============================================================================
echo.
echo %YELLOW%[4/5]%NC% Building for Windows !ARCH!-bit (!MODE!)...

if /i "%MODE%"=="electron" (
    echo %CYAN%  Building Electron application...%NC%
    
    set "BUILD_ARGS=--win --!CONFIG! --!ARCH!"
    
    if "!VERBOSE!"=="1" (
        npx electron-builder !BUILD_ARGS!
    ) else (
        npx electron-builder !BUILD_ARGS! 2>&1 | findstr /v /c:"\[webpack" /c:"building" /c:"processing"
    )
    
    if errorlevel 1 (
        echo %RED%  ✗ Electron build failed%NC%
        exit /b 1
    )
    echo %GREEN%  ✓ Electron build complete%NC%
    
) else if /i "%MODE%"=="tauri" (
    echo %CYAN%  Building Tauri application...%NC%
    
    cd builds\tauri
    
    if "!VERBOSE!"=="1" (
        cargo tauri build --bundles msi --target !ARCH!-pc-windows-msvc
    ) else (
        cargo tauri build --bundles msi --target !ARCH!-pc-windows-msvc 2>&1 | findstr /v /c:"Finished" /c:"Compiling" /c:"Downloading"
    )
    
    if errorlevel 1 (
        echo %RED%  ✗ Tauri build failed%NC%
        cd ..\..
        exit /b 1
    )
    
    cd ..\..
    
    REM Copy build artifacts
    if exist "builds\tauri\target\!ARCH!-pc-windows-msvc\release\bundle\msi" (
        if not exist "dist\windows\tauri\!ARCH!" mkdir "dist\windows\tauri\!ARCH!"
        copy "builds\tauri\target\!ARCH!-pc-windows-msvc\release\bundle\msi\*.msi" "dist\windows\tauri\!ARCH!\" >nul
        copy "builds\tauri\target\!ARCH!-pc-windows-msvc\release\bundle\msi\*.exe" "dist\windows\tauri\!ARCH!\" >nul
    )
    
    echo %GREEN%  ✓ Tauri build complete%NC%
)

REM ============================================================================
REM Step 5: Summary
REM ============================================================================
echo.
echo %YELLOW%[5/5]%NC% Build Summary:

echo %GREEN%  Mode:      !MODE!%NC%
echo %GREEN%  Arch:      !ARCH!-bit%NC%
echo %GREEN%  Config:    !CONFIG!%NC%
echo %GREEN%  Platform:  Windows%NC%

echo.
if exist dist (
    echo %GREEN%  Output:     dist\windows\%NC%
    echo.
    echo %CYAN%  Build artifacts:%NC%
    dir /b dist 2>nul
) else (
    echo %YELLOW%  ⚠ No output directory found%NC%
)

echo.
echo %GREEN%╔══════════════════════════════════════════════════════════════╗%NC%
echo %GREEN%║                    Build Complete!                           ║%NC%
echo %GREEN%╚══════════════════════════════════════════════════════════════╝%NC%
echo.

exit /b 0

REM ============================================================================
REM Help Message
REM ============================================================================
:show_help
echo.
echo Neural Voice OS - Windows Build Script
echo.
echo Usage: build.bat [options]
echo.
echo Options:
echo   -Mode    Build mode: electron or tauri (default: tauri)
echo   -Arch    Target architecture: x64 or ia32 (default: x64)
echo   -Config  Build configuration: release or debug (default: release)
echo   -Clean   Clean build artifacts before building
echo   -Verbose Enable verbose output
echo   -Help    Show this help message
echo.
echo Examples:
echo   build.bat                          - Build Tauri x64 release
echo   build.bat -Mode electron           - Build Electron instead of Tauri
echo   build.bat -Arch ia32               - Build for 32-bit Windows
echo   build.bat -Clean -Verbose          - Clean build with verbose output
echo.
exit /b 0
