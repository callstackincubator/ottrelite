include(FetchContent)

if (CMAKE_BUILD_TYPE STREQUAL "Debug")
    add_compile_definitions(DEBUG_MODE)
else ()
    add_compile_definitions(RELEASE_MODE)
endif ()

if (OTTRELITE_INTEROP_OTEL_VERSION)
    add_compile_definitions(OTTRELITE_INTEROP_OTEL_VERSION="${OTTRELITE_INTEROP_OTEL_VERSION}")
endif ()

if (OTTRELITE_DEBUG_LOGS)
    add_compile_definitions(OTTRELITE_DEBUG_LOGS)
endif ()

file(GLOB_RECURSE COMMON_SOURCES CONFIGURE_DEPENDS
        "${CMAKE_CURRENT_LIST_DIR}/src/*.cpp"
)

target_sources(${PACKAGE_NAME} PUBLIC ${COMMON_SOURCES})

set(DEPS_INSTALL_DIR "${CMAKE_CURRENT_LIST_DIR}/../third_party/wrapper/android/install/${ANDROID_ABI}")

target_include_directories(
        ${PACKAGE_NAME}
        PRIVATE
        ${CMAKE_CURRENT_LIST_DIR}/include/private/
        ${CMAKE_CURRENT_LIST_DIR}/include/private/utils
        ${CMAKE_CURRENT_LIST_DIR}/include/private/helpers
        PUBLIC
        ${CMAKE_CURRENT_LIST_DIR}/include/public/
        ${CMAKE_CURRENT_LIST_DIR}/include/public/backend
        ${CMAKE_CURRENT_LIST_DIR}/include/public/logging
        ${CMAKE_CURRENT_LIST_DIR}/include/public/utils
        ${DEPS_INSTALL_DIR}/include
)

target_include_directories(
        ${PACKAGE_NAME}
        PRIVATE
        ${DEPS_INSTALL_DIR}/lib
)

# Find RN Ottrelite Core package
find_package(ottrelite_core)

# Find Protobuf C++ package
set(Protobuf_DIR "${DEPS_INSTALL_DIR}/lib/cmake/protobuf/")
find_package(Protobuf CONFIG)

# Find OpenSSL package
set(OpenSSLArtifactsDir "${CMAKE_CURRENT_LIST_DIR}/../third_party/openssl_for_android/openssl_${OTTRELITE_OPENSSL_VERSION}_${ANDROID_ABI}")
set(OPENSSL_CRYPTO_LIBRARY "${OpenSSLArtifactsDir}/lib/libcrypto.a")
set(OPENSSL_SSL_LIBRARY "${OpenSSLArtifactsDir}/lib/libssl.a")
set(OPENSSL_INCLUDE_DIR "${OpenSSLArtifactsDir}/include")
set(OPENSSL_LIBRARIES "${OPENSSL_SSL_LIBRARY};${OPENSSL_CRYPTO_LIBRARY}")

add_library(OpenSSL::SSL STATIC IMPORTED)
add_library(OpenSSL::Crypto STATIC IMPORTED)

set_target_properties(OpenSSL::SSL PROPERTIES
        IMPORTED_LOCATION "${OPENSSL_SSL_LIBRARY}"
        INTERFACE_INCLUDE_DIRECTORIES "${OPENSSL_INCLUDE_DIR}"
)
set_target_properties(OpenSSL::Crypto PROPERTIES
        IMPORTED_LOCATION "${OPENSSL_CRYPTO_LIBRARY}"
        INTERFACE_INCLUDE_DIRECTORIES "${OPENSSL_INCLUDE_DIR}"
)

# Find CURL C++ package
set(CURL_DIR "${DEPS_INSTALL_DIR}/lib/cmake/CURL/")
find_package(CURL CONFIG)

# Find OpenTelemetry C++ package
set(opentelemetry-cpp_DIR "${DEPS_INSTALL_DIR}/lib/cmake/opentelemetry-cpp/")
find_package(opentelemetry-cpp CONFIG)

target_link_libraries(
        ${PACKAGE_NAME}
        ottrelite_core::ReactNativeOttrelite    # <-- Ottrelite core
        ${Protobuf_LIBRARIES}                   # <-- Protobuf
        ${OPENTELEMETRY_CPP_LIBRARIES}          # <-- OpenTelemetry C++
        ${CURL_LIBRARIES}                       # <-- CURL
        OpenSSL::SSL OpenSSL::Crypto            # <-- OpenSSL
)
