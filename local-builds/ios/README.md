# Neural Voice OS - iOS Build Guide

This document provides instructions for building Neural Voice OS on iOS using the local build scripts.

## Prerequisites

Before running the build scripts, ensure you have the following software installed:

### Required Software

| Software | Minimum Version | Description | Installation |
|----------|----------------|-------------|--------------|
| macOS | 12.0 (Monterey) | Operating system | Built-in |
| Xcode | 14.0+ | IDE and SDK | App Store |
| Xcode Command Line Tools | 14.0+ | Developer tools | `xcode-select --install` |
| XcodeGen | 2.8.0+ | Xcode project generator | Homebrew |
| Homebrew | 4.0+ | Package manager | https://brew.sh/ |

### One-Liner Installation

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install XcodeGen
brew install xcodegen

# Install Xcode Command Line Tools
xcode-select --install

# Accept license
sudo xcodebuild -license accept
```

### Manual Installation Steps

#### 1. Install Xcode

1. Open the App Store
2. Search for "Xcode"
3. Click Install
4. Wait for download and installation

#### 2. Accept Xcode License

```bash
sudo xcodebuild -license accept
```

#### 3. Install Xcode Command Line Tools

```bash
xcode-select --install
```

#### 4. Install XcodeGen

**Using Homebrew:**
```bash
brew install xcodegen
```

**Manual Installation:**
1. Download from https://github.com/yonaskolb/XcodeGen/releases
2. Extract to `/usr/local/bin/` or `~/bin/`
3. Make executable: `chmod +x xcodegen`

#### 5. Verify Installation

```bash
# Check Xcode
xcodebuild -version

# Check XcodeGen
xcodegen --version

# List available simulators
xcrun simctl list devices available
```

### Apple Developer Account (Required for Device Builds)

To build for physical iOS devices, you need:

1. **Apple Developer Account** - https://developer.apple.com/
2. **iOS Development Certificate**
3. **Provisioning Profile**

## Project Structure

The iOS build files are organized as follows:

```
local-builds/
└── ios/
    ├── build.sh          # Main build script
    └── README.md         # This file

builds/ios/
    ├── project.yml       # XcodeGen configuration
    ├── NeuralVoiceOS/    # Source code
    │   ├── Info.plist
    │   ├── AppDelegate.swift
    │   ├── SceneDelegate.swift
    │   └── ...
    └── Podfile          # CocoaPods (optional)
```

## Quick Start

1. Open Terminal
2. Navigate to the project root
3. Make the script executable (first time only)
4. Run the build script

```bash
cd /path/to/neural-voice-os
chmod +x local-builds/ios/build.sh
./local-builds/ios/build.sh
```

## Build Options

```bash
./build.sh [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--target <simulator\|device>` | Build target | device |
| `--config <debug\|release>` | Build configuration | release |
| `--clean` | Clean build artifacts before building | false |
| `--verbose` | Enable verbose output | false |
| `--help` | Show help message | false |

## Build Examples

### Build for Device (Default)

```bash
./local-builds/ios/build.sh
```

### Build for Simulator

```bash
./local-builds/ios/build.sh --target simulator
```

### Debug Build

```bash
./local-builds/ios/build.sh --config debug
```

### Clean and Rebuild

```bash
./local-builds/ios/build.sh --clean
```

### Verbose Output

```bash
./local-builds/ios/build.sh --verbose
```

## Output Location

Build artifacts are placed in the following locations:

| Target | Config | Output Location |
|--------|--------|-----------------|
| Simulator | Debug | `dist/ios/debug/` |
| Simulator | Release | `dist/ios/release/` |
| Device | Debug | `dist/ios/debug/` |
| Device | Release | `dist/ios/release/` |

### Generated Files

| File Type | Description | Use Case |
|-----------|-------------|----------|
| `.app` | iOS Application Bundle | Testing, development |
| `.ipa` | iOS App Store Package | Distribution, installation |
| `.xcarchive` | Xcode Archive | Archives, symbolication |

## Code Signing and Distribution

### Prerequisites for Signing

1. **Apple Developer Account** - Required for all device builds
2. **Development Certificate** - For testing on registered devices
3. **Distribution Certificate** - For App Store submission
4. **Provisioning Profiles** - Maps certificates to apps

### Setting Up Signing

#### 1. Create Certificates

1. Go to Apple Developer Portal: https://developer.apple.com/account/
2. Navigate to Certificates, Identifiers & Profiles
3. Create iOS Development or Distribution certificate

#### 2. Import Certificate

```bash
# Import .p12 file
security import certificate.p12 -P your_password
```

#### 3. Configure Environment Variables

```bash
export DEVELOPMENT_TEAM="YOUR_TEAM_ID"
export CODE_SIGN_IDENTITY="Apple Development"
export PROVISIONING_PROFILE="Your Provisioning Profile Name"
```

#### 4. Get Team ID

```bash
# Get your team ID from Apple Developer account
# Or from Xcode preferences
```

### Build for Device

```bash
# With environment variables
export DEVELOPMENT_TEAM="YOUR_TEAM_ID"
export CODE_SIGN_IDENTITY="Apple Development"

./local-builds/ios/build.sh --target device
```

### Build for App Store

```bash
export DEVELOPMENT_TEAM="YOUR_TEAM_ID"
export CODE_SIGN_IDENTITY="Apple Distribution"

./local-builds/ios/build.sh --target device --config release
```

### Export IPA from Archive

After building an archive:

```bash
xcodebuild \
    -exportArchive \
    -archivePath build/NeuralVoiceOS.xcarchive \
    -exportOptionsPlist builds/ios/Info.plist \
    -exportPath build/output
```

## Testing

### Install on Simulator

```bash
# List available simulators
xcrun simctl list devices available

# Boot simulator
xcrun simctl boot "iPhone 15"

# Install app
xcrun simctl install booted dist/ios/release/Neural\ Voice\ OS.app

# Launch app
xcrun simctl launch booted com.neuralvoiceos.app
```

### Install on Device (using ideviceinstaller)

```bash
# Install IPA
ideviceinstaller -i dist/ios/release/Neural\ Voice\ OS.ipa

# List installed apps
ideviceinstaller -l
```

## Troubleshooting

### Common Issues

#### "XcodeGen not found"

Install XcodeGen:
```bash
brew install xcodegen
```

#### "No provisioning profile found"

1. Ensure you have a valid provisioning profile
2. Set the `DEVELOPMENT_TEAM` environment variable
3. Check that the bundle identifier matches

#### "Code signing identity not found"

1. Import your certificate to Keychain
2. Check available identities:
   ```bash
   security find-identity -v -p codesigning
   ```

#### "Build fails with compilation errors"

1. Check Xcode version compatibility
2. Ensure all source files are included in `project.yml`
3. Check for missing Swift/Objective-C dependencies

#### "Simulator builds fail on Apple Silicon"

Ensure you're using the correct architecture:
```bash
# Build for ARM64 simulators
xcodebuild -project NeuralVoiceOS.xcodeproj -scheme NeuralVoiceOS \
    -destination 'platform=iOS Simulator,name=iPhone 15' build
```

### Getting Help

If you encounter issues not covered here:

1. Check the main project README.md
2. Open an issue on GitHub
3. Review platform-specific documentation:
   - Xcode: https://developer.apple.com/xcode/
   - XcodeGen: https://github.com/yonaskolb/XcodeGen
   - iOS Signing: https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/

## Advanced Configuration

### Customizing project.yml

The Xcode project is generated from `project.yml`. Customize it:

```yaml
name: NeuralVoiceOS
options:
  bundleIdPrefix: com.neuralvoiceos
  deploymentTarget:
    iOS: "14.0"
  xcodeVersion: "15.0"

settings:
  base:
    MARKETING_VERSION: "1.0.0"
    CURRENT_PROJECT_VERSION: "1"
    DEVELOPMENT_TEAM: ""

targets:
  NeuralVoiceOS:
    type: application
    platform: iOS
    deploymentTarget: "14.0"
    sources:
      - NeuralVoiceOS
    settings:
      base:
        INFOPLIST_FILE: NeuralVoiceOS/Info.plist
        PRODUCT_BUNDLE_IDENTIFIER: com.neuralvoiceos.app
        ASSETCATALOG_COMPILER_APPICON_NAME: AppIcon
```

### CocoaPods Integration

If your project uses CocoaPods:

1. Create `Podfile`:
```ruby
platform :ios, '14.0'

target 'NeuralVoiceOS' do
  use_frameworks!
  
  # Add dependencies
  pod 'Alamofire'
  pod 'SnapKit'
end
```

2. Run `pod install` after generating the project

### Swift Package Manager

Add Swift packages via `project.yml`:

```yaml
packages:
  Alamofire:
    url: https://github.com/Alamofire/Alamofire
    from: "5.8.0"

targets:
  NeuralVoiceOS:
    dependencies:
      - package: Alamofire
```

## Next Steps

After a successful build:

1. **Test on Simulator**:
   ```bash
   ./local-builds/ios/build.sh --target simulator
   xcrun simctl boot "iPhone 15"
   xcrun simctl install booted dist/ios/release/Neural\ Voice\ OS.app
   xcrun simctl launch booted com.neuralvoiceos.app
   ```

2. **Test on Device**:
   - Connect device via USB
   - Configure signing
   - Install and test

3. **Submit to App Store**:
   - Create App Store Connect record
   - Upload using Xcode or Transporter
   - Submit for review

4. **TestFlight Distribution**:
   - Upload to App Store Connect
   - Add beta testers
   - Distribute for testing

For more information, see the main project documentation.
