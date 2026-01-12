#!/usr/bin/env node
/**
 * Icon Generation Script
 * Converts SVG icons to platform-specific formats
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ICONS_DIR = path.join(__dirname, '..', 'icons');
const BUILDS_ICONS_DIR = path.join(__dirname, '..', 'builds', 'icons');

const SVG_ICONS = [
  { name: 'icon-windows.svg', platform: 'windows' },
  { name: 'icon-macos.svg', platform: 'macos' },
  { name: 'icon-linux.svg', platform: 'linux' },
  { name: 'icon-android.svg', platform: 'android' },
  { name: 'icon-ios.svg', platform: 'ios' }
];

const WINDOWS_SIZES = [16, 24, 32, 48, 64, 128, 256, 512];
const MACOS_SIZES = [16, 32, 64, 128, 256, 512, 1024];
const LINUX_SIZES = [16, 24, 32, 48, 64, 128, 256, 512];
const ANDROID_SIZES = [36, 48, 72, 96, 144, 192];
const IOS_SIZES = [20, 29, 40, 60, 76, 83.5, 1024];

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`Created directory: ${dir}`);
  }
}

function checkDependencies() {
  try {
    execSync('which convert', { encoding: 'utf8' });
  } catch (error) {
    try {
      execSync('which magick', { encoding: 'utf8' });
    } catch (error2) {
      throw new Error('ImageMagick is required. Install with: brew install imagemagick');
    }
  }
}

function convertSvgToPng(svgPath, outputPath, size) {
  const command = `convert -background transparent "${svgPath}" -resize ${size}x${size} "${outputPath}"`;
  execSync(command, { encoding: 'utf8' });
}

function convertSvgToIco(svgPath, outputPath, sizes) {
  const tempFiles = [];
  
  try {
    // Create temporary PNG files for each size
    for (const size of sizes) {
      const tempPath = outputPath.replace('.ico', `_${size}.png`);
      convertSvgToPng(svgPath, tempPath, size);
      tempFiles.push(tempPath);
    }
    
    // Combine into ICO
    execSync(`convert ${tempFiles.join(' ')} "${outputPath}"`, { encoding: 'utf8' });
    
    // Clean up temp files
    tempFiles.forEach(file => fs.unlinkSync(file));
    
  } catch (error) {
    // Clean up on error
    tempFiles.forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
    throw error;
  }
}

function convertSvgToIcns(svgPath, outputPath, sizes) {
  const tempDir = path.join(__dirname, 'temp_icns');
  ensureDir(tempDir);
  
  try {
    // Create PNG files for each size
    const pngFiles = [];
    for (const size of sizes) {
      const pngPath = path.join(tempDir, `icon_${size}x${size}.png`);
      convertSvgToPng(svgPath, pngPath, size);
      pngFiles.push(pngPath);
    }
    
    // Create ICNS using iconutil (macOS only)
    const iconsetDir = path.join(tempDir, 'icon.iconset');
    ensureDir(iconsetDir);
    
    for (const png of pngFiles) {
      const size = parseInt(path.basename(png).match(/\d+/)[0]);
      const suffix = size >= 1024 ? '@2x' : '';
      const destName = `icon_${size}x${size}${suffix}.png`;
      fs.copyFileSync(png, path.join(iconsetDir, destName));
    }
    
    // Convert to ICNS
    execSync(`iconutil -c icns "${iconsetDir}" -o "${outputPath}"`, { encoding: 'utf8' });
    
    // Clean up
    fs.rmSync(tempDir, { recursive: true, force: true });
    
  } catch (error) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw error;
  }
}

function generateWindowsIcons(svgPath, outputDir) {
  log('Generating Windows icons...');
  const icoPath = path.join(outputDir, 'icon-windows.ico');
  convertSvgToIco(svgPath, icoPath, WINDOWS_SIZES);
  log(`Created: ${icoPath}`);
}

function generateMacosIcons(svgPath, outputDir) {
  log('Generating macOS icons...');
  const icnsPath = path.join(outputDir, 'icon-macos.icns');
  convertSvgToIcns(svgPath, icnsPath, MACOS_SIZES);
  log(`Created: ${icnsPath}`);
}

function generateLinuxIcons(svgPath, outputDir) {
  log('Generating Linux icons...');
  for (const size of LINUX_SIZES) {
    const pngPath = path.join(outputDir, `icon-linux-${size}x${size}.png`);
    convertSvgToPng(svgPath, pngPath, size);
    log(`Created: ${pngPath}`);
  }
}

function generateAndroidIcons(svgPath, outputDir) {
  log('Generating Android icons...');
  
  // Create mipmap directories
  const mipmapDirs = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
    'mipmap-anydpi-v26': 192
  };
  
  for (const [dir, size] of Object.entries(mipmapDirs)) {
    const mipmapDir = path.join(outputDir, dir);
    ensureDir(mipmapDir);
    
    const pngPath = path.join(mipmapDir, 'ic_launcher.png');
    convertSvgToPng(svgPath, pngPath, size);
    log(`Created: ${pngPath}`);
  }
  
  // Also create ic_launcher_round.png
  const roundPath = path.join(outputDir, 'mipmap-xxxhdpi', 'ic_launcher_round.png');
  convertSvgToPng(svgPath, roundPath, 192);
  log(`Created: ${roundPath}`);
}

function generateIOSIcons(svgPath, outputDir) {
  log('Generating iOS icons...');
  
  const contentsJson = {
    images: [],
    info: {
      author: 'xcode',
      version: 1
    }
  };
  
  const appIconSetDir = path.join(outputDir, 'AppIcon.appiconset');
  ensureDir(appIconSetDir);
  
  const iconSizes = [
    { idiom: 'universal', platform: 'ios', size: '20x20' },
    { idiom: 'universal', platform: 'ios', size: '29x29' },
    { idiom: 'universal', platform: 'ios', size: '40x40' },
    { idiom: 'universal', platform: 'ios', size: '60x60' },
    { idiom: 'universal', platform: 'ios', size: '76x76' },
    { idiom: 'universal', platform: 'ios', size: '83.5x83.5' },
    { idiom: 'universal', platform: 'ios', size: '1024x1024' }
  ];
  
  for (const {idiom, platform, size} of iconSizes) {
    const pixelSize = parseInt(size.split('x')[0]) * 2; // Retina multiplier
    const pngPath = path.join(appIconSetDir, `Icon-App-${pixelSize}x${pixelSize}.png`);
    convertSvgToPng(svgPath, pngPath, pixelSize);
    
    contentsJson.images.push({
      size,
      idiom,
      filename: `Icon-App-${pixelSize}x${pixelSize}.png`,
      scale: '2x'
    });
  }
  
  fs.writeFileSync(
    path.join(appIconSetDir, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );
  log(`Created: ${path.join(appIconSetDir, 'Contents.json')}`);
}

async function main() {
  log('Starting icon generation...');
  
  try {
    checkDependencies();
    ensureDir(ICONS_DIR);
    ensureDir(BUILDS_ICONS_DIR);
    
    for (const { name, platform } of SVG_ICONS) {
      const svgPath = path.join(ICONS_DIR, name);
      
      if (!fs.existsSync(svgPath)) {
        log(`Warning: SVG icon not found: ${svgPath}`, 'warning');
        continue;
      }
      
      switch (platform) {
        case 'windows':
          generateWindowsIcons(svgPath, BUILDS_ICONS_DIR);
          break;
        case 'macos':
          generateMacosIcons(svgPath, BUILDS_ICONS_DIR);
          break;
        case 'linux':
          generateLinuxIcons(svgPath, BUILDS_ICONS_DIR);
          break;
        case 'android':
          generateAndroidIcons(svgPath, BUILDS_ICONS_DIR);
          break;
        case 'ios':
          generateIOSIcons(svgPath, BUILDS_ICONS_DIR);
          break;
      }
    }
    
    log('\nIcon generation completed successfully!', 'success');
    
  } catch (error) {
    log(`Icon generation failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

main();
