# Neural Voice OS - macOS Build Guide

This document provides instructions for building Neural Voice OS on macOS using the local build scripts.

## Prerequisites

Before running the build scripts, ensure you have the following software installed:

### Required Software

| Software | Minimum Version | Description | Installation |
|----------|----------------|-------------|--------------|
| macOS | 11.0+ (Big Sur) | Operating system | Built-in |
| Node.js | 18.0.0+ | JavaScript runtime | https://nodejs.org/ |
| npm | 9.0.0+ | Node package manager | Included with Node.js |
| Xcode Command Line Tools | 14.0+ | Developer tools | `xcode-select --install` |
| Rust/Cargo | 1.70.0+ | Rust toolchain (for Tauri) | https://rustup.rs/ |
| Xcode | 14.0+ | IDE (for Tauri builds) | App Store |

### One-Liner Installation

If you don't have the required software, you can install most prerequisites using these commands:

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc || source ~/.zshrc
nvm install 20
nvm use 20

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install Xcode Command Line Tools
xcode-select --install
```

### Manual Installation Steps

#### 1. Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Install Node.js

```bash
# Using Homebrew
brew install node

# Or using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc  # or source ~/.zshrc for Zsh
nvm install 20
nvm use 20
```

Verify installation:
```bash
node --version
npm --version
```

#### 3. Install Xcode Command Line Tools

```bash
xcode-select --install
```

Verify installation:
```bash
xcode-select -p
```

#### 4. Install Rust (for Tauri builds)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
cargo --version
```

#### 5. Install Xcode (for Tauri builds)

1. Open the App Store
2. Search for "Xcode"
3. Click Install
4. After installation, accept the license:
   ```bash
   sudo xcodebuild -license accept
   ```

## Project Structure

The macOS build files are organized as follows:

```
local-builds/
└── macos/
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
chmod +x local-builds/macos/build.sh
./local-builds/macos/build.sh
```

## Build Options

```bash
./build.sh [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--mode <electron\|tauri>` | Build mode | tauri |
| `--arch <x64\|arm64\|universal>` | Target architecture | universal |
| `--config <release\|debug>` | Build configuration | release |
| `--clean` | Clean build artifacts before building | false |
| `--sign` | Sign the application | false |
| `--verbose` | Enable verbose output | false |
| `--help` | Show help message | false |

## Build Examples

### Build Tauri Universal Binary (Default)

```bash
./local-builds/macos/build.sh
```

### Build Electron instead of Tauri

```bash
./local-builds/macos/build.sh --mode electron
```

### Build for Apple Silicon Only

```bash
./local-builds/macos/build.sh --arch arm64
```

### Build for Intel Mac

```bash
./local-builds/macos/build.sh --arch x64
```

### Clean and Rebuild with Verbose Output

```bash
./local-builds/macos/build.sh --clean --verbose
```

### Build and Sign for Distribution

```bash
./local-builds/macos/build.sh --sign
```

## Output Location

Build artifacts are placed in the following locations:

| Build Mode | Architecture | Output Location |
|------------|--------------|-----------------|
| Electron | Universal | `dist/macos/electron/` |
| Tauri | Universal | `dist/macos/tauri/universal/` |
| Tauri | x64 | `dist/macos/tauri/x64/` |
| Tauri | arm64 | `dist/macos/tauri/arm64/` |

### Generated Files

| File Type | Description |
|-----------|-------------|
| `.dmg` | macOS disk image installer |
| `.app` | macOS application bundle |
| `.pkg` | macOS package installer (optional) |

## Code Signing and Notarization

### Prerequisites for Signing

1. **Apple Developer Account** - Required for code signing
2. **Developer ID Certificate** - For notarized distributions
3. **App Store Connect Account** - For App Store distribution

### Setting Up Signing

1. **Obtain a Developer ID Certificate**:
   - Go to https://developer.apple.com/account/
   - Navigate to Certificates, Identifiers & Profiles
   - Create a Developer ID Application certificate

2. **Import Certificate to Keychain**:
   ```bash
   security import certificate.p12 -P your_password
   ```

3. **Configure Environment Variables** (optional):
   ```bash
   export APPLE_ID="your-email@example.com"
   export APPLE_ID_PASSWORD="app-specific-password"
   ```

### Signing the Application

Use the `--sign` flag to automatically sign the application:

```bash
./local-builds/macos/build.sh --sign
```

### Notarization

For distribution outside the App Store, your application must be notarized by Apple:

```bash
# After building, submit for notarization
xcrun notarytool submit "dist/macos/tauri/universal/Neural Voice OS.dmg" \
    --apple-id "your-email@example.com" \
    --password "app-specific-password" \
    --team-id "YOUR_TEAM_ID"
```

## Troubleshooting

### Common Issues

#### "xcode-select: error: command line tools not found"

Install Xcode Command Line Tools:
```bash
xcode-select --install
```

#### "Rust/Cargo not found" (when building Tauri)

Install Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

#### "electron-builder fails with permission errors"

Try running with elevated privileges or configure npm:
```bash
sudo chown -R $(whoami) ~/.npm
```

#### "Tauri build fails with C++ errors"

Ensure Xcode is properly installed and selected:
```bash
sudo xcodebuild -license accept
xcode-select -s /Applications/Xcode.app/Contents/Developer
```

#### "Cannot create universal binary"

Build both architectures separately:
```bash
# Build for x64
cargo build --release --target x86_64-apple-darwin

# Build for arm64  
cargo build --release --target aarch64-apple-darwin

# Create universal binary
lipo -create -output target/release/neural_voice_os \
    target/x86_64-apple-darwin/release/neural_voice_os \
    target/aarch64-apple-darwin/release/neural_voice_os
```

### Getting Help

If you encounter issues not covered here:

1. Check the main project README.md
2. Open an issue on GitHub
3. Review platform-specific documentation:
   - Tauri: https://tauri.app/docs/
   - Electron: https://www.electronjs.org/docs/
   - macOS Signing: https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/

## Advanced Configuration

### Environment Variables

You can configure the build using environment variables:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Set to 'production' for optimized builds |
| `ELECTRON_MIRROR` | Mirror URL for Electron downloads |
| `CARGO_HOME` | Cargo home directory |
| `RUSTUP_HOME` | Rustup home directory |
| `APPLE_ID` | Apple ID for notarization |
| `APPLE_ID_PASSWORD` | App-specific password for notarization |

### Custom Build Targets

For custom architectures, modify the `--arch` parameter:

```bash
# Build for Apple Silicon with Intel translation
./build.sh --arch arm64

# Build native Intel
./build.sh --arch x64

# Build Universal (both architectures)
./build.sh --arch universal
```

## Next Steps

After a successful build:

1. **Test the Application**:
   - Mount the DMG
   - Drag the app to Applications
   - Test functionality

2. **Code Sign** (for distribution):
   ```bash
   ./build.sh --sign
   ```

3. **Notarize** (for distribution outside App Store):
   ```bash
   xcrun notarytool submit "dist/macos/tauri/universal/Neural Voice OS.dmg" \
       --apple-id "your-email@example.com" \
       --password "app-specific-password"
   ```

4. **Create Release**:
   - Create a GitHub release
   - Upload the DMG file
   - Add release notes

For more information, see the main project documentation.
