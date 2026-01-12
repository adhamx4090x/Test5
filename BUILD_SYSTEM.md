# Local AI Voice Operating System - Build System Documentation

## Project Overview

This document provides a comprehensive overview of the build system for the Local AI Voice Operating System, including all platform-specific configurations, icon assets, and build instructions.

## Directory Structure

```
local-ai-voice-os/
├── 📄 Core Application Files
│   ├── index.html          # Main web application
│   ├── app.js             # Core application logic
│   ├── styles.css         # Application styling
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service worker
│   ├── test.js            # Test suite
│   └── package.json       # NPM configuration
│
├── 📁 icons/              # Platform-specific SVG icons
│   ├── icon-windows.svg   # Windows build icon
│   ├── icon-macos.svg     # macOS build icon
│   ├── icon-linux.svg     # Linux build icon
│   ├── icon-android.svg   # Android build icon
│   └── icon-ios.svg       # iOS build icon
│
├── 📁 builds/             # Platform-specific build configurations
│   ├── 📁 electron/       # Electron desktop application
│   │   ├── main.js        # Main process entry point
│   │   └── preload.js     # IPC bridge to renderer
│   │
│   ├── 📁 tauri/          # Tauri desktop application
│   │   ├── src/main.rs    # Rust main entry point
│   │   ├── Cargo.toml     # Rust package configuration
│   │   └── tauri.conf.json # Tauri configuration
│   │
│   ├── 📁 android/        # Android mobile application
│   │   ├── build.gradle       # Root build configuration
│   │   ├── settings.gradle    # Gradle settings
│   │   ├── gradle.properties  # Gradle properties
│   │   └── app/
│   │       ├── build.gradle   # App module build config
│   │       ├── proguard-rules.pro
│   │       └── src/main/
│   │           ├── AndroidManifest.xml
│   │           ├── java/com/minimax/localaivoiceos/
│   │           │   ├── MainActivity.kt
│   │           │   ├── AudioProcessingService.kt
│   │           │   └── ui/
│   │           │       ├── MainScreen.kt
│   │           │       └── theme/
│   │           │           ├── Theme.kt
│   │           │           └── Typography.kt
│   │           └── res/
│   │               └── values/
│   │                   ├── strings.xml
│   │                   ├── colors.xml
│   │                   └── themes.xml
│   │
│   └── 📁 ios/           # iOS mobile application
│       ├── project.yml   # XcodeGen project configuration
│       └── NeuralVoiceOS/
│           ├── AppDelegate.swift
│           ├── SceneDelegate.swift
│           ├── ViewController.swift
│           ├── Info.plist
│           ├── Resources/
│           │   └── LaunchScreen.storyboard
│           └── Assets.xcassets/
│               └── Contents.json
│
├── 📁 scripts/           # Build automation scripts
│   ├── build.js          # Main build orchestration
│   └── generate-icons.js # Icon conversion script
│
├── 📁 builds/icons/      # Generated platform icons
├── 📁 dist/              # Build output directory
└── 📄 README.md          # Project documentation
```

## Platform Icons

### SVG Icon Specifications

Each platform icon is designed with platform-specific visual elements:

| Icon | Platform | Key Visual Elements |
|------|----------|-------------------|
| `icon-windows.svg` | Windows | Blue gradient, Windows accent mark, neural network nodes |
| `icon-macos.svg` | macOS | Dark theme, MacBook-style frame, notch, Apple menu hint |
| `icon-linux.svg` | Linux | Terminal window, command prompt, code snippets, penguin hint |
| `icon-android.svg` | Android | Green gradient, phone frame, voice wave visualization |
| `icon-ios.svg` | iOS | Dark mode iPhone, Dynamic Island, iOS-style interface |

### Icon Generation

To convert SVG icons to platform-specific formats:

```bash
# Install dependencies
npm install

# Generate all platform icons
npm run icon:generate

# Convert icons to specific formats
npm run icon:convert
```

Generated icons are stored in `builds/icons/`:
- Windows: `icon-windows.ico` (multiple sizes: 16, 24, 32, 48, 64, 128, 256, 512)
- macOS: `icon-macos.icns` (multiple sizes: 16, 32, 64, 128, 256, 512, 1024)
- Linux: `icon-linux-{size}x{size}.png` (16, 24, 32, 48, 64, 128, 256, 512)
- Android: `mipmap-*/ic_launcher.png` (36, 48, 72, 96, 144, 192)
- iOS: `AppIcon.appiconset/` (20, 29, 40, 60, 76, 83.5, 1024)

## Build Commands

### Quick Start

```bash
# Install dependencies
npm install

# Generate platform-specific icons
npm run icon:generate

# Build all platforms
npm run build:all
```

### Platform-Specific Builds

#### Electron (Windows, macOS, Linux)

```bash
# Build for all desktop platforms
npm run build:electron

# Build for specific desktop platform
npm run build:windows    # Windows .exe
npm run build:macos      # macOS .dmg
npm run build:linux      # Linux .AppImage

# Development
npm start                # Run in development mode
npm run pack            # Package without distribution
npm run dist            # Create distributables
```

#### Tauri (Windows, macOS, Linux)

```bash
# Build for all Tauri platforms
npm run build:tauri

# Platform-specific Tauri builds
cd builds/tauri
cargo tauri build --target x86_64-pc-windows-gnu    # Windows
cargo tauri build --target x86_64-apple-darwin      # macOS
cargo tauri build --target x86_64-unknown-linux-gnu # Linux
```

#### Android

```bash
# Build debug APK
npm run build:android -- debug

# Build release APK
npm run build:android -- release

# Build App Bundle (for Play Store)
npm run build:android -- bundle

# Direct Gradle commands
cd builds/android
./gradlew assembleDebug           # Debug APK
./gradlew assembleRelease         # Release APK
./gradlew bundleRelease           # App Bundle
./gradlew lint                    # Run linting
./gradlew test                    # Run tests
```

#### iOS

```bash
# Generate Xcode project (first time only)
npm run build:ios -- generate

# Build for simulator
npm run build:ios -- simulator

# Build for device (requires signing)
npm run build:ios -- device

# Create IPA for distribution
npm run build:ios -- archive

# Direct Xcode commands
cd builds/ios
xcodegen generate                 # Generate project
xcodebuild -project NeuralVoiceOS.xcodeproj \
  -scheme NeuralVoiceOS \
  -configuration Debug \
  -sdk iphonesimulator \
  build

xcodebuild -project NeuralVoiceOS.xcodeproj \
  -scheme NeuralVoiceOS \
  -configuration Release \
  -archivePath build/NeuralVoiceOS \
  archive
```

## Build Configuration

### package.json

The main `package.json` contains Electron and Tauri build configurations:

```json
{
  "build": {
    "appId": "com.minimax.local-ai-voice-os",
    "productName": "NeuralVoice OS",
    "directories": {
      "output": "dist",
      "buildResources": "builds/electron/resources"
    },
    "win": {
      "target": "nsis",
      "icon": "icons/icon-windows.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "icons/icon-macos.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "icons/icon-linux.png"
    }
  }
}
```

### Tauri Configuration

`builds/tauri/tauri.conf.json` contains Tauri-specific settings:

- Window configuration
- Security allowlist
- Bundle settings for all platforms
- Desktop and mobile-specific options

### Android Configuration

`builds/android/app/build.gradle` contains:

- Compile and target SDK versions
- Kotlin and Compose configuration
- ProGuard rules for release builds
- Dependency management

### iOS Configuration

`builds/ios/project.yml` defines:

- Project structure
- Target configuration
- Asset catalog setup
- Info.plist properties

## Prerequisites

### Common Requirements

- Node.js 18+
- npm 9+

### Platform-Specific Requirements

| Platform | Requirements |
|----------|------------|
| Windows (Electron) | Node.js, Windows 10+ |
| macOS (Electron) | Node.js, macOS 10.15+ |
| Linux (Electron) | Node.js, Linux with X11 |
| Tauri | Rust 1.60+, Tauri CLI |
| Android | Java 17+, Android SDK, Gradle 8+ |
| iOS | Xcode 15+, macOS with Xcode command line tools |

### Installation Commands

```bash
# Tauri
cargo install tauri-cli

# Android (via SDK Manager)
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# iOS
xcode-select --install

# XcodeGen
brew install xcodegen

# ImageMagick (for icon conversion)
brew install imagemagick
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test suite
node test.js
```

### Build Verification

```bash
# Verify Electron build
npm run pack
ls dist/

# Verify Tauri build
cd builds/tauri
cargo tauri build
ls src-tauri/bundled/

# Verify Android build
cd builds/android
./gradlew assembleDebug
ls app/build/outputs/apk/debug/

# Verify iOS build
cd builds/ios
xcodebuild -project NeuralVoiceOS.xcodeproj \
  -scheme NeuralVoiceOS \
  -configuration Debug \
  build
```

## Troubleshooting

### Common Issues

#### Electron Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run dist
```

#### Tauri Build Fails

```bash
# Update dependencies
cd builds/tauri
cargo update

# Clear cache
rm -rf src-tauri/target
cargo tauri build
```

#### Android Build Fails

```bash
# Clear Gradle cache
cd builds/android
rm -rf .gradle build app/build
./gradlew clean assembleRelease
```

#### iOS Build Fails

```bash
# Regenerate project
cd builds/ios
rm -rf NeuralVoiceOS.xcodeproj
xcodegen generate
xcodebuild -project NeuralVoiceOS.xcodeproj \
  -scheme NeuralVoiceOS \
  clean
```

## Version Information

- **Application Version**: 1.0.0
- **Electron Version**: 28.0.0
- **Tauri Version**: 2.0.0
- **Android SDK**: 34 (API level 34)
- **iOS Deployment Target**: 15.0
- **Kotlin Version**: 1.9.20
- **Compose BOM**: 2023.10.01

## License

MIT License - See LICENSE file for details.

## Support

For build issues or questions:
1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Open an issue on the GitHub repository
