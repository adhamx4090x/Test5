#!/bin/bash
# ============================================================================
# Neural Voice OS - macOS Build Script
# ============================================================================
# This script builds the Neural Voice OS application for macOS.
# Supports both Electron and Tauri builds for x64, arm64, and Universal binaries.
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
MODE="tauri"
ARCH="universal"
CONFIG="release"
CLEAN=0
VERBOSE=0
SIGN=0
HELP=0

# Script metadata
SCRIPT_VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# ============================================================================
# Utility Functions
# ============================================================================

print_step() {
    local step=$1
    local total=$2
    local message=$3
    echo -e "\n${CYAN}[$step/$total]${NC} $message"
}

print_success() {
    echo -e "  ${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "  ${RED}✗${NC} $1" >&2
}

print_warning() {
    echo -e "  ${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "  ${CYAN}●${NC} $1"
}

show_help() {
    cat << EOF
Neural Voice OS - macOS Build Script
=====================================

Usage: $0 [options]

Options:
  --mode    Build mode: electron or tauri (default: tauri)
  --arch    Target architecture: x64, arm64, or universal (default: universal)
  --config  Build configuration: release or debug (default: release)
  --clean   Clean build artifacts before building
  --sign    Sign the application (requires certificates)
  --verbose Enable verbose output
  --help    Show this help message

Examples:
  $0                              # Build Tauri Universal release
  $0 --mode electron              # Build Electron instead of Tauri
  $0 --arch arm64                 # Build for Apple Silicon only
  $0 --clean --verbose            # Clean build with verbose output
  $0 --sign                       # Build and sign for distribution

Requirements:
  - macOS 11.0+ (Big Sur) or later
  - Node.js 18+
  - npm 9+
  - Xcode Command Line Tools
  - Rust/Cargo (for Tauri builds)
  - For Tauri: Xcode 14+

EOF
    exit 0
}

check_prerequisites() {
    local missing=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found"
        missing+=("Node.js")
    else
        local node_version
        node_version=$(node --version)
        print_success "Node.js ${node_version#v}"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not found"
        missing+=("npm")
    else
        local npm_version
        npm_version=$(npm --version)
        print_success "npm $npm_version"
    fi
    
    # Check Xcode Command Line Tools
    if ! xcode-select -p &> /dev/null; then
        print_error "Xcode Command Line Tools not found"
        print_info "Install with: xcode-select --install"
        missing+=("Xcode Command Line Tools")
    else
        print_success "Xcode Command Line Tools installed"
    fi
    
    # Check Rust (if building Tauri)
    if [[ "$MODE" == "tauri" ]]; then
        if ! command -v cargo &> /dev/null; then
            print_error "Rust/Cargo not found (required for Tauri)"
            print_info "Install from: https://rustup.rs/"
            missing+=("Rust/Cargo")
        else
            local rust_version
            rust_version=$(cargo --version 2>/dev/null || echo "unknown")
            print_success "$rust_version"
        fi
    fi
    
    # Check Homebrew (optional but recommended)
    if ! command -v brew &> /dev/null; then
        print_warning "Homebrew not found (recommended for dependencies)"
        print_info "Install from: https://brew.sh/"
    else
        print_success "Homebrew installed"
    fi
    
    if [[ ${#missing[@]} -gt 0 ]]; then
        echo ""
        print_error "Missing required prerequisites:"
        for item in "${missing[@]}"; do
            echo "  - $item"
        done
        echo ""
        echo "Please install the missing components and try again."
        exit 1
    fi
}

install_dependencies() {
    print_step 2 5 "Installing dependencies..."
    
    cd "$PROJECT_ROOT"
    
    if [[ -d "node_modules" ]]; then
        print_info "Dependencies already installed, skipping npm install"
    else
        print_info "Running npm install..."
        if ! npm install --no-progress --legacy-peer-deps; then
            print_error "npm install failed"
            exit 1
        fi
        print_success "Dependencies installed"
    fi
    
    # Install XcodeGen if not present
    if ! command -v xcodegen &> /dev/null; then
        print_info "Installing XcodeGen..."
        if command -v brew &> /dev/null; then
            brew install xcodegen
            print_success "XcodeGen installed"
        else
            print_warning "XcodeGen not found. iOS builds may fail."
        fi
    fi
}

prepare_build() {
    print_step 3 5 "Preparing build..."
    
    cd "$PROJECT_ROOT"
    
    if [[ $CLEAN -eq 1 ]]; then
        print_info "Cleaning previous build artifacts..."
        
        # Remove dist directory
        if [[ -d "dist" ]]; then
            rm -rf dist
        fi
        
        # Remove Tauri target directory
        if [[ -d "builds/tauri/target" ]]; then
            rm -rf builds/tauri/target
        fi
        
        # Remove Electron dist
        if [[ -d "node_modules/.cache/electron" ]]; then
            rm -rf node_modules/.cache/electron
        fi
        
        print_success "Build artifacts cleaned"
    fi
    
    # Create output directory
    mkdir -p dist
    
    # Generate Xcode project if needed for iOS (not macOS, but ensure it's ready)
    if [[ -f "builds/ios/project.yml" ]]; then
        cd builds/ios
        if ! command -v xcodegen &> /dev/null; then
            print_info "XcodeGen not found, skipping iOS project generation"
        else
            print_info "Generating iOS project with XcodeGen..."
            xcodegen generate 2>/dev/null || true
        fi
        cd "$PROJECT_ROOT"
    fi
}

build_electron() {
    print_step 4 5 "Building Electron application..."
    
    cd "$PROJECT_ROOT"
    
    local build_args=("--mac" "--$CONFIG")
    
    case "$ARCH" in
        x64)
            build_args+=("--x64")
            ;;
        arm64)
            build_args+=("--arm64")
            ;;
        universal)
            build_args+=("--universal")
            ;;
    esac
    
    if [[ $VERBOSE -eq 1 ]]; then
        npx electron-builder "${build_args[@]}"
    else
        npx electron-builder "${build_args[@]}" 2>&1 | \
            grep -v "\[webpack" | \
            grep -v "building" | \
            grep -v "processing" || true
    fi
    
    if [[ $? -ne 0 ]]; then
        print_error "Electron build failed"
        exit 1
    fi
    
    print_success "Electron build complete"
}

build_tauri() {
    print_step 4 5 "Building Tauri application..."
    
    cd "$PROJECT_ROOT/builds/tauri"
    
    # Determine target based on architecture
    local target=""
    case "$ARCH" in
        x64)
            target="x86_64-apple-darwin"
            ;;
        arm64)
            target="aarch64-apple-darwin"
            ;;
        universal)
            # For universal builds, we need to build both architectures
            target="universal"
            ;;
    esac
    
    # Build for specified architecture(s)
    if [[ "$ARCH" == "universal" ]]; then
        print_info "Building Universal binary (x64 + arm64)..."
        
        # Build for x86_64
        print_info "Building for x86_64-apple-darwin..."
        cargo build --release --target x86_64-apple-darwin 2>&1 | \
            grep -v "Finished" | \
            grep -v "Compiling" | \
            grep -v "Downloading" || true
        
        # Build for arm64
        print_info "Building for aarch64-apple-darwin..."
        cargo build --release --target aarch64-apple-darwin 2>&1 | \
            grep -v "Finished" | \
            grep -v "Compiling" | \
            grep -v "Downloading" || true
        
        # Create universal binary using lipo
        print_info "Creating universal binary..."
        local x64_binary="target/x86_64-apple-darwin/release/neural_voice_os"
        local arm64_binary="target/aarch64-apple-darwin/release/neural_voice_os"
        local universal_binary="target/release/neural_voice_os"
        
        if [[ -f "$x64_binary" && -f "$arm64_binary" ]]; then
            cp "$x64_binary" "$universal_binary"
            lipo -create -output "$universal_binary" "$x64_binary" "$arm64_binary"
            print_success "Universal binary created"
        fi
        
        # Build bundles
        cargo tauri build --bundles dmg --release 2>&1 | \
            grep -v "Finished" | \
            grep -v "Compiling" | \
            grep -v "Downloading" || true
        
    else
        # Build for single architecture
        if [[ $VERBOSE -eq 1 ]]; then
            cargo tauri build --bundles dmg --target "$target" --release
        else
            cargo tauri build --bundles dmg --target "$target" --release 2>&1 | \
                grep -v "Finished" | \
                grep -v "Compiling" | \
                grep -v "Downloading" || true
        fi
    fi
    
    if [[ $? -ne 0 ]]; then
        print_error "Tauri build failed"
        cd "$PROJECT_ROOT"
        exit 1
    fi
    
    cd "$PROJECT_ROOT"
    
    # Copy build artifacts
    local output_dir="dist/macos/tauri/$ARCH"
    mkdir -p "$output_dir"
    
    # Find and copy DMG files
    find builds/tauri/target -name "*.dmg" -type f 2>/dev/null | while read -r dmg; do
        cp "$dmg" "$output_dir/"
        print_success "Copied: $(basename "$dmg")"
    done
    
    # Copy app bundle
    find builds/tauri/target -name "Neural Voice OS.app" -type d 2>/dev/null | while read -r app; do
        cp -r "$app" "$output_dir/"
        print_success "Copied: $(basename "$app")"
    done
    
    print_success "Tauri build complete"
}

sign_app() {
    if [[ $SIGN -eq 0 ]]; then
        return 0
    fi
    
    print_info "Signing application..."
    
    # Check for signing certificate
    if ! security find-identity -v -p codesigning 2>/dev/null | grep -q "."; then
        print_warning "No code signing certificate found. Skipping signing."
        print_info "To sign, import a Developer ID certificate to Keychain."
        return 0
    fi
    
    # Sign the application
    local app_path
    app_path=$(find dist -name "Neural Voice OS.app" -type d | head -1)
    
    if [[ -n "$app_path" ]]; then
        codesign --force --sign - --deep --entitlements entitlements.plist "$app_path"
        if [[ $? -eq 0 ]]; then
            print_success "Application signed"
        else
            print_warning "Signing failed"
        fi
    fi
    
    # Notarize the application (if credentials available)
    if [[ -n "${APPLE_ID:-}" && -n "${APPLE_ID_PASSWORD:-}" ]]; then
        print_info "Notarizing application..."
        # xcrun notarytool submit ...
        print_warning "Notarization requires additional configuration"
    fi
}

build_summary() {
    print_step 5 5 "Build Summary:"
    
    echo -e "  ${GREEN}Mode:${NC}      $MODE"
    echo -e "  ${GREEN}Arch:${NC}      $ARCH"
    echo -e "  ${GREEN}Config:${NC}    $CONFIG"
    echo -e "  ${GREEN}Platform:${NC}  macOS"
    
    # Calculate elapsed time
    local end_time
    end_time=$(date +%s)
    local elapsed=$((end_time - START_TIME))
    local minutes=$((elapsed / 60))
    local seconds=$((elapsed % 60))
    echo -e "  ${GREEN}Time:${NC}      ${minutes}m ${seconds}s"
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    Build Complete!                           ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Display output files
    echo -e "${CYAN}Build artifacts:${NC}"
    find dist -type f \( -name "*.dmg" -o -name "*.app" -o -name "*.pkg" \) 2>/dev/null | while read -r file; do
        local relative_path="${file#$PROJECT_ROOT/}"
        echo "  - $relative_path"
    done
    
    echo ""
}

# ============================================================================
# Main Execution
# ============================================================================

# Record start time
START_TIME=$(date +%s)

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --mode)
            MODE="$2"
            shift 2
            ;;
        --arch)
            ARCH="$2"
            shift 2
            ;;
        --config)
            CONFIG="$2"
            shift 2
            ;;
        --clean)
            CLEAN=1
            shift
            ;;
        --sign)
            SIGN=1
            shift
            ;;
        --verbose)
            VERBOSE=1
            shift
            ;;
        --help)
            HELP=1
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Show help if requested
if [[ $HELP -eq 1 ]]; then
    show_help
fi

# Validate architecture
case "$ARCH" in
    x64|arm64|universal)
        ;;
    *)
        print_error "Invalid architecture: $ARCH"
        echo "Valid options: x64, arm64, universal"
        exit 1
        ;;
esac

# Validate mode
case "$MODE" in
    electron|tauri)
        ;;
    *)
        print_error "Invalid mode: $MODE"
        echo "Valid options: electron, tauri"
        exit 1
        ;;
esac

# Display banner
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║          Neural Voice OS - macOS Build Script               ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Run build steps
check_prerequisites
install_dependencies
prepare_build

if [[ "$MODE" == "electron" ]]; then
    build_electron
else
    build_tauri
fi

sign_app
build_summary

exit 0
