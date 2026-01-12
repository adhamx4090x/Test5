# Neural Voice OS - Linux Build Guide

This document provides instructions for building Neural Voice OS on Linux using the local build scripts.

## Prerequisites

Before running the build scripts, ensure you have the following software installed:

### Required Software

| Software | Minimum Version | Description | Installation |
|----------|----------------|-------------|--------------|
| Linux | 5.4+ | Operating system | Built-in |
| Node.js | 18.0.0+ | JavaScript runtime | https://nodejs.org/ |
| npm | 9.0.0+ | Node package manager | Included with Node.js |
| gcc/g++ | 9.0.0+ | C/C++ compiler | Package manager |
| make | 4.0+ | Build automation | Package manager |
| pkg-config | 0.29+ | Package configuration | Package manager |
| Rust/Cargo | 1.70.0+ | Rust toolchain (for Tauri) | https://rustup.rs/ |

### One-Liner Installation (Ubuntu/Debian)

```bash
# Install Node.js (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install build tools
sudo apt-get update
sudo apt-get install -y build-essential pkg-config libssl-dev

# Install Tauri dependencies
sudo apt-get install -y \
    libwebkit2gtk-4.0-dev \
    libappindicator3-dev \
    libsoup-3.0-dev \
    libjavascriptcoregtk-4.0-dev \
    libasound2-dev \
    libatk1.0-dev \
    libatk-bridge2.0-dev \
    libcairo2-dev \
    libdbus-1-dev \
    libdrm-dev \
    libgbm-dev \
    libgtk-3-dev \
    libx11-dev \
    libxcomposite-dev \
    libxdamage-dev \
    libxext-dev \
    libxfixes-dev \
    libxi-dev \
    libxkbcommon-dev \
    libxrandr-dev \
    libxrender-dev
```

### One-Liner Installation (Fedora/RHEL)

```bash
# Install Node.js (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install build tools and dependencies
sudo dnf install -y \
    gcc \
    gcc-c++ \
    make \
    pkg-config \
    openssl-devel \
    webkit2gtk4.0-devel \
    libappindicator-gtk3-devel \
    libsoup-devel \
    javascriptcoregtk4.0-devel \
    alsa-lib-devel \
    atk-devel \
    at-spi2-atk-devel \
    cairo-devel \
    dbus-devel \
    libdrm-devel \
    mesa-libgbm-devel \
    gtk3-devel \
    libX11-devel \
    libXcomposite-devel \
    libXdamage-devel \
    libXext-devel \
    libXfixes-devel \
    libXi-devel \
    libxkbcommon-devel \
    libXrandr-devel \
    libXrender-devel
```

## Project Structure

The Linux build files are organized as follows:

```
local-builds/
└── linux/
    ├── build.sh          # Main build script
    └── README.md         # This file
```

## Quick Start

1. Open Terminal
2. Navigate to the project root
3. Make the script executable (first time only)
4. Run the build script

```bash
cd /path/to/neural-voice-os
chmod +x local-builds/linux/build.sh
./local-builds/linux/build.sh
```

## Build Options

```bash
./build.sh [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--mode <electron\|tauri>` | Build mode | tauri |
| `--arch <x64\|arm64\|armv7l>` | Target architecture | x64 |
| `--format <deb\|rpm\|appimage>` | Package format | deb |
| `--config <release\|debug>` | Build configuration | release |
| `--clean` | Clean build artifacts before building | false |
| `--verbose` | Enable verbose output | false |
| `--help` | Show help message | false |

## Build Examples

### Build Tauri DEB Package (Default)

```bash
./local-builds/linux/build.sh
```

### Build Electron instead of Tauri

```bash
./local-builds/linux/build.sh --mode electron
```

### Build for ARM64 (Raspberry Pi, etc.)

```bash
./local-builds/linux/build.sh --arch arm64
```

### Build RPM Package

```bash
./local-builds/linux/build.sh --format rpm
```

### Build AppImage

```bash
./local-builds/linux/build.sh --format appimage
```

### Clean and Rebuild

```bash
./local-builds/linux/build.sh --clean
```

## Output Location

Build artifacts are placed in the following locations:

| Build Mode | Architecture | Format | Output Location |
|------------|--------------|--------|-----------------|
| Electron | x64 | deb | `dist/linux/electron/` |
| Electron | arm64 | deb | `dist/linux/electron/` |
| Tauri | x64 | deb | `dist/linux/tauri/x64/deb/` |
| Tauri | arm64 | rpm | `dist/linux/tauri/arm64/rpm/` |
| Tauri | armv7l | appimage | `dist/linux/tauri/armv7l/appimage/` |

### Generated Files

| File Type | Description | Package Manager |
|-----------|-------------|-----------------|
| `.deb` | Debian package | Debian, Ubuntu, Mint |
| `.rpm` | RPM package | Fedora, RHEL, openSUSE |
| `.AppImage` | Portable AppImage | All distributions |

## Distribution-Specific Instructions

### Ubuntu/Debian

```bash
# Install DEB package
sudo dpkg -i dist/linux/tauri/x64/deb/neural-voice-os_*.deb

# Or use gdebi for dependency resolution
sudo gdebi dist/linux/tauri/x64/deb/neural-voice-os_*.deb
```

### Fedora/RHEL/CentOS

```bash
# Install RPM package
sudo dnf install dist/linux/tauri/x64/rpm/neural-voice-os-*.rpm

# Or with yum
sudo yum install dist/linux/tauri/x64/rpm/neural-voice-os-*.rpm
```

### Arch Linux/Manjaro

```bash
# For AppImage, make it executable
chmod +x dist/linux/tauri/x64/appimage/Neural\ Voice\ OS.AppImage
./dist/linux/tauri/x64/appimage/Neural\ Voice\ OS.AppImage
```

### openSUSE

```bash
# Install RPM package
sudo zypper install dist/linux/tauri/x64/rpm/neural-voice-os-*.rpm
```

## Troubleshooting

### Common Issues

#### "libwebkit2gtk-4.0-dev not found"

The Tauri webview requires WebKitGTK. Install it:

**Ubuntu/Debian:**
```bash
sudo apt-get install libwebkit2gtk-4.0-dev
```

**Fedora/RHEL:**
```bash
sudo dnf install webkit2gtk4.0-devel
```

**Arch Linux:**
```bash
sudo pacman -S webkit2gtk
```

#### "Error loading shared library"

Ensure all runtime dependencies are installed:

**Ubuntu/Debian:**
```bash
sudo apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgbm1 \
    libasound2 \
    libgtk-3-0 \
    libnotify4
```

#### "Permission denied" when running AppImage

Make the AppImage executable:
```bash
chmod +x Neural\ Voice\ OS.AppImage
```

#### "Rust/Cargo not found" (when building Tauri)

Install Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

#### Build fails on ARM architecture

Ensure you have the correct Rust target installed:
```bash
# For ARM64
rustup target add aarch64-unknown-linux-gnu

# For ARMv7
rustup target add armv7-unknown-linux-gnueabihf
```

### Getting Help

If you encounter issues not covered here:

1. Check the main project README.md
2. Open an issue on GitHub
3. Review platform-specific documentation:
   - Tauri: https://tauri.app/docs/
   - Electron: https://www.electronjs.org/docs/
   - AppImage: https://docs.appimage.org/

## Advanced Configuration

### Environment Variables

You can configure the build using environment variables:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Set to 'production' for optimized builds |
| `ELECTRON_MIRROR` | Mirror URL for Electron downloads |
| `CARGO_HOME` | Cargo home directory |
| `RUSTUP_HOME` | Rustup home directory |
| `OPENSSL_LIB_DIR` | OpenSSL library directory |
| `OPENSSL_INCLUDE_DIR` | OpenSSL include directory |

### Custom Package Names

To customize the package name, modify `package.json`:
```json
{
  "name": "neural-voice-os",
  "productName": "Neural Voice OS"
}
```

Or for Tauri, modify `builds/tauri/tauri.conf.json`:
```json
{
  "productName": "Neural Voice OS",
  "bundle": {
    "identifier": "com.neuralvoiceos.app"
  }
}
```

## Next Steps

After a successful build:

1. **Test the Package**:
   - Install and run the application
   - Verify voice recognition works
   - Check audio input/output

2. **Create Distribution Package**:
   - Test on multiple distributions
   - Consider creating a snapcraft.yaml for Snap Store
   - Create a flatpak manifest for Flathub

3. **Publish**:
   - Create a GitHub release
   - Upload the appropriate package files
   - Add installation instructions

For more information, see the main project documentation.
