# @ottrelite/interop-otel

This package provides an interoperability layer between Ottrelite and OTEL JS SDKs. To avoid confusion, this project is not affiliated and not part of OpenTelemetry.

<a href="https://www.callstack.com/open-source?utm_campaign=generic&utm_source=github&utm_medium=referral&utm_content=ottrelite" align="center">
  <picture>
    <img alt="Ottrelite" src="https://github.com/callstackincubator/ottrelite/blob/main/img/banner.jpg?raw=true">
  </picture>
</a>

<h3 align="center">
  <b>Ottrelite</b> - Unified, extensible, cross-language tracing toolkit for React Native ⚡️🔎
</h3>

---

<div align="center">

  [![Release](https://github.com/callstackincubator/ottrelite/actions/workflows/release.yml/badge.svg)](https://github.com/callstackincubator/ottrelite/actions/workflows/release.yml)
  [![Docs](https://github.com/callstackincubator/ottrelite/actions/workflows/docs.yml/badge.svg)](https://github.com/callstackincubator/ottrelite/actions/workflows/docs.yml)
  [![Build, lint & test (JS)](https://github.com/callstackincubator/ottrelite/actions/workflows/build-lint-test.yml/badge.svg)](https://github.com/callstackincubator/ottrelite/actions/workflows/build-lint-test.yml)

  [![interop-otel npm downloads](https://img.shields.io/npm/dm/@ottrelite/interop-otel.svg?style=flat-square&label=NPM%20-%20%40ottrelite%2Finterop-otel)](https://www.npmjs.com/package/@ottrelite/interop-otel)

</div>

## Documentation

All the features, usage & installation of this package are documented in the [documentation](https://callstackincubator.github.io/ottrelite/docs/interop-otel/quick-start.html).

## Development

For developer reference, this package utilizes the JS OpenTelemetry API as well as opentelemetry-cpp to integrate with OTEL's APIs. The CPP package requires libcurl and protobuf, which in turn depends on openssl, brotli, zlib. This complicates the build process, especially for iOS, where the packages are configured using CocoaPods while the primary build system for the listed C++ packages is CMake.

### iOS

Moreover, the aforementioned packages need to be compiled from source for the right architecture, using the right toolchain for iOS.

To organize this, the packages are built with CMake and artifacts (static libraries, headers & CMake configs) are installed to `third_party/wrapper/ios/`; the headers & libraries are configured for use in Xcode via the `.podspec` file. The Pod registers a pre-compile script phase which runs `third_party/buildIOS.sh` script that builds the CMake wrapper & copies over necessary files. Moreover, since the CocoaPods-generated umbrella header would by default include all headers of dependencies, including opentelemetry-cpp's & protobuf's, all the dependency headers are excluded (commented out) by the script phase, as the special macros used by protobuf seem to break the Swift module compilation.

The `buildIOS.sh` script requires 2 positional arguments, which are passed from Xcode's env variables that the script phase has access to: the target platform (iOS device / simulator) & CPU architecture. An example invocation that builds artifacts for the simulator for the arm64 architecture is: `./buildIOS.sh iphonesimulator arm64`.

### Android

TODO: write this section
