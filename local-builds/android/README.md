# Neural Voice OS - Android Build Guide

This document provides instructions for building Neural Voice OS on Android using the local build scripts.

## Prerequisites

Before running the build scripts, ensure you have the following software installed:

### Required Software

| Software | Minimum Version | Description | Installation |
|----------|----------------|-------------|--------------|
| OS | Linux/macOS/Windows | Operating system | Built-in |
| Java JDK | 17 (11 minimum) | JDK for Android builds | https://adoptium.net/ |
| Android SDK | 34+ | Android development kit | https://developer.android.com/studio |
| Gradle | 8.4+ | Build automation | Included or https://gradle.org/ |

### One-Liner Installation (macOS with Homebrew)

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install OpenJDK 17
brew install openjdk@17

# Add to PATH (add to ~/.zshrc or ~/.bashrc)
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Install Android SDK via SDKMAN
curl -s "https://get.sdkman.io" | bash
source ~/.sdkman/bin/sdkman-init.sh
sdk install android-sdk

# Accept licenses and install SDK components
yes | sdkmanager --licenses
sdkmanager "platforms;android-34" "build-tools;34.0.0"
```

### One-Liner Installation (Ubuntu/Debian)

```bash
# Install OpenJDK 17
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk

# Install Android SDK command line tools
mkdir -p $HOME/android-sdk/cmdline-tools
cd $HOME/android-sdk/cmdline-tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
mv cmdline-tools latest

# Add to PATH
export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Accept licenses and install SDK components
yes | sdkmanager --licenses
sdkmanager "platforms;android-34" "build-tools;34.0.0" "platform-tools"
```

### Manual Installation Steps

#### 1. Install Java JDK 17

**Windows (using Winget):**
```powershell
winget install EclipseAdoptium.Temurin.17.JDK
```

**macOS (using Homebrew):**
```bash
brew install openjdk@17
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install openjdk-17-jdk
```

**Manual Download:**
1. Download from https://adoptium.net/
2. Run the installer
3. Set `JAVA_HOME` environment variable

Verify installation:
```bash
java -version
javac -version
```

#### 2. Install Android Studio

1. Download from https://developer.android.com/studio
2. Run the installer
3. Open Android Studio
4. Go to Tools → SDK Manager
5. Install:
   - Android SDK Platform 34
   - Build Tools 34.0.0
   - Platform Tools

#### 3. Set Environment Variables

Add these to your shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.profile`):

```bash
# Java
export JAVA_HOME="/path/to/jdk-17"
export PATH="$JAVA_HOME/bin:$PATH"

# Android SDK
export ANDROID_HOME="/path/to/android-sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
```

## Project Structure

The Android build files are organized as follows:

```
local-builds/
└── android/
    ├── build.sh            # Main build script
    ├── local.properties    # SDK path configuration (auto-generated)
    └── README.md           # This file

builds/android/
    ├── app/
    │   ├── build.gradle.kts
    │   └── src/
    ├── build.gradle
    ├── gradle.properties
    ├── settings.gradle
    └── gradlew
```

## Quick Start

1. Open Terminal
2. Navigate to the project root
3. Make the script executable (first time only)
4. Run the build script

```bash
cd /path/to/neural-voice-os
chmod +x local-builds/android/build.sh
./local-builds/android/build.sh
```

## Build Options

```bash
./build.sh [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--variant <debug\|release>` | Build variant | release |
| `--format <apk\|aab>` | Output format | apk |
| `--config <release\|debug>` | Gradle configuration | release |
| `--clean` | Clean build artifacts before building | false |
| `--verbose` | Enable verbose output | false |
| `--help` | Show help message | false |

## Build Examples

### Build Release APK (Default)

```bash
./local-builds/android/build.sh
```

### Build Debug APK

```bash
./local-builds/android/build.sh --variant debug
```

### Build App Bundle for Play Store

```bash
./local-builds/android/build.sh --format aab
```

### Clean and Rebuild

```bash
./local-builds/android/build.sh --clean
```

### Build with Verbose Output

```bash
./local-builds/android/build.sh --verbose
```

## Output Location

Build artifacts are placed in the following locations:

| Variant | Format | Output Location |
|---------|--------|-----------------|
| Debug | APK | `dist/android/debug/app-debug.apk` |
| Release | APK | `dist/android/release/app-release-unsigned.apk` |
| Release | AAB | `dist/android/release/app-release.aab` |

### Generated Files

| File Type | Description | Use Case |
|-----------|-------------|----------|
| `.apk` | Android Package | Direct installation, sideloading |
| `.aab` | Android App Bundle | Google Play Store submission |

## Code Signing

### Creating a Keystore

Before publishing to the Play Store, you need to sign your app:

```bash
# Generate a release keystore
keytool -genkeypair -v -storetype PKCS12 \
    -keyalg RSA -keysize 2048 \
    -validity 10000 \
    -keystore release-keystore.jks \
    -alias neural-voice-os \
    -storepass your_store_password \
    -keypass your_key_password
```

### Configuring Signing

Create `builds/android/app/signing.properties`:

```properties
storeFile=path/to/release-keystore.jks
storePassword=your_store_password
keyAlias=neural-voice-os
keyPassword=your_key_password
```

Or configure in `app/build.gradle.kts`:

```kotlin
android {
    signingConfigs {
        create("release") {
            storeFile = file("release-keystore.jks")
            storePassword = "your_store_password"
            keyAlias = "neural-voice-os"
            keyPassword = "your_key_password"
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

### Signing the APK

The build script will automatically sign APKs if signing configuration is detected. For manual signing:

```bash
# Using apksigner
apksigner sign \
    --ks release-keystore.jks \
    --ks-key-alias neural-voice-os \
    --ks-pass pass:your_store_password \
    --key-pass pass:your_key_password \
    app-release-unsigned.apk
```

## Publishing to Google Play

### Prerequisites

1. Google Play Developer Account
2. Signed App Bundle (`.aab`)
3. App listing assets (screenshots, description, etc.)

### Upload Process

1. Go to Google Play Console: https://play.google.com/console
2. Create a new application
3. Upload the `.aab` file
4. Complete the store listing
5. Submit for review

### Using GitHub Actions (Optional)

See `.github/workflows/build-android.yml` for automated builds and uploads.

## Troubleshooting

### Common Issues

#### "JAVA_HOME is not set"

Set the Java home directory:
```bash
export JAVA_HOME="/path/to/jdk-17"
```

#### "Android SDK not found"

Set the Android SDK path:
```bash
export ANDROID_HOME="/path/to/android-sdk"
```

#### "gradlew: command not found"

Make gradlew executable:
```bash
chmod +x builds/android/gradlew
```

#### "Unsupported class file major version"

Your Java version may be too new or too old. Use JDK 17:
```bash
export JAVA_HOME="/path/to/jdk-17"
```

#### "Manifest merger failed"

Check `AndroidManifest.xml` for conflicts. Common issues:
- Duplicate permissions
- Incompatible feature requirements
- Missing `minSdkVersion` or `targetSdkVersion`

#### "Build tools not found"

Install the required build tools:
```bash
# Using sdkmanager
sdkmanager "build-tools;34.0.0"

# Or using Android Studio
# Tools → SDK Manager → SDK Tools → Check "Show Package Details"
# Install Build-Tools 34.0.0
```

### Getting Help

If you encounter issues not covered here:

1. Check the main project README.md
2. Open an issue on GitHub
3. Review Android documentation:
   - https://developer.android.com/studio/build
   - https://tauri.app/docs/
   - https://developer.android.com/distribute

## Advanced Configuration

### Build Types

The app supports two build types:

| Build Type | Description | Usage |
|------------|-------------|-------|
| Debug | Un-signed, debuggable | Development testing |
| Release | Optimized, signed | Production distribution |

### Product Flavors

The app can be built with different configurations:

```bash
# Default (full features)
./build.sh

# See builds/android/app/build.gradle.kts for flavor configuration
```

### Performance Optimization

For faster builds:

```bash
# Use parallel execution
./gradlew assembleRelease --parallel

# Use daemon
./gradlew assembleRelease --daemon

# Configure in gradle.properties
echo "org.gradle.parallel=true" >> gradle.properties
echo "org.gradle.caching=true" >> gradle.properties
```

## Next Steps

After a successful build:

1. **Test the APK**:
   ```bash
   adb install dist/android/release/app-release.apk
   ```

2. **Sign for Release**:
   - Create a keystore
   - Configure signing
   - Rebuild with `--variant release`

3. **Upload to Play Store**:
   - Create AAB bundle
   - Upload to Google Play Console
   - Submit for review

4. **Distribute Directly**:
   - Upload APK to GitHub Releases
   - Offer as direct download
   - Use FDroid or other repositories

For more information, see the main project documentation.
