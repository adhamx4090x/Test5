# Local AI Voice Operating System

A 100% offline, local-first professional voice operating system with neural audio processing and local AI brain.

## Features

- **100% Offline**: All processing happens locally on your device
- **Neural Voice Processing**: Advanced audio processing with neural networks
- **Local AI Brain**: Heuristic analysis without server calls
- **Voice Layers**: Multi-track voice recording and editing
- **Ultra-Precision Controls**: Macro, Micro, and Nano control modes
- **Real-time Visualization**: Live waveform and spectrum displays
- **Cross-Platform**: Windows, macOS, Linux, Android, iOS

## Platforms

### Desktop Platforms (Electron/Tauri)

| Platform | Build Command | Target |
|----------|--------------|--------|
| Windows | `npm run build:windows` | `.exe` installer |
| macOS | `npm run build:macos` | `.dmg` image |
| Linux | `npm run build:linux` | `.AppImage` |

### Mobile Platforms

| Platform | Build Command | Output |
|----------|--------------|--------|
| Android | `npm run build:android` | `.apk`, `.aab` |
| iOS | `npm run build:ios` | `.ipa`, `.xcarchive` |

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- For Tauri: Rust 1.60+
- For Android: Java 17+, Gradle 8+
- For iOS: Xcode 15+

### Installation

```bash
# Clone the repository
git clone https://github.com/minimax/local-ai-voice-os.git
cd local-ai-voice-os

# Install dependencies
npm install

# Generate platform-specific icons
npm run icon:generate

# Build for all platforms
npm run build:all
```

### Development

```bash
# Start development server
npm start

# Run tests
npm test

# Generate icons
npm run icon:generate

# Convert icons to platform formats
npm run icon:convert
```

## Build System

### Directory Structure

```
builds/
├── electron/          # Electron main process files
│   ├── main.js        # Main process entry point
│   └── preload.js     # Preload script for IPC
├── tauri/             # Tauri configuration
│   ├── src/
│   │   └── main.rs    # Rust entry point
│   └── tauri.conf.json
├── android/           # Android Gradle project
│   ├── app/
│   │   ├── src/
│   │   └── build.gradle
│   └── build.gradle
└── ios/               # iOS Xcode project
    ├── NeuralVoiceOS/
    │   ├── AppDelegate.swift
    │   ├── SceneDelegate.swift
    │   └── ViewController.swift
    └── project.yml    # XcodeGen configuration
```

### Icons

```
icons/
├── icon-windows.svg   # Windows icon (blue gradient)
├── icon-macos.svg     # macOS icon (dark theme)
├── icon-linux.svg     # Linux icon (terminal style)
├── icon-android.svg   # Android icon (green)
└── icon-ios.svg       # iOS icon (dark mode)
```

### Build Scripts

- `scripts/build.js` - Main build orchestration script
- `scripts/generate-icons.js` - SVG to platform format converter
- `scripts/convert-icons.js` - Additional icon conversion

## Configuration

### package.json

Contains all build configurations for Electron and Tauri:

```json
{
  "build": {
    "appId": "com.minimax.local-ai-voice-os",
    "productName": "NeuralVoice OS",
    "win": { "target": "nsis", "icon": "icons/icon-windows.ico" },
    "mac": { "target": "dmg", "icon": "icons/icon-macos.icns" },
    "linux": { "target": "AppImage", "icon": "icons/icon-linux.png" }
  }
}
```

### tauri.conf.json

Tauri-specific configuration including allowlist and bundle settings.

## Testing

Run the test suite:

```bash
npm test
```

## Deployment

### Building for Release

```bash
# Build all platforms
npm run build:all

# Build specific platform
npm run build:electron  # Desktop (Electron)
npm run build:tauri     # Desktop (Tauri)
npm run build:android   # Android
npm run build:ios       # iOS
```

### Platform-Specific Instructions

#### Windows

1. Run `npm run build:windows`
2. Output: `dist/NeuralVoiceOS-Setup-{version}.exe`
3. Run installer as administrator

#### macOS

1. Run `npm run build:macos`
2. Output: `dist/NeuralVoiceOS-{version}.dmg`
3. Mount DMG and drag to Applications

#### Linux

1. Run `npm run build:linux`
2. Output: `dist/NeuralVoiceOS-{version}.AppImage`
3. Make executable: `chmod +x NeuralVoiceOS-{version}.AppImage`

#### Android

1. Install Android SDK
2. Run `npm run build:android`
3. Output: `builds/android/app/build/outputs/apk/release/`

#### iOS

1. Install Xcode
2. Generate project: `xcodegen generate`
3. Build: `npm run build:ios`
4. Output: `dist/NeuralVoiceOS.ipa`

## Architecture

### Web-Based UI

The application uses a web-based interface built with vanilla JavaScript, HTML, and CSS:

- `index.html` - Main application structure
- `styles.css` - Styling with CSS custom properties
- `app.js` - Core application logic

### Desktop Bridges

- **Electron**: Uses IPC for native file access and window control
- **Tauri**: Uses Rust backend for better performance and smaller size

### Mobile Implementations

- **Android**: Kotlin with Jetpack Compose
- **iOS**: Swift with UIKit and WebKit

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub issue tracker.
