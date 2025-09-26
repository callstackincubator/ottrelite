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
        ${DEPS_INSTALL_DIR}/include
)

# Find RN Ottrelite Core package
find_package(ottrelite_core REQUIRED)

# link all files inside ${DEPS_INSTALL_DIR}/lib
file(GLOB_RECURSE DEPS_LIBS CONFIGURE_DEPENDS
        "${DEPS_INSTALL_DIR}/lib/*.a"
)

target_link_libraries(
        ${PACKAGE_NAME}
        ottrelite_core::ReactNativeOttrelite    # <-- Ottrelite core
        ${DEPS_LIBS}                            # <-- all deps
)
