if (CMAKE_BUILD_TYPE STREQUAL "Debug")
    add_compile_definitions(DEBUG_MODE)
else ()
    add_compile_definitions(RELEASE_MODE)
endif ()

file(GLOB_RECURSE COMMON_SOURCES CONFIGURE_DEPENDS
        "${CMAKE_CURRENT_LIST_DIR}/*.cpp"
)

target_sources(${PACKAGE_NAME} PUBLIC ${COMMON_SOURCES})

target_include_directories(
        ${PACKAGE_NAME}
        PRIVATE
        ${CMAKE_CURRENT_LIST_DIR}/
)

# Find RN Ottrelite Core package
find_package(ottrelite_core REQUIRED)

target_link_libraries(
        ${PACKAGE_NAME}
        ottrelite_core::ReactNativeOttrelite  # <-- Ottrelite core
)
