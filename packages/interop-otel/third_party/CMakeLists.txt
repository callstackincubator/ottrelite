cmake_minimum_required(VERSION 4.0)
project(ottrelite-otel-wrapper)

include(FetchContent)

set(CMAKE_EXE_LINKER_FLAGS "-static")
set(CMAKE_INSTALL_PREFIX ${CMAKE_BINARY_DIR}/install)

set(PROTOC_DIR "${CMAKE_BINARY_DIR}/protoc")
set(PROTOC_ZIP "${CMAKE_BINARY_DIR}/protoc.zip")
set(PROTOC_BINARY "${PROTOC_DIR}/bin/protoc")
if(WIN32)
    if(CMAKE_SYSTEM_PROCESSOR MATCHES "^(x86_64|amd64|AMD64)$")
        set(PROTOC_URL "https://github.com/protocolbuffers/protobuf/releases/download/v21.6/protoc-21.6-win64.zip")
    else()
        set(PROTOC_URL "https://github.com/protocolbuffers/protobuf/releases/download/v21.6/protoc-21.6-win32.zip")
    endif()
    
    set(PROTOC_BINARY "${PROTOC_DIR}/bin/protoc.exe")
elseif(APPLE)
    set(PROTOC_URL "https://github.com/protocolbuffers/protobuf/releases/download/v21.6/protoc-21.6-osx-universal_binary.zip")
elseif(UNIX)
    if(CMAKE_SYSTEM_PROCESSOR MATCHES "^(aarch64|arm64)$")
        set(PROTOC_URL "https://github.com/protocolbuffers/protobuf/releases/download/v21.6/protoc-21.6-linux-aarch_64.zip")
    elseif(CMAKE_SYSTEM_PROCESSOR MATCHES "^(x86_64|amd64|AMD64)$")
        set(PROTOC_URL "https://github.com/protocolbuffers/protobuf/releases/download/v21.6/protoc-21.6-linux-x86_64.zip")
    else()
        set(PROTOC_URL "https://github.com/protocolbuffers/protobuf/releases/download/v21.6/protoc-21.6-linux-x86_32.zip")
    endif()
else()
    message(FATAL_ERROR "Unsupported host architecture '${CMAKE_SYSTEM_PROCESSOR}'")
endif()

if(NOT EXISTS "${PROTOC_BINARY}")
    message(STATUS "⏳ Downloading protoc binary...")

    file(DOWNLOAD
        "${PROTOC_URL}"
        "${PROTOC_ZIP}"
        SHOW_PROGRESS
    )

    file(MAKE_DIRECTORY "${PROTOC_DIR}")

    execute_process(
        COMMAND ${CMAKE_COMMAND} -E tar xzf "${PROTOC_ZIP}"
        WORKING_DIRECTORY "${PROTOC_DIR}"
    )

    file(REMOVE "${PROTOC_ZIP}")

    # make protoc executable
    file(CHMOD "${PROTOC_BINARY}" PERMISSIONS OWNER_READ OWNER_WRITE OWNER_EXECUTE GROUP_READ GROUP_EXECUTE WORLD_READ WORLD_EXECUTE)
else()
    message(STATUS "➡️ Using existing protoc binary...")
endif()

get_filename_component(PROTOC_BINARY_ABS "${PROTOC_BINARY}" REALPATH)
message(STATUS "ℹ️ Protobuf compiler binary: ${PROTOC_BINARY_ABS}")
set(PROTOBUF_PROTOC_EXECUTABLE "${PROTOC_BINARY_ABS}" CACHE FILEPATH "Path to the protoc compiler")

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
