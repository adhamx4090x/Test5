# Neural Voice OS - Windows Build Guide

This document provides instructions for building Neural Voice OS on Windows using the local build scripts.

## Prerequisites

Before running the build scripts, ensure you have the following software installed:

### Required Software

| Software | Minimum Version | Description | Download |
|----------|----------------|-------------|----------|
| Node.js | 18.0.0+ | JavaScript runtime | https://nodejs.org/ |
| npm | 9.0.0+ | Node package manager | Included with Node.js |
| Rust/Cargo | 1.70.0+ | Rust toolchain (for Tauri) | https://rustup.rs/ |
| Visual Studio Build Tools | 2022+ | C++ compiler and tools | https://visualstudio.microsoft.com/visual-cpp-build-tools/ |
| Windows SDK | 10.0+ | Windows development headers | https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/ |

### One-Liner Installation

If you don't have the required software, you can install most prerequisites using these commands:

```powershell
# Install Node.js (using nvm-windows)
nvm install 20
nvm use 20

# Install Rust
winget install Rustlang.Rust.MSVC

# Install Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools --silent --force
```

### Manual Installation Steps

#### 1. Install Node.js

1. Download the Node.js installer from https://nodejs.org/
2. Run the installer (choose the LTS version)
3. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

#### 2. Install Rust (for Tauri builds)

1. Download rustup from https://rustup.rs/
2. Run the installer
3. Choose option 1 (default installation)
4. Restart your terminal
5. Verify installation:
   ```cmd
   cargo --version
   ```

#### 3. Install Visual Studio Build Tools

1. Download Visual Studio Build Tools from https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Run the installer
3. Select "Desktop development with C++"
4. Ensure these components are selected:
   - MSVC v143 - VS 2022 C++ x64/x86 build tools
   - Windows 11 SDK (or Windows 10 SDK)
   - C++ ATL for latest build tools

#### 4. Install Windows SDK

1. Download Windows SDK from https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/
2. Run the installer
3. Select "Windows SDK Signing Tools for Desktop Apps"

## Project Structure

The Windows build files are organized as follows:

```
local-builds/
└── windows/
    ├── build.bat          # Command Prompt script (simple)
    ├── build.ps1          # PowerShell script (advanced)
    └── README.md          # This file
```

## Quick Start

### Using Command Prompt (Simple)

1. Open Command Prompt
2. Navigate to the project root
3. Run the build script:

```cmd
cd C:\path\to\neural-voice-os
local-builds\windows\build.bat
```

### Using PowerShell (Advanced)

1. Open PowerShell as Administrator
2. Navigate to the project root
3. Run the build script:

```powershell
cd C:\path\to\neural-voice-os
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
.\local-builds\windows\build.ps1
```

## Build Options

### Command Prompt Script Options

```cmd
build.bat [-Mode <electron|tauri>] [-Arch <x64|ia32>] [-Config <release|debug>] [-Clean] [-Verbose]
```

| Option | Description | Default |
|--------|-------------|---------|
| -Mode | Build mode (electron or tauri) | tauri |
| -Arch | Target architecture (x64 or ia32) | x64 |
| -Config | Build configuration (release or debug) | release |
| -Clean | Clean build artifacts before building | false |
| -Verbose | Enable verbose output | false |

### PowerShell Script Options

```powershell
.\build.ps1 [-Mode <string>] [-Arch <string>] [-Config <string>] [-Clean] [-Verbose] [-Help]
```

| Parameter | Description | Default |
|-----------|-------------|---------|
| -Mode | Build mode (electron or tauri) | tauri |
| -Arch | Target architecture (x64 or ia32) | x64 |
| -Config | Build configuration (release or debug) | release |
| -Clean | Clean build artifacts before building | false |
| -Verbose | Enable verbose output | false |
| -Help | Show help message | false |

## Build Examples

### Build Tauri for 64-bit Windows (Default)

```cmd
local-builds\windows\build.bat
```

### Build Electron instead of Tauri

```cmd
local-builds\windows\build.bat -Mode electron
```

### Build for 32-bit Windows

```cmd
local-builds\windows\build.bat -Arch ia32
```

### Clean and Rebuild with Verbose Output

```cmd
local-builds\windows\build.bat -Clean -Verbose
```

### Build Debug Configuration

```cmd
local-builds\windows\build.bat -Config debug
```

## Output Location

Build artifacts are placed in the following locations:

| Build Mode | Output Location |
|------------|-----------------|
| Electron | `dist\windows\electron\x64\` or `dist\windows\electron\ia32\` |
| Tauri | `dist\windows\tauri\x64\` or `dist\windows\tauri\ia32\` |

### Generated Files

| File Type | Description |
|-----------|-------------|
| `.exe` | Windows executable installer |
| `.msi` | Windows Installer package |
| `.blockmap` | App update blockmap file |

## Troubleshooting

### Common Issues

#### "Node.js not found"

Ensure Node.js is installed and in your PATH:
```cmd
where node
```

If not found, restart your terminal or reinstall Node.js.

#### "Rust/Cargo not found"

For Tauri builds, Rust must be installed:
```cmd
cargo --version
```

If not installed, download from https://rustup.rs/

#### "Visual Studio Build Tools not found"

Tauri requires Visual Studio C++ build tools. Install them from:
https://visualstudio.microsoft.com/visual-cpp-build-tools/

#### Build fails with C++ compilation errors

1. Ensure Windows SDK is installed
2. Run the script from "Developer Command Prompt for VS 2022"
3. Check that the correct C++ toolchain is selected

#### npm install fails

1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules: `rmdir /s node_modules`
3. Try again: `npm install`

### Getting Help

If you encounter issues not covered here:

1. Check the main project README.md
2. Open an issue on GitHub
3. Review Tauri documentation: https://tauri.app/docs/

## Advanced Configuration

### Environment Variables

You can configure the build using environment variables:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Set to 'production' for optimized builds |
| `ELECTRON_MIRROR` | Mirror URL for Electron downloads |
| `CARGO_HOME` | Cargo home directory |
| `RUSTUP_HOME` | Rustup home directory |

### Signing Code (Optional)

For production releases, you can sign your builds:

1. Obtain a code signing certificate
2. Set environment variables:
   ```cmd
   set CSC_LINK=path\to\certificate.p12
   set CSC_KEY_PASSWORD=your_password
   ```
3. The build script will automatically sign the output

## Next Steps

After a successful build:

1. Test the application on your target Windows version
2. Create a release on GitHub
3. Submit to Microsoft Store (optional)

For more information, see the main project documentation.
