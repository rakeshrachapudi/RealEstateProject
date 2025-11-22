#!/bin/bash

# 🚀 Property Dealz - Automated Build Script
# Usage: ./build-android.sh [debug|release|aab]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  🏠 Property Dealz - Android Build Script       ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${BLUE}▶️  $1${NC}"
}

# Validate environment
check_environment() {
    print_step "Checking environment..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        exit 1
    fi
    print_success "Node.js: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed!"
        exit 1
    fi
    print_success "npm: $(npm --version)"
    
    # Check Java
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed!"
        exit 1
    fi
    print_success "Java: $(java -version 2>&1 | head -n 1)"
    
    # Check Android SDK
    if [ -z "$ANDROID_SDK_ROOT" ] && [ -z "$ANDROID_HOME" ]; then
        print_error "Android SDK not found! Set ANDROID_SDK_ROOT or ANDROID_HOME"
        exit 1
    fi
    print_success "Android SDK found"
    
    echo ""
}

# Clean previous builds
clean_build() {
    print_step "Cleaning previous builds..."
    
    # Clean React build
    if [ -d "build" ]; then
        rm -rf build
        print_success "Cleaned React build directory"
    fi
    
    if [ -d "dist" ]; then
        rm -rf dist
        print_success "Cleaned dist directory"
    fi
    
    # Clean Android build
    if [ -d "android/app/build" ]; then
        cd android
        ./gradlew clean
        cd ..
        print_success "Cleaned Android build"
    fi
    
    echo ""
}

# Install/update dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    npm install
    print_success "Dependencies installed"
    
    echo ""
}

# Build React app
build_react() {
    print_step "Building React app..."
    
    # Set production environment
    export NODE_ENV=production
    export GENERATE_SOURCEMAP=false
    
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "React app built successfully"
        
        # Show build size
        if [ -d "build" ]; then
            SIZE=$(du -sh build | cut -f1)
            print_info "Build size: $SIZE"
        elif [ -d "dist" ]; then
            SIZE=$(du -sh dist | cut -f1)
            print_info "Build size: $SIZE"
        fi
    else
        print_error "React build failed!"
        exit 1
    fi
    
    echo ""
}

# Sync Capacitor
sync_capacitor() {
    print_step "Syncing Capacitor..."
    
    npx cap sync android
    
    if [ $? -eq 0 ]; then
        print_success "Capacitor synced"
    else
        print_error "Capacitor sync failed!"
        exit 1
    fi
    
    echo ""
}

# Build Android Debug APK
build_debug() {
    print_step "Building Debug APK..."
    
    cd android
    ./gradlew assembleDebug
    cd ..
    
    if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
        SIZE=$(du -h android/app/build/outputs/apk/debug/app-debug.apk | cut -f1)
        print_success "Debug APK built successfully"
        print_info "APK Size: $SIZE"
        print_info "Location: android/app/build/outputs/apk/debug/app-debug.apk"
    else
        print_error "Debug APK build failed!"
        exit 1
    fi
    
    echo ""
}

# Build Android Release APK
build_release() {
    print_step "Building Release APK..."
    
    cd android
    ./gradlew assembleRelease
    cd ..
    
    if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
        SIZE=$(du -h android/app/build/outputs/apk/release/app-release.apk | cut -f1)
        print_success "Release APK built successfully"
        print_info "APK Size: $SIZE"
        print_info "Location: android/app/build/outputs/apk/release/app-release.apk"
        
        # Verify APK
        print_step "Verifying APK..."
        $ANDROID_SDK_ROOT/build-tools/34.0.0/aapt dump badging android/app/build/outputs/apk/release/app-release.apk | grep package
        
    else
        print_error "Release APK build failed!"
        exit 1
    fi
    
    echo ""
}

# Build Android App Bundle (AAB)
build_aab() {
    print_step "Building App Bundle (AAB)..."
    
    cd android
    ./gradlew bundleRelease
    cd ..
    
    if [ -f "android/app/build/outputs/bundle/release/app-release.aab" ]; then
        SIZE=$(du -h android/app/build/outputs/bundle/release/app-release.aab | cut -f1)
        print_success "App Bundle built successfully"
        print_info "AAB Size: $SIZE"
        print_info "Location: android/app/build/outputs/bundle/release/app-release.aab"
    else
        print_error "App Bundle build failed!"
        exit 1
    fi
    
    echo ""
}

# Install on device
install_debug() {
    print_step "Installing on device..."
    
    # Check for connected devices
    DEVICES=$(adb devices | grep -v "List" | grep "device" | wc -l)
    
    if [ "$DEVICES" -eq 0 ]; then
        print_error "No devices connected!"
        print_info "Connect a device or start an emulator"
        exit 1
    fi
    
    print_info "Found $DEVICES device(s)"
    
    adb install -r android/app/build/outputs/apk/debug/app-debug.apk
    
    if [ $? -eq 0 ]; then
        print_success "App installed on device"
        print_info "Launching app..."
        adb shell am start -n com.propertydealsdotcom.realestate/.MainActivity
    else
        print_error "Installation failed!"
        exit 1
    fi
    
    echo ""
}

# Main script logic
main() {
    print_header
    
    BUILD_TYPE=${1:-debug}
    
    case $BUILD_TYPE in
        debug)
            check_environment
            clean_build
            install_dependencies
            build_react
            sync_capacitor
            build_debug
            
            echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
            echo -e "${GREEN}║          ✅ Debug Build Complete!               ║${NC}"
            echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
            echo ""
            echo -e "${YELLOW}Next steps:${NC}"
            echo "  1. Install on device: ./build-android.sh install"
            echo "  2. Or open in Android Studio: npx cap open android"
            ;;
            
        release)
            check_environment
            clean_build
            install_dependencies
            build_react
            sync_capacitor
            build_release
            
            echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
            echo -e "${GREEN}║        ✅ Release APK Build Complete!           ║${NC}"
            echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
            echo ""
            echo -e "${YELLOW}APK location:${NC}"
            echo "  android/app/build/outputs/apk/release/app-release.apk"
            ;;
            
        aab)
            check_environment
            clean_build
            install_dependencies
            build_react
            sync_capacitor
            build_aab
            
            echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
            echo -e "${GREEN}║      ✅ App Bundle (AAB) Build Complete!        ║${NC}"
            echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
            echo ""
            echo -e "${YELLOW}AAB location:${NC}"
            echo "  android/app/build/outputs/bundle/release/app-release.aab"
            echo ""
            echo -e "${YELLOW}Ready for Google Play upload!${NC}"
            ;;
            
        install)
            install_debug
            ;;
            
        *)
            echo "Usage: $0 [debug|release|aab|install]"
            echo ""
            echo "  debug    - Build debug APK (default)"
            echo "  release  - Build release APK"
            echo "  aab      - Build App Bundle for Play Store"
            echo "  install  - Install debug APK on connected device"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
