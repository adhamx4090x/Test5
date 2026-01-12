#!/usr/bin/env node
/**
 * Build Script for Local AI Voice Operating System
 * Handles building for all platforms: Electron, Tauri, Android, iOS
 */

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { Command } = require('commander');

const program = new Command();

const ICONS_DIR = path.join(__dirname, '..', 'icons');
const BUILDS_DIR = path.join(__dirname, '..', 'builds');
const DIST_DIR = path.join(__dirname, '..', 'dist');

const PLATFORMS = {
  electron: {
    name: 'Electron',
    icon: 'icon-windows.ico',
    build: 'npm run build:electron',
    package: 'electron-builder'
  },
  tauri: {
    name: 'Tauri',
    icon: 'icon.ico',
    build: 'npm run build:tauri',
    package: 'cargo tauri build'
  },
  android: {
    name: 'Android',
    icon: 'mipmap-xxxhdpi/ic_launcher.png',
    build: 'cd android && ./gradlew assembleRelease',
    package: 'gradle'
  },
  ios: {
    name: 'iOS',
    icon: 'AppIcon.appiconset/Icon-App.png',
    build: 'xcodebuild -project NeuralVoiceOS.xcodeproj -scheme NeuralVoiceOS -configuration Release -archivePath build/NeuralVoiceOS archive',
    package: 'xcodebuild'
  }
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  
  console.log(`${colors[type] || colors.info}[${timestamp}] ${message}${colors.reset}`);
}

function checkPrerequisites(platform) {
  log(`Checking prerequisites for ${platform}...`, 'info');
  
  switch (platform) {
    case 'electron':
      try {
        execSync('node --version', { encoding: 'utf8' });
        execSync('npm --version', { encoding: 'utf8' });
      } catch (error) {
        throw new Error('Node.js and npm are required for Electron builds');
      }
      break;
      
    case 'tauri':
      try {
        execSync('cargo --version', { encoding: 'utf8' });
        execSync('tauri --version', { encoding: 'utf8' });
      } catch (error) {
        throw new Error('Rust and Tauri CLI are required for Tauri builds');
      }
      break;
      
    case 'android':
      try {
        execSync('java -version', { encoding: 'utf8' });
        execSync('gradle --version', { encoding: 'utf8' });
      } catch (error) {
        throw new Error('Java and Gradle are required for Android builds');
      }
      break;
      
    case 'ios':
      try {
        execSync('xcodebuild -version', { encoding: 'utf8' });
      } catch (error) {
        throw new Error('Xcode is required for iOS builds');
      }
      break;
  }
  
  log(`Prerequisites for ${platform} are satisfied`, 'success');
}

function ensureOutputDir() {
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
    log(`Created output directory: ${DIST_DIR}`, 'success');
  }
}

function buildElectron() {
  log('Building for Electron (Windows, macOS, Linux)...', 'info');
  
  try {
    // Install dependencies
    log('Installing npm dependencies...', 'info');
    execSync('npm install', { 
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    // Build
    log('Running Electron build...', 'info');
    execSync('npm run dist', { 
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, ELECTRON_BUILDER_OVERRIDE_MACOS_VERSION: '11.0' }
    });
    
    log('Electron build completed successfully', 'success');
  } catch (error) {
    log(`Electron build failed: ${error.message}`, 'error');
    throw error;
  }
}

function buildTauri() {
  log('Building for Tauri (Windows, macOS, Linux)...', 'info');
  
  try {
    // Install Rust dependencies
    log('Installing Rust dependencies...', 'info');
    execSync('cargo fetch', { 
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: path.join(BUILDS_DIR, 'tauri')
    });
    
    // Build
    log('Running Tauri build...', 'info');
    execSync('npm run tauri build', { 
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    log('Tauri build completed successfully', 'success');
  } catch (error) {
    log(`Tauri build failed: ${error.message}`, 'error');
    throw error;
  }
}

function buildAndroid() {
  log('Building for Android...', 'info');
  
  const androidDir = path.join(BUILDS_DIR, 'android');
  
  try {
    // Check for gradle wrapper
    const gradleWrapper = path.join(androidDir, 'gradlew');
    if (!fs.existsSync(gradleWrapper)) {
      log('Generating Gradle wrapper...', 'info');
      execSync('gradle wrapper', { 
        encoding: 'utf8',
        stdio: 'inherit',
        cwd: androidDir
      });
    }
    
    // Build release APK
    log('Building Android release APK...', 'info');
    execSync('./gradlew assembleRelease', { 
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: androidDir
    });
    
    // Build AAB
    log('Building Android App Bundle...', 'info');
    execSync('./gradlew bundleRelease', { 
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: androidDir
    });
    
    log('Android build completed successfully', 'success');
  } catch (error) {
    log(`Android build failed: ${error.message}`, 'error');
    throw error;
  }
}

function buildIOS() {
  log('Building for iOS...', 'info');
  
  const iosDir = path.join(BUILDS_DIR, 'ios');
  
  try {
    // Generate Xcode project if needed
    const xcodeprojDir = path.join(iosDir, 'NeuralVoiceOS.xcodeproj');
    if (!fs.existsSync(xcodeprojDir)) {
      log('Generating Xcode project with XcodeGen...', 'info');
      if (spawnSync('which', ['xcodegen'], { encoding: 'utf8' }).status !== 0) {
        throw new Error('XcodeGen is not installed. Install with: brew install xcodegen');
      }
      execSync('xcodegen generate', { 
        encoding: 'utf8',
        stdio: 'inherit',
        cwd: iosDir
      });
    }
    
    // Build archive
    log('Building iOS archive...', 'info');
    execSync('xcodebuild -project NeuralVoiceOS.xcodeproj -scheme NeuralVoiceOS -configuration Release -archivePath build/NeuralVoiceOS archive', { 
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: iosDir
    });
    
    // Export IPA
    log('Exporting iOS IPA...', 'info');
    execSync('xcodebuild -exportArchive -archivePath build/NeuralVoiceOS.xcarchive -exportPath dist/ -exportOptionsPlist exportOptions.plist', { 
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: iosDir
    });
    
    log('iOS build completed successfully', 'success');
  } catch (error) {
    log(`iOS build failed: ${error.message}`, 'error');
    throw error;
  }
}

async function buildPlatform(platform) {
  log(`Starting build for ${platform}...`, 'info');
  
  try {
    checkPrerequisites(platform);
    ensureOutputDir();
    
    switch (platform) {
      case 'electron':
        await buildElectron();
        break;
      case 'tauri':
        await buildTauri();
        break;
      case 'android':
        await buildAndroid();
        break;
      case 'ios':
        await buildIOS();
        break;
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
    
    log(`Build completed for ${platform}`, 'success');
  } catch (error) {
    log(`Build failed for ${platform}: ${error.message}`, 'error');
    throw error;
  }
}

async function buildAll() {
  log('Starting builds for all platforms...', 'info');
  
  const results = {};
  
  for (const platform of Object.keys(PLATFORMS)) {
    try {
      await buildPlatform(platform);
      results[platform] = { success: true };
    } catch (error) {
      results[platform] = { success: false, error: error.message };
    }
  }
  
  // Summary
  log('\n=== Build Summary ===', 'info');
  for (const [platform, result] of Object.entries(results)) {
    const status = result.success ? '✓' : '✗';
    log(`${status} ${platform}: ${result.success ? 'Success' : `Failed: ${result.error}`}`, 
        result.success ? 'success' : 'error');
  }
  
  const failed = Object.values(results).filter(r => !r.success).length;
  if (failed > 0) {
    throw new Error(`${failed} build(s) failed`);
  }
}

async function main() {
  program
    .version('1.0.0')
    .description('Build Local AI Voice Operating System for multiple platforms')
    .option('-p, --platform <name>', 'Build for specific platform (electron, tauri, android, ios)')
    .option('-t, --target <name>', 'Build for specific target (windows, macos, linux)')
    .option('--all', 'Build for all platforms')
    .parse(process.argv);
  
  const options = program.opts();
  
  try {
    if (options.all || (!options.platform && !options.target)) {
      await buildAll();
    } else if (options.platform) {
      await buildPlatform(options.platform);
    } else if (options.target) {
      const platformMap = {
        windows: 'electron',
        macos: 'electron',
        linux: 'electron'
      };
      const platform = platformMap[options.target] || options.target;
      await buildPlatform(platform);
    }
    
    log('\nAll builds completed successfully!', 'success');
    process.exit(0);
  } catch (error) {
    log(`\nBuild process failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

main();
