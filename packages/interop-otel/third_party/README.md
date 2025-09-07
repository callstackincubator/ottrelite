# opentelemetry-cpp cross-compilation setup

## What, where & why

This directory contains a single `CMakeLists.txt` file configuring the build of static OTEL CPP libraries from `opentelemetry-cpp`. Remaining important files & directories are as follows:

- `curl` - curl client lib submodule for `wrapper` x `opentelemetry-cpp` CMake projects (it's itself a CMake project); this is built separately and installed to `wrapper/<platform>/install` directory
- `ios-cmake` - iOS toolchain for CMake, used by `CMakeLists.txt`
- `openssl-apple` - helpful non-CMake project that eases the build of OpenSSL v3 for iOS; executed by `buildIOS.sh`
- **`buildIOS.sh`** - shell script to pull in `protoc` binary (from GH releases), build `openssl-apple` (via its shell script), finally build the `wrapper` CMake project
- **`opentelemetry-cpp`** - OTEL CPP lib submodule for `wrapper` CMake project (it's itself a CMake project)
- `protoc` - ignored by git directory, where the release of Protobuf compiler binary will be extracted to
- **`wrapper`** - Ottrelite's CMake project that configures the build properly to build using the iOS toolchain, using iphoneos sysroot, configures the build of brotli, curl, zlib, zstd, configures CMake to use the `openssl-apple` prebuilt OpenSSL lib instead of MacOS's lib
  - `wrapper/<platform>/<configuration>` - this is the platform-specific directory, where the build will be performed; `<configuration>` can be either `Debug` or `Release`; `<platform>` can be `ios` or `android`
    - **`wrapper/<platform>/<configuration>/install`** - this is the final output directory (CMake install prefix) for **opentelemetry-cpp & all its dependencies**; there, all static libraries (`.a`), headers, CMake & pkgconfig artifacts will be found
  - `wrapper/patches` - directory with patch to configure build of `opentelemetry-cpp` so as to build with locally-cloned dependencies
- `install` - copy of to the last build run's `install` directory (which is described above); this is for the Pod to be able to find the outputs at a static location since a Podspec cannot specify per-build-variant include/lib directories

## How this integrates with the app

### iOS

This project integrates with iOS via a Podspec file, which runs the `buildIOS.sh` script in a script phase pre build. Afterwards, the Podspec includes the `wrapper/install/include` directory in header search paths and adds `wrapper/install/lib/` as library search path for the linker.

### Android

TODO: write this
