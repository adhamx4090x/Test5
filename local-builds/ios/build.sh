#!/bin/bash
# ============================================================================
# Neural Voice OS - iOS Build Script
# ============================================================================
# This script builds the Neural Voice OS application for iOS.
# Supports simulator and device builds, IPA generation.
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
TARGET="device"
CONFIG="release"
CLEAN=0
VERBOSE=0
HELP=0

# Script metadata
SCRIPT_VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
IOS_DIR="$PROJECT_ROOT/builds/ios"

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
Neural Voice OS - iOS Build Script
===================================

Usage: $0 [options]

Options:
  --target   Build target: simulator or device (default: device)
  --config   Build configuration: debug or release (default: release)
  --clean    Clean build artifacts before building
  --verbose  Enable verbose output
  --help     Show this help message

Examples:
  $0                              # Build for device (release)
  $0 --target simulator           # Build for iOS Simulator
  $0 --target device --config debug  # Debug build for device
  $0 --clean                      # Clean and rebuild
  $0 --verbose                    # Build with verbose output

Requirements:
  - macOS 12.0+ (Monterey) or later
  - Xcode 14.0+
  - Xcode Command Line Tools
  - XcodeGen (via Homebrew)
  - Apple Developer Account (for device builds)

Environment Variables:
  DEVELOPMENT_TEAM      Apple Developer Team ID
  CODE_SIGN_IDENTITY    Code signing identity name
  PROVISIONING_PROFILE  Provisioning profile name

EOF
    exit 0
}

check_prerequisites() {
    local missing=()
    
    # Check macOS
    local os_version
    os_version=$(sw_vers -productVersion 2>/dev/null || echo "unknown")
    print_success "macOS $os_version"
    
    # Check Xcode
    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode command line tools not found"
        missing+=("Xcode")
    else
        local xcode_version
        xcode_version=$(xcodebuild -version 2>/dev/null | head -1)
        print_success "$xcode_version"
    fi
    
    # Check XcodeGen
    if ! command -v xcodegen &> /dev/null; then
        print_warning "XcodeGen not found"
        print_info "Install with: brew install xcodegen"
        missing+=("XcodeGen")
    else
        local xcodegen_version
        xcodegen_version=$(xcodegen --version 2>/dev/null)
        print_success "$xcodegen_version"
    fi
    
    # Check CocoaPods (optional)
    if ! command -v pod &> /dev/null; then
        print_info "CocoaPods not found (skipping pod install)"
    else
        print_success "CocoaPods installed"
    fi
    
    # Check available simulators (if building for simulator)
    if [[ "$TARGET" == "simulator" ]]; then
        local simulators
        simulators=$(xcrun simctl list devices available 2>/dev/null | grep -c "iPhone" || echo "0")
        if [[ "$simulators" -eq 0 ]]; then
            print_warning "No iOS simulators found"
            print_info "Install simulators via Xcode → Preferences → Components"
        else
            print_success "$simulators iOS simulators available"
        fi
    fi
    
    # Check for signing configuration (if building for device)
    if [[ "$TARGET" == "device" ]]; then
        if [[ -z "${DEVELOPMENT_TEAM:-}" ]]; then
            print_warning "DEVELOPMENT_TEAM not set (required for device builds)"
            print_info "Set with: export DEVELOPMENT_TEAM=YOUR_TEAM_ID"
        else
            print_success "Development Team configured"
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

generate_project() {
    print_step 2 5 "Generating Xcode project..."
    
    cd "$IOS_DIR"
    
    # Check if project.yml exists
    if [[ ! -f "project.yml" ]]; then
        print_error "project.yml not found"
        exit 1
    fi
    
    # Generate Xcode project
    print_info "Running XcodeGen..."
    if ! xcodegen generate; then
        print_error "XcodeGen failed"
        exit 1
    fi
    
    if [[ -f "Podfile" ]]; then
        print_info "Running CocoaPods..."
        if ! pod install; then
            print_error "CocoaPods failed"
            exit 1
        fi
        print_success "CocoaPods installed"
    fi
    
    print_success "Xcode project generated"
}

prepare_build() {
    print_step 3 5 "Preparing build..."
    
    cd "$IOS_DIR"
    
    if [[ $CLEAN -eq 1 ]]; then
        print_info "Cleaning previous build artifacts..."
        
        # Clean Xcode build
        xcodebuild clean -project NeuralVoiceOS.xcodeproj \
            -scheme NeuralVoiceOS \
            -configuration "$CONFIG" 2>/dev/null || true
        
        # Remove derived data
        rm -rf ~/Library/Developer/Xcode/DerivedData/NeuralVoiceOS-* 2>/dev/null || true
        
        # Remove build directory
        rm -rf build 2>/dev/null || true
        
        print_success "Build artifacts cleaned"
    fi
    
    # Create output directory
    mkdir -p "$PROJECT_ROOT/dist/ios/$CONFIG"
}

build_simulator() {
    print_step 4 5 "Building for iOS Simulator..."
    
    cd "$IOS_DIR"
    
    # Determine destination
    local destination="generic/platform=iOS Simulator"
    
    # Build
    if [[ $VERBOSE -eq 1 ]]; then
        xcodebuild \
            -project NeuralVoiceOS.xcodeproj \
            -scheme NeuralVoiceOS \
            -destination "$destination" \
            -configuration "$CONFIG" \
            build \
            CODE_SIGNING_ALLOWED=NO \
            CODE_SIGNING_REQUIRED=NO \
            CODE_SIGN_IDENTITY=""
    else
        xcodebuild \
            -project NeuralVoiceOS.xcodeproj \
            -scheme NeuralVoiceOS \
            -destination "$destination" \
            -configuration "$CONFIG" \
            build \
            CODE_SIGNING_ALLOWED=NO \
            CODE_SIGNING_REQUIRED=NO \
            CODE_SIGN_IDENTITY="" 2>&1 | \
            grep -v "Build succeeded" | \
            grep -v "warning:" || true
    fi
    
    if [[ $? -ne 0 ]]; then
        print_error "Simulator build failed"
        exit 1
    fi
    
    # Create IPA for simulator (optional, mostly for testing)
    print_info "Creating Simulator package..."
    
    local app_path
    app_path=$(find build -name "Neural Voice OS.app" -type d | head -1)
    
    if [[ -n "$app_path" ]]; then
        cp -r "$app_path" "$PROJECT_ROOT/dist/ios/$CONFIG/"
        print_success "App bundle: $(basename "$app_path")"
    fi
    
    print_success "Simulator build complete"
}

build_device() {
    print_step 4 5 "Building for iOS Device..."
    
    cd "$IOS_DIR"
    
    # Determine destination
    local destination="generic/platform=iOS"
    
    # Build with code signing
    local build_args=(
        -project NeuralVoiceOS.xcodeproj
        -scheme NeuralVoiceOS
        -destination "$destination"
        -configuration "$CONFIG"
        archive
        CODE_SIGN_STYLE="Manual"
    )
    
    # Add signing configuration if available
    if [[ -n "${DEVELOPMENT_TEAM:-}" ]]; then
        build_args+=("DEVELOPMENT_TEAM=$DEVELOPMENT_TEAM")
    fi
    
    if [[ -n "${CODE_SIGN_IDENTITY:-}" ]]; then
        build_args+=("CODE_SIGN_IDENTITY=$CODE_SIGN_IDENTITY")
    fi
    
    if [[ -n "${PROVISIONING_PROFILE:-}" ]]; then
        build_args+=("PROVISIONING_PROFILE=$PROVISIONING_PROFILE")
    fi
    
    if [[ $VERBOSE -eq 1 ]]; then
        xcodebuild "${build_args[@]}"
    else
        xcodebuild "${build_args[@]}" 2>&1 | \
            grep -v "Build succeeded" | \
            grep -v "warning:" || true
    fi
    
    if [[ $? -ne 0 ]]; then
        print_error "Device build failed"
        exit 1
    fi
    
    # Export IPA
    print_info "Exporting IPA..."
    
    local archive_path="build/NeuralVoiceOS.xcarchive"
    
    # Check if archive exists
    if [[ ! -d "$archive_path" ]]; then
        archive_path=$(find build -name "*.xcarchive" -type d | head -1)
    fi
    
    if [[ -n "$archive_path" && -d "$archive_path" ]]; then
        # Create export options plist
        local export_plist="$IOS_DIR/Info.plist"
        
        if [[ -f "$export_plist" ]]; then
            # Export using xcarchive
            xcodebuild \
                -exportArchive \
                -archivePath "$archive_path" \
                -exportOptionsPlist "$export_plist" \
                -exportPath "build/output" 2>&1 | \
                grep -v "Transferring" || true
            
            # Copy IPA to output
            local ipa_path
            ipa_path=$(find build/output -name "*.ipa" -type f | head -1)
            
            if [[ -n "$ipa_path" ]]; then
                cp "$ipa_path" "$PROJECT_ROOT/dist/ios/$CONFIG/"
                print_success "IPA: $(basename "$ipa_path")"
            fi
        else
            print_warning "Export options plist not found, skipping IPA export"
        fi
        
        # Copy .app bundle
        local app_path
        app_path=$(find "$archive_path/Products/Applications" -name "*.app" -type d | head -1)
        
        if [[ -n "$app_path" ]]; then
            cp -r "$app_path" "$PROJECT_ROOT/dist/ios/$CONFIG/"
            print_success "App bundle: $(basename "$app_path")"
        fi
    else
        print_warning "Archive not found, skipping export"
    fi
    
    print_success "Device build complete"
}

create_simulator_ipa() {
    if [[ "$TARGET" != "simulator" ]]; then
        return 0
    fi
    
    print_info "Creating Simulator IPA..."
    
    cd "$IOS_DIR"
    
    local app_path
    app_path=$(find build -name "Neural Voice OS.app" -type d | head -1)
    
    if [[ -z "$app_path" ]]; then
        print_warning "App bundle not found, skipping IPA creation"
        return 0
    fi
    
    # Create IPA structure for simulator
    local payload_dir="$IOS_DIR/build/Payload"
    mkdir -p "$payload_dir"
    cp -r "$app_path" "$payload_dir/"
    
    # Create IPA
    cd build
    zip -r "Neural Voice OS.ipa" Payload 2>/dev/null
    
    if [[ -f "Neural Voice OS.ipa" ]]; then
        cp "Neural Voice OS.ipa" "$PROJECT_ROOT/dist/ios/$CONFIG/"
        print_success "Simulator IPA: Neural Voice OS.ipa"
    fi
    
    # Cleanup
    rm -rf Payload
}

build_summary() {
    print_step 5 5 "Build Summary:"
    
    echo -e "  ${GREEN}Target:${NC}   $TARGET"
    echo -e "  ${GREEN}Config:${NC}   $CONFIG"
    echo -e "  ${GREEN}Platform:${NC} iOS 14.0+"
    
    # Calculate elapsed time
    local end_time
    end_time=$(date +%s)
    local elapsed=$((end_time - START_TIME))
    local minutes=$((elapsed / 60))
    local seconds=$((elapsed % 60))
    echo -e "  ${GREEN}Time:${NC}     ${minutes}m ${seconds}s"
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    Build Complete!                           ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Display output files
    echo -e "${CYAN}Build artifacts:${NC}"
    find "$PROJECT_ROOT/dist/ios" -type f \( -name "*.ipa" -o -name "*.app" \) 2>/dev/null | while read -r file; do
        local relative_path="${file#$PROJECT_ROOT/}"
        local size
        size=$(du -h "$file" 2>/dev/null | cut -f1 || echo "?")
        echo "  - $relative_path ($size)"
    done
    
    echo ""
    
    if [[ "$TARGET" == "device" ]]; then
        if [[ -z "${DEVELOPMENT_TEAM:-}" ]]; then
            echo -e "${YELLOW}Note:${NC} For device distribution, configure code signing:"
            echo "  export DEVELOPMENT_TEAM=YOUR_TEAM_ID"
            echo "  export CODE_SIGN_IDENTITY='Apple Development'"
        fi
    fi
    
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
        --target)
            TARGET="$2"
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

# Validate target
case "$TARGET" in
    simulator|device)
        ;;
    *)
        print_error "Invalid target: $TARGET"
        echo "Valid options: simulator, device"
        exit 1
        ;;
esac

# Validate config
case "$CONFIG" in
    debug|release)
        ;;
    *)
        print_error "Invalid config: $CONFIG"
        echo "Valid options: debug, release"
        exit 1
        ;;
esac

# Display banner
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║            Neural Voice OS - iOS Build Script                ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Run build steps
check_prerequisites
generate_project
prepare_build

if [[ "$TARGET" == "simulator" ]]; then
    build_simulator
else
    build_device
fi

create_simulator_ipa
build_summary

exit 0
