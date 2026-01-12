#!/bin/bash
# ============================================================================
# Neural Voice OS - Android Build Script
# ============================================================================
# This script builds the Neural Voice OS application for Android.
# Supports debug and release builds, APK and AAB formats.
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
VARIANT="release"
FORMAT="apk"
CONFIG="release"
CLEAN=0
VERBOSE=0
HELP=0

# Script metadata
SCRIPT_VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/builds/android"

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
Neural Voice OS - Android Build Script
======================================

Usage: $0 [options]

Options:
  --variant  Build variant: debug or release (default: release)
  --format   Output format: apk or aab (default: apk)
  --config   Gradle config: release or debug (default: release)
  --clean    Clean build artifacts before building
  --verbose  Enable verbose output
  --help     Show this help message

Examples:
  $0                              # Build release APK
  $0 --variant debug              # Build debug APK
  $0 --format aab                 # Build App Bundle for Play Store
  $0 --variant debug --clean      # Clean debug build
  $0 --verbose                    # Build with verbose output

Requirements:
  - Linux, macOS, or Windows with WSL
  - Java JDK 17 (JDK 11 minimum)
  - Android SDK with:
    - Android SDK Build-Tools 34.0+
    - Android SDK Platform 34 (API 34)
  - Gradle 8.4+

Environment Variables:
  ANDROID_HOME    Path to Android SDK
  ANDROID_SDK_ROOT  Alternative SDK path
  JAVA_HOME       Path to JDK installation

EOF
    exit 0
}

check_prerequisites() {
    local missing=()
    
    # Check Java
    if ! command -v java &> /dev/null; then
        print_error "Java not found"
        missing+=("Java JDK")
    else
        local java_version
        java_version=$(java -version 2>&1 | head -1 | cut -d'"' -f2)
        print_success "Java $java_version"
        
        # Check Java version (need 11+)
        local major
        major=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
        if [[ "$major" -lt 11 ]]; then
            print_warning "Java version is below 11. JDK 17 recommended."
        fi
    fi
    
    # Check javac
    if ! command -v javac &> /dev/null; then
        print_error "javac not found (JDK may be incomplete)"
        missing+=("javac")
    else
        print_success "javac installed"
    fi
    
    # Check Gradle
    if ! command -v gradle &> /dev/null; then
        print_warning "Gradle not found, will use wrapper"
    else
        local gradle_version
        gradle_version=$(gradle --version 2>/dev/null | head -1 | cut -d' ' -f2)
        print_success "Gradle $gradle_version"
    fi
    
    # Check Android SDK
    local android_sdk="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
    if [[ -z "$android_sdk" ]]; then
        # Check common locations
        if [[ -d "$HOME/Android/Sdk" ]]; then
            android_sdk="$HOME/Android/Sdk"
        elif [[ -d "/opt/android-sdk" ]]; then
            android_sdk="/opt/android-sdk"
        elif [[ -d "/usr/local/android-sdk" ]]; then
            android_sdk="/usr/local/android-sdk"
        fi
    fi
    
    if [[ -n "$android_sdk" && -d "$android_sdk" ]]; then
        print_success "Android SDK: $android_sdk"
        
        # Check build-tools
        if [[ -d "$android_sdk/build-tools" ]]; then
            local latest_build_tools
            latest_build_tools=$(ls -td "$android_sdk/build-tools/"*/ 2>/dev/null | head -1 | xargs -I{} basename {})
            print_success "Build Tools: $latest_build_tools"
        else
            print_warning "Build Tools not found in SDK"
        fi
        
        # Check platforms
        if [[ -d "$android_sdk/platforms" ]]; then
            local latest_platform
            latest_platform=$(ls -td "$android_sdk/platforms/"*/ 2>/dev/null | head -1 | xargs -I{} basename {})
            print_success "Platform: $latest_platform"
        else
            print_warning "Platforms not found in SDK"
        fi
    else
        print_error "Android SDK not found"
        print_info "Set ANDROID_HOME environment variable or install Android Studio"
        missing+=("Android SDK")
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

configure_android_sdk() {
    local android_sdk="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
    
    # Create local.properties if it doesn't exist
    local props_file="$ANDROID_DIR/local.properties"
    if [[ ! -f "$props_file" ]]; then
        print_info "Creating local.properties..."
        
        if [[ -n "$android_sdk" ]]; then
            echo "sdk.dir=$android_sdk" > "$props_file"
            print_success "Created local.properties with SDK path"
        else
            echo "## EDIT THIS LINE WITH YOUR ANDROID SDK PATH" > "$props_file"
            echo "sdk.dir=/path/to/android/sdk" >> "$props_file"
            print_warning "Created local.properties - edit with your SDK path"
        fi
    fi
}

install_dependencies() {
    print_step 2 5 "Installing dependencies..."
    
    cd "$ANDROID_DIR"
    
    # Check if gradlew exists
    if [[ ! -x "gradlew" ]]; then
        print_info "Making gradlew executable..."
        chmod +x gradlew
    fi
    
    # Download dependencies
    print_info "Downloading Gradle dependencies..."
    if ! ./gradlew dependencies --quiet 2>/dev/null; then
        print_warning "Initial dependency download may take a while..."
        ./gradlew dependencies || {
            print_error "Failed to download dependencies"
            exit 1
        }
    fi
    
    print_success "Dependencies ready"
}

prepare_build() {
    print_step 3 5 "Preparing build..."
    
    cd "$ANDROID_DIR"
    
    if [[ $CLEAN -eq 1 ]]; then
        print_info "Cleaning previous build artifacts..."
        
        # Clean Gradle build
        ./gradlew clean 2>/dev/null || true
        
        # Remove build directories
        rm -rf app/build
        rm -rf build
        
        print_success "Build artifacts cleaned"
    fi
    
    # Create output directory
    mkdir -p "$PROJECT_ROOT/dist/android/$VARIANT"
}

build_debug() {
    print_step 4 5 "Building debug APK..."
    
    cd "$ANDROID_DIR"
    
    if [[ $VERBOSE -eq 1 ]]; then
        ./gradlew assembleDebug
    else
        ./gradlew assembleDebug 2>&1 | \
            grep -v "UP-TO-DATE" | \
            grep -v "BUILD" | \
            grep -v "Deprecated" || true
    fi
    
    if [[ $? -ne 0 ]]; then
        print_error "Debug build failed"
        exit 1
    fi
    
    # Copy APK to output directory
    local apk_path
    apk_path=$(find app/build -name "*-debug.apk" -type f | head -1)
    
    if [[ -n "$apk_path" ]]; then
        cp "$apk_path" "$PROJECT_ROOT/dist/android/$VARIANT/"
        print_success "Debug APK: $(basename "$apk_path")"
    else
        print_warning "Debug APK not found"
    fi
    
    print_success "Debug build complete"
}

build_release() {
    print_step 4 5 "Building release $FORMAT..."
    
    cd "$ANDROID_DIR"
    
    local task="assembleRelease"
    if [[ "$FORMAT" == "aab" ]]; then
        task="bundleRelease"
    fi
    
    if [[ $VERBOSE -eq 1 ]]; then
        ./gradlew "$task"
    else
        ./gradlew "$task" 2>&1 | \
            grep -v "UP-TO-DATE" | \
            grep -v "BUILD" | \
            grep -v "Deprecated" || true
    fi
    
    if [[ $? -ne 0 ]]; then
        print_error "Release build failed"
        exit 1
    fi
    
    # Copy output to output directory
    if [[ "$FORMAT" == "aab" ]]; then
        local aab_path
        aab_path=$(find app/build -name "*.aab" -type f | head -1)
        
        if [[ -n "$aab_path" ]]; then
            cp "$aab_path" "$PROJECT_ROOT/dist/android/$VARIANT/"
            print_success "App Bundle: $(basename "$aab_path")"
        else
            print_warning "App Bundle not found"
        fi
    else
        local apk_path
        apk_path=$(find app/build -name "*-release-unsigned.apk" -type f | head -1)
        
        if [[ -n "$apk_path" ]]; then
            cp "$apk_path" "$PROJECT_ROOT/dist/android/$VARIANT/"
            print_success "Release APK: $(basename "$apk_path")"
        else
            apk_path=$(find app/build -name "*.apk" -type f | grep -v debug | head -1)
            if [[ -n "$apk_path" ]]; then
                cp "$apk_path" "$PROJECT_ROOT/dist/android/$VARIANT/"
                print_success "Release APK: $(basename "$apk_path")"
            else
                print_warning "Release APK not found"
            fi
        fi
    fi
    
    print_success "Release build complete"
}

sign_apk() {
    if [[ "$VARIANT" != "release" ]]; then
        return 0
    fi
    
    print_info "Signing APK..."
    
    # Check for signing configuration
    if [[ -f "app/signing.properties" ]]; then
        source app/signing.properties
        
        if [[ -n "${storeFile:-}" && -f "$storeFile" ]]; then
            print_info "Found signing configuration, APK should be signed"
            
            # Sign the APK
            local unsigned_apk
            unsigned_apk=$(find app/build -name "*-release-unsigned.apk" -type f | head -1)
            
            if [[ -n "$unsigned_apk" ]]; then
                local signed_apk="${unsigned_apk%-unsigned.apk}-signed.apk"
                
                if command -v apksigner &> /dev/null; then
                    apksigner sign \
                        --ks "$storeFile" \
                        --ks-key-alias "$keyAlias" \
                        --ks-pass "pass:$storePassword" \
                        --key-pass "pass:$keyPassword" \
                        --out "$signed_apk" \
                        "$unsigned_apk"
                    
                    if [[ -f "$signed_apk" ]]; then
                        cp "$signed_apk" "$PROJECT_ROOT/dist/android/$VARIANT/"
                        print_success "Signed APK: $(basename "$signed_apk")"
                    fi
                else
                    print_warning "apksigner not found, APK may remain unsigned"
                fi
            fi
        else
            print_info "No signing configuration found, APK is unsigned"
            print_info "To sign, create app/signing.properties with keystore details"
        fi
    fi
}

build_summary() {
    print_step 5 5 "Build Summary:"
    
    echo -e "  ${GREEN}Variant:${NC}   $VARIANT"
    echo -e "  ${GREEN}Format:${NC}    $FORMAT"
    echo -e "  ${GREEN}Config:${NC}    $CONFIG"
    echo -e "  ${GREEN}Platform:${NC}  Android"
    
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
    find "$PROJECT_ROOT/dist/android" -type f \( -name "*.apk" -o -name "*.aab" \) 2>/dev/null | while read -r file; do
        local relative_path="${file#$PROJECT_ROOT/}"
        local size
        size=$(du -h "$file" | cut -f1)
        echo "  - $relative_path ($size)"
    done
    
    echo ""
    echo -e "${YELLOW}Note:${NC} Release builds may need signing before distribution"
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
        --variant)
            VARIANT="$2"
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

# Validate variant
case "$VARIANT" in
    debug|release)
        ;;
    *)
        print_error "Invalid variant: $VARIANT"
        echo "Valid options: debug, release"
        exit 1
        ;;
esac

# Validate format
case "$FORMAT" in
    apk|aab)
        ;;
    *)
        print_error "Invalid format: $FORMAT"
        echo "Valid options: apk, aab"
        exit 1
        ;;
esac

# Display banner
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║          Neural Voice OS - Android Build Script             ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Run build steps
check_prerequisites
configure_android_sdk
install_dependencies
prepare_build

if [[ "$VARIANT" == "debug" ]]; then
    build_debug
else
    build_release
fi

sign_apk
build_summary

exit 0
