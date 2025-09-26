set -e

# validate number of arguments
if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <platform> <archs> <configuration>"
  echo "Such that <platform> is 'iphoneos' or 'iphonesimulator'; <archs> is a list of architectures to build for, e.g. 'arm64 x86_64'; <configuration> is Release or Debug."
  echo "Example: ./buildIOS.sh iphonesimulator arm64 Release"
  exit 1
fi

# below: dev-only flag forcing rebuild of CMake projects
CMAKE_FORCE_REBUILD=0

PLATFORM="$1"
ARCHS="$2"
BUILD_TYPE="$3"

# validate arguments
if [ "$PLATFORM" != "iphoneos" ] && [ "$PLATFORM" != "iphonesimulator" ]; then
  echo "Error: Invalid platform '$PLATFORM'. Must be either 'iphoneos' or 'iphonesimulator'."
  exit 1
fi

if [ "$BUILD_TYPE" != "Release" ] && [ "$BUILD_TYPE" != "Debug" ]; then
  echo "Error: Invalid build type '$BUILD_TYPE'. Must be either 'Release' or 'Debug'."
  exit 1
fi

if [ "$PLATFORM" = "iphonesimulator" ]; then
  if [[ "$ARCHS" == *"arm64"* ]]; then
    echo "➡️ Building for simulator ARM64 (Apple Silicon)"
    CMAKE_IOS_PLATFORM="SIMULATORARM64"
    OPENSSL_TARGETS="ios-sim-cross-arm64"
  else
    echo "➡️ Building for simulator x86_64 (Intel)"
    CMAKE_IOS_PLATFORM="SIMULATOR64"
    OPENSSL_TARGETS="ios-sim-cross-x86_64"
  fi
else
    echo "➡️ Building for device (iPhoneOS) 64-bit"
    CMAKE_IOS_PLATFORM="OS64"
    OPENSSL_TARGETS="ios64-cross-arm64"
fi

THIS_BUILD_INFO="$CMAKE_IOS_PLATFORM"

# === ios-cmake ===

if [ ! -d "ios-cmake" ]; then
    echo "⏳ Cloning ios-cmake..."
    git clone --depth 1 --branch 4.5.0 https://github.com/leetal/ios-cmake.git
fi

# === OpenSSL ===

if [ ! -d openssl-apple ]; then
    echo "⏳ Cloning openssl-apple..."
    git clone --depth 1 --branch 3.5.200 https://github.com/passepartoutvpn/openssl-apple.git
fi

if [ "$PLATFORM" = "iphonesimulator" ]; then
    echo "➡️ Need OpenSSL for iOS simulator..."

    first_openssl_sdk_dir=(openssl-apple/bin/iPhoneSimulator*-$ARCHS.sdk/)
else
    echo "➡️ Need OpenSSL for iOS device..."

    first_openssl_sdk_dir=(openssl-apple/bin/iPhoneOS*-$ARCHS.sdk/)
fi

if [ -d "${first_openssl_sdk_dir[0]}" ]; then
    echo "➡️ Found existing OpenSSL built artifacts in directory: ${first_openssl_sdk_dir[0]}"
    first_openssl_sdk_dir="${first_openssl_sdk_dir[0]}"
else
    cd openssl-apple

    echo "⏳ Building OpenSSL for target(s) ${OPENSSL_TARGETS}"
    # ad below: --deprecated is critical to build deprecated symbols, which include _ENGINE* symbols used by curl
    ./build-libssl.sh --version=3.2.0 --targets="${OPENSSL_TARGETS}" --deprecated
    
    cd ..

    first_openssl_sdk_dir=(openssl-apple/bin/*.sdk/)
fi

echo "ℹ️ OpenSSL prepared in ${first_openssl_sdk_dir}"

OPENSSL_ROOT_DIR=$(realpath ${first_openssl_sdk_dir})

# === OpenTelemetry C++ SDK ===

if [ ! -d "opentelemetry-cpp" ]; then
    echo "⏳ Cloning opentelemetry-cpp..."
    git clone --depth 1 --branch v1.23.0 https://github.com/open-telemetry/opentelemetry-cpp.git
fi

# === Brotli ===

if [ ! -d "brotli" ]; then
    echo "⏳ Cloning Brotli..."
    git clone --depth 1 --branch v1.1.0 https://github.com/google/brotli.git
fi

# === Zlib ===

if [ ! -d "zlib" ]; then
    echo "⏳ Cloning Zlib..."
    git clone --depth 1 --branch v1.3.1 https://github.com/madler/zlib.git
fi

# === Curl ===

if [ ! -d "curl" ]; then
    echo "⏳ Cloning curl..."
    git clone --depth 1 --branch curl-8_15_0 https://github.com/curl/curl.git
fi

### ========== End of dependency cloning section ==========

# === Wrapper build ===

echo "⏳ Preparing opentelemetry-cpp wrapper for iOS with CMake..."

mkdir -p "wrapper/ios/${BUILD_TYPE}"
cd "wrapper/ios/${BUILD_TYPE}"

# create install prefix directory
mkdir -p install

# copy over OpenSSL dist
cp -R ${OPENSSL_ROOT_DIR}/* install/

# === Brotli ===

echo "⏳ Building Brotli for iOS..."

mkdir -p brotli
cd brotli

# check if lastBuildInfo.txt has the current CMAKE_IOS_PLATFORM
BUILD_BROTLI=$CMAKE_FORCE_REBUILD
if [ -f lastBuildInfo.txt ]; then
    if [ "$(cat lastBuildInfo.txt)" != "$THIS_BUILD_INFO" ]; then
        echo "Last build of Brotli ($(cat lastBuildInfo.txt)) does not match the current settings (${CMAKE_IOS_PLATFORM})"
        BUILD_BROTLI=1
    fi
else
    BUILD_BROTLI=1
fi

if [ "$BUILD_BROTLI" -eq 1 ]; then
    cmake ../../../../brotli \
        -G "Unix Makefiles" \
        -DCMAKE_BUILD_TYPE=$BUILD_TYPE \
        -DCMAKE_CXX_FLAGS_DEBUG="-g" \
        -DBROTLI_BUILD_TOOLS=OFF \
        -DPLATFORM=${CMAKE_IOS_PLATFORM} \
        -DCMAKE_SYSTEM_NAME="iOS" \
        -DBUILD_SHARED_LIBS=OFF \
        -DCMAKE_INSTALL_PREFIX="$(realpath ../install)" \
        -DCMAKE_TOOLCHAIN_FILE=../ios-cmake/ios.toolchain.cmake \
        -DBROTLI_BUNDLED_MODE=ON # disable install, which is failing for iOS

    cmake --build . --config $BUILD_TYPE -j$(sysctl -n hw.ncpu)
    # cmake --install . --prefix "$(realpath ../install)" - this won't do anything since BROTLI_BUNDLED_MODE=ON
    # we need to manually copy the libs & headers instead
    cp libbrotli*.a ../install/lib/
    cp -R ../../../../brotli/c/include/ ../install/include/

    echo "$THIS_BUILD_INFO" > lastBuildInfo.txt
else
    echo "⏭️ Brotli already built for ${CMAKE_IOS_PLATFORM}, skipping..."
fi

cd ..

# === Zlib ===

echo "⏳ Building Zlib for iOS..."

mkdir -p zlib
cd zlib

BUILD_ZLIB=$CMAKE_FORCE_REBUILD

if [ -f lastBuildInfo.txt ]; then
    if [ "$(cat lastBuildInfo.txt)" != "$THIS_BUILD_INFO" ]; then
        echo "Last build of Zlib ($(cat lastBuildInfo.txt)) does not match the current settings (${CMAKE_IOS_PLATFORM})"
        BUILD_ZLIB=1
    fi
else
    BUILD_ZLIB=1
fi

if [ "$BUILD_ZLIB" -eq 1 ]; then
    cmake ../../../../zlib \
        -G "Unix Makefiles" \
        -DCMAKE_BUILD_TYPE=$BUILD_TYPE \
        -DCMAKE_CXX_FLAGS_DEBUG="-g" \
        -DPLATFORM=${CMAKE_IOS_PLATFORM} \
        -DZLIB_BUILD_TESTING=OFF \
        -DZLIB_BUILD_SHARED=OFF \
        -DZLIB_BUILD_STATIC=ON \
        -DZLIB_BUILD_MINIZIP=OFF \
        -DZLIB_BUILD_EXAMPLES=OFF \
        -DZLIB_INSTALL=ON \
        -DCMAKE_SYSTEM_NAME="iOS" \
        -DCMAKE_INSTALL_PREFIX="$(realpath ../install)" \
        -DCMAKE_TOOLCHAIN_FILE=../ios-cmake/ios.toolchain.cmake

    cmake --build . --config $BUILD_TYPE -j$(sysctl -n hw.ncpu)
    cmake --install . --prefix "$(realpath ../install)"

    # to avoid issues with linker, remove .dylib files; the current release does not yet respect BUILD_SHARED=OFF
    # TODO: remove the below as a new version is released (BUILD_SHARED=OFF is already on main branch)
    rm -f ../install/lib/libz*.dylib

    echo "$THIS_BUILD_INFO" > lastBuildInfo.txt
else
    echo "⏭️ Zlib already built for ${CMAKE_IOS_PLATFORM}, skipping..."
fi

cd ..

# === Curl ===

mkdir -p curl

echo "⏳ Building curl for iOS..."

cd curl

BUILD_CURL=$CMAKE_FORCE_REBUILD

if [ -f lastBuildInfo.txt ]; then
    if [ "$(cat lastBuildInfo.txt)" != "$THIS_BUILD_INFO" ]; then
        echo "Last build of Curl ($(cat lastBuildInfo.txt)) does not match the current settings (${CMAKE_IOS_PLATFORM})"
        BUILD_CURL=1
    fi
else
    BUILD_CURL=1
fi

if [ "$BUILD_CURL" -eq 1 ]; then
    cmake ../../../../curl \
        -G "Unix Makefiles" \
        -DCMAKE_BUILD_TYPE=$BUILD_TYPE \
        -DCMAKE_CXX_FLAGS_DEBUG="-g" \
        -DPLATFORM=${CMAKE_IOS_PLATFORM} \
        -DCMAKE_SYSTEM_NAME="iOS" \
        -DCMAKE_TOOLCHAIN_FILE=../ios-cmake/ios.toolchain.cmake \
        -DZLIB_ROOT="$(realpath ../install)" \
        -DOPENSSL_ROOT_DIR=${OPENSSL_ROOT_DIR} \
        -DOPENSSL_SSL_LIBRARY=${OPENSSL_ROOT_DIR}/lib/libssl.a \
        -DOPENSSL_CRYPTO_LIBRARY=${OPENSSL_ROOT_DIR}/lib/libcrypto.a \
        -DOPENSSL_INCLUDE_DIR=${OPENSSL_ROOT_DIR}/include \
        -DUSE_NGHTTP2=OFF \
        -DCURL_ZSTD=OFF \
        -DBUILD_SHARED_LIBS=OFF \
        -DCMAKE_USE_OPENSSL=ON \
        -DBUILD_CURL_EXE=OFF \
        -DBUILD_TESTING=OFF \
        -DUSE_LIBIDN2=OFF \
        -DCURL_CA_PATH=none \
        -DCURL_DISABLE_FTP=ON \
        -DCURL_DISABLE_LDAP=ON \
        -DCURL_DISABLE_LDAPS=ON \
        -DCURL_DISABLE_TELNET=ON \
        -DCURL_DISABLE_DICT=ON \
        -DCURL_DISABLE_FILE=ON \
        -DCURL_DISABLE_TFTP=ON \
        -DCURL_DISABLE_RTSP=ON \
        -DCURL_DISABLE_POP3=ON \
        -DCURL_DISABLE_IMAP=ON \
        -DCURL_DISABLE_SMTP=ON \
        -DCURL_DISABLE_GOPHER=ON \
        -DBUILD_EXAMPLES=OFF \
        -DENABLE_CURL_MANUAL=OFF \
        -DCURL_USE_LIBPSL=OFF 

    cmake --build . --config $BUILD_TYPE -j$(sysctl -n hw.ncpu)
    cmake --install . --prefix "$(realpath ../install)"

    # if [ "$BUILD_TYPE" = "Debug" ]; then
    #     # cocoapods would hardcode -llib*d flags if the debug files existed, which would break compilation
    #     # when switching between configurations, therefore all *d libs are renamed to non-d-suffixed in Debug
    #     mv ../install/lib/libcurl-d.a ../install/lib/libcurl.a
    # fi

    echo "$THIS_BUILD_INFO" > lastBuildInfo.txt
else
    echo "⏭️ Curl already built for ${CMAKE_IOS_PLATFORM}, skipping..."
fi

cd ..

# === Wrapper build ===

echo "⏳ Configuring wrapper for iOS with CMake..."

BUILD_WRAPPER=$CMAKE_FORCE_REBUILD

if [ -f lastBuildInfo.txt ]; then
    if [ "$(cat lastBuildInfo.txt)" != "$THIS_BUILD_INFO" ]; then
        echo "Last build of Wrapper ($(cat lastBuildInfo.txt)) does not match the current settings (${CMAKE_IOS_PLATFORM})"
        BUILD_WRAPPER=1
    fi
else
    BUILD_WRAPPER=1
fi

if [ "$BUILD_WRAPPER" -eq 1 ]; then
    cmake ../../.. \
        -G "Unix Makefiles" \
        -DCMAKE_BUILD_TYPE=$BUILD_TYPE \
        -DCMAKE_CXX_FLAGS_DEBUG="-g" \
        -DPLATFORM=${CMAKE_IOS_PLATFORM} \
        -DCMAKE_SYSTEM_NAME="iOS" \
        -DCMAKE_TOOLCHAIN_FILE=ios-cmake/ios.toolchain.cmake

    echo "⏳ Building wrapper for iOS..."

    cmake --build . --config $BUILD_TYPE -j$(sysctl -n hw.ncpu)
    cmake --install . --prefix ./install

    echo "$THIS_BUILD_INFO" > lastBuildInfo.txt
else
    echo "⏭️ Wrapper already built for ${CMAKE_IOS_PLATFORM}, skipping..."
fi

if [ -d ../install ]; then
    echo "Removing previous install dir"
    rm -rf ../install
fi

echo "Copying this variant's install dir to ../install"
cp -R "$(realpath ./install)" ../install
