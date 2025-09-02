cmake_minimum_required(VERSION 4.0)
project(ottrelite-otel-wrapper)

set(CMAKE_EXE_LINKER_FLAGS "-static")
set(CMAKE_INSTALL_PREFIX ${CMAKE_BINARY_DIR}/install)

# iOS configuration
if (APPLE)
    set(CMAKE_TOOLCHAIN_FILE "${CMAKE_CURRENT_LIST_DIR}/ios-cmake/ios.toolchain.cmake")
    set(CMAKE_SYSTEM_NAME "iOS")
    set(CMAKE_MACOSX_BUNDLE OFF)

    include("ios_fixes.cmake")
endif()

# below: opentelemetry-cpp config
set(CMAKE_POLICY_VERSION_MINIMUM 3.5)
set(CMAKE_CXX_STANDARD 17)
set(WITH_OTLP_GRPC OFF CACHE BOOL "Enable OTLP gRPC exporter" FORCE)
set(WITH_OTLP_HTTP ON CACHE BOOL "Enable OTLP HTTP exporter" FORCE)
set(BUILD_TESTING OFF CACHE BOOL "Disable OpenTelemetry tests" FORCE)
set(WITH_EXAMPLES OFF CACHE BOOL "Disable OpenTelemetry examples" FORCE)
set(WITH_FUNC_TESTS OFF CACHE BOOL "Disable OpenTelemetry functional tests" FORCE)
set(OPENTELEMETRY_INSTALL ON CACHE BOOL "Enable OpenTelemetry installation" FORCE)
# below: config for opentelemetry-cpp deps
set(CURL_ROOT "${CMAKE_BINARY_DIR}/install/lib/cmake/CURL/")
# below: protoc can't be built for iOS, will get error 'cannot find crt0.o'
set(protobuf_BUILD_PROTOC_BINARIES OFF CACHE BOOL "Disable protoc binary build" FORCE)

# below: general config
set(BUILD_STATIC_CURL ON CACHE BOOL "Build static curl library" FORCE)
set(BUILD_SHARED_LIBS OFF CACHE BOOL "Build shared libraries" FORCE)
set(BUILD_STATIC_LIBS ON CACHE BOOL "Build static libraries" FORCE)

add_subdirectory(opentelemetry-cpp)
