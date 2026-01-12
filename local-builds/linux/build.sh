#!/bin/bash
# ============================================================================
# Neural Voice OS - Linux Build Script
# ============================================================================
# This script builds the Neural Voice OS application for Linux.
# Supports both Electron and Tauri builds for x64, arm64, and armv7l architectures.
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
ARCH="x64"
FORMAT="deb"
CONFIG="release"
CLEAN=0
VERBOSE=0
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
Neural Voice OS - Linux Build Script
====================================

Usage: $0 [options]

Options:
  --mode    Build mode: electron or tauri (default: tauri)
  --arch    Target architecture: x64, arm64, or armv7l (default: x64)
  --format  Package format: deb, rpm, or appimage (default: deb)
  --config  Build configuration: release or debug (default: release)
  --clean   Clean build artifacts before building
  --verbose Enable verbose output
  --help    Show this help message

Examples:
  $0                              # Build Tauri DEB package for x64
  $0 --mode electron              # Build Electron instead of Tauri
  $0 --arch arm64                 # Build for ARM64 (e.g., Raspberry Pi)
  $0 --format appimage            # Build AppImage instead of DEB
  $0 --clean --verbose            # Clean build with verbose output

Requirements:
  - Linux (Ubuntu 20.04+, Debian 11+, Fedora 35+, or equivalent)
  - Node.js 18+
  - npm 9+
  - Rust/Cargo (for Tauri builds)
  - Build tools (gcc, make, etc.)

Supported Distributions:
  - Ubuntu/Debian (apt-based)
  - Fedora/RHEL (dnf/yum-based)
  - Arch Linux (pacman-based)

EOF
    exit 0
}

detect_distro() {
    if [[ -f /etc/os-release ]]; then
        source /etc/os-release
        echo "$ID"
    elif [[ -f /etc/redhat-release ]]; then
        if grep -q "Fedora" /etc/redhat-release; then
            echo "fedora"
        else
            echo "rhel"
        fi
    else
        echo "unknown"
    fi
}

check_prerequisites() {
    local missing=()
    local distro
    distro=$(detect_distro)
    
    print_info "Detected distribution: $distro"
    
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
    
    # Check build essentials
    if ! command -v gcc &> /dev/null; then
        print_error "gcc not found"
        missing+=("gcc")
    else
        local gcc_version
        gcc_version=$(gcc --version | head -1)
        print_success "$gcc_version"
    fi
    
    # Check make
    if ! command -v make &> /dev/null; then
        print_error "make not found"
        missing+=("make")
    else
        print_success "make installed"
    fi
    
    # Check pkg-config
    if ! command -v pkg-config &> /dev/null; then
        print_warning "pkg-config not found (may be required for some builds)"
    else
        print_success "pkg-config installed"
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

install_system_dependencies() {
    local distro
    distro=$(detect_distro)
    
    print_info "Installing system dependencies for $distro..."
    
    case "$distro" in
        ubuntu|debian|linuxmint|pop)
            sudo apt-get update
            sudo apt-get install -y \
                libnss3 \
                libatk-bridge2.0-0 \
                libdrm2 \
                libxkbcommon0 \
                libgbm1 \
                libasound2 \
                libxshmfence1 \
                libgtk-3-0 \
                libnotify4 \
                libx11-xcb1 \
                libxcb-dri3-0 \
                libatspi2.0-0 \
                libxcomposite1 \
                libxdamage1 \
                libxfixes3 \
                libxrandr2 \
                libstdc++6 \
                libpango-1.0-0 \
                libcairo2 \
                libcups2 \
                libdbus-1-3 \
                libexpat1 \
                libxcb1 \
                libx11-6 \
                libxext6 \
                libxrender1
            print_success "System dependencies installed"
            ;;
        fedora|rhel|centos)
            sudo dnf install -y \
                nss \
                atk \
                at-spi2-atk \
                libdrm \
                libxkbcommon \
                mesa-libgbm \
                alsa-lib \
                libxshmfence \
                gtk3 \
                libnotify \
                libX11 \
                libXcomposite \
                libXdamage \
                libXfixes \
                libXrandr \
                libstdc++ \
                pango \
                cairo \
                cups \
                dbus \
                expat \
                libxcb \
                libXext \
                libXrender
            print_success "System dependencies installed"
            ;;
        arch|manjaro)
            sudo pacman -Sy --noconfirm \
                nss \
                atk \
                at-spi2-atk \
                libdrm \
                libxkbcommon \
                mesa \
                alsa-lib \
                libxshmfence \
                gtk3 \
                libnotify \
                libX11 \
                libXcomposite \
                libXdamage \
                libXfixes \
                libXrandr \
                libstdc++ \
                pango \
                cairo \
                cups \
                dbus \
                expat \
                libxcb \
                libXext \
                libXrender
            print_success "System dependencies installed"
            ;;
        *)
            print_warning "Unknown distribution. You may need to install dependencies manually."
            print_info "Common dependencies: libnss3, libatk-bridge2.0-0, libgtk-3-0, libgbm1"
            ;;
    esac
}

install_tauri_dependencies() {
    local distro
    distro=$(detect_distro)
    
    if [[ "$MODE" != "tauri" ]]; then
        return 0
    fi
    
    print_info "Installing Tauri system dependencies for $distro..."
    
    case "$distro" in
        ubuntu|debian|linuxmint|pop)
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
                libxrender-dev \
                libxshmfence-dev
            print_success "Tauri dependencies installed"
            ;;
        fedora|rhel|centos)
            sudo dnf install -y \
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
                libXrender-devel \
                libxshmfence-devel
            print_success "Tauri dependencies installed"
            ;;
        arch|manjaro)
            sudo pacman -Sy --noconfirm \
                webkit2gtk \
                libappindicator-gtk3 \
                libsoup3 \
                javascriptcoregtk4 \
                alsa-lib \
                atk \
                at-spi2-atk \
                cairo \
                dbus \
                libdrm \
                mesa \
                gtk3 \
                libX11 \
                libXcomposite \
                libXdamage \
                libXext \
                libXfixes \
                libXi \
                libxkbcommon \
                libXrandr \
                libXrender \
                libxshmfence
            print_success "Tauri dependencies installed"
            ;;
        *)
            print_warning "Unknown distribution. Tauri dependencies may need manual installation."
            ;;
    esac
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
        
        # Remove Electron cache
        if [[ -d "node_modules/.cache/electron" ]]; then
            rm -rf node_modules/.cache/electron
        fi
        
        print_success "Build artifacts cleaned"
    fi
    
    # Create output directory
    mkdir -p dist
}

build_electron() {
    print_step 4 5 "Building Electron application..."
    
    cd "$PROJECT_ROOT"
    
    local build_args=("--linux" "--$CONFIG")
    
    # Map architecture names
    case "$ARCH" in
        x64)
            build_args+=("--x64")
            ;;
        arm64)
            build_args+=("--arm64")
            ;;
        armv7l)
            build_args+=("--armv7l")
            ;;
    esac
    
    # Map package format
    case "$FORMAT" in
        deb)
            # DEB is default for electron-builder on Linux
            ;;
        rpm)
            build_args+=("--rpm")
            ;;
        appimage)
            build_args+=("--appimage")
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
            target="x86_64-unknown-linux-gnu"
            ;;
        arm64)
            target="aarch64-unknown-linux-gnu"
            ;;
        armv7l)
            target="armv7-unknown-linux-gnueabihf"
            ;;
    esac
    
    # Determine bundle format
    local bundles=""
    case "$FORMAT" in
        deb)
            bundles="--bundles deb"
            ;;
        rpm)
            bundles="--bundles rpm"
            ;;
        appimage)
            bundles="--bundles appimage"
            ;;
    esac
    
    if [[ $VERBOSE -eq 1 ]]; then
        cargo tauri build $bundles --target "$target" --release
    else
        cargo tauri build $bundles --target "$target" --release 2>&1 | \
            grep -v "Finished" | \
            grep -v "Compiling" | \
            grep -v "Downloading" || true
    fi
    
    if [[ $? -ne 0 ]]; then
        print_error "Tauri build failed"
        cd "$PROJECT_ROOT"
        exit 1
    fi
    
    cd "$PROJECT_ROOT"
    
    # Copy build artifacts
    local output_dir="dist/linux/tauri/$ARCH/$FORMAT"
    mkdir -p "$output_dir"
    
    # Find and copy appropriate files
    case "$FORMAT" in
        deb)
            find builds/tauri/target -name "*.deb" -type f 2>/dev/null | while read -r file; do
                cp "$file" "$output_dir/"
                print_success "Copied: $(basename "$file")"
            done
            ;;
        rpm)
            find builds/tauri/target -name "*.rpm" -type f 2>/dev/null | while read -r file; do
                cp "$file" "$output_dir/"
                print_success "Copied: $(basename "$file")"
            done
            ;;
        appimage)
            find builds/tauri/target -name "*.AppImage" -type f 2>/dev/null | while read -r file; do
                cp "$file" "$output_dir/"
                print_success "Copied: $(basename "$file")"
            done
            ;;
    esac
    
    print_success "Tauri build complete"
}

build_summary() {
    print_step 5 5 "Build Summary:"
    
    echo -e "  ${GREEN}Mode:${NC}      $MODE"
    echo -e "  ${GREEN}Arch:${NC}      $ARCH"
    echo -e "  ${GREEN}Format:${NC}    $FORMAT"
    echo -e "  ${GREEN}Config:${NC}    $CONFIG"
    echo -e "  ${GREEN}Platform:${NC}  Linux"
    
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
    find dist -type f \( -name "*.deb" -o -name "*.rpm" -o -name "*.AppImage" -o -name "*.tar.gz" \) 2>/dev/null | while read -r file; do
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
        --format)
            FORMAT="$2"
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
    x64|arm64|armv7l)
        ;;
    *)
        print_error "Invalid architecture: $ARCH"
        echo "Valid options: x64, arm64, armv7l"
        exit 1
        ;;
esac

# Validate format
case "$FORMAT" in
    deb|rpm|appimage)
        ;;
    *)
        print_error "Invalid format: $FORMAT"
        echo "Valid options: deb, rpm, appimage"
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
echo -e "${CYAN}║           Neural Voice OS - Linux Build Script              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Run build steps
check_prerequisites
install_system_dependencies
if [[ "$MODE" == "tauri" ]]; then
    install_tauri_dependencies
fi
install_dependencies
prepare_build

if [[ "$MODE" == "electron" ]]; then
    build_electron
else
    build_tauri
fi

build_summary

exit 0
