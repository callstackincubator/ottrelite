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

target_link_libraries(
        ${PACKAGE_NAME}
        ${SHARED_LIBRARIES}
)

target_sources(${PACKAGE_NAME} PUBLIC ${COMMON_SOURCES})

target_include_directories(
        ${PACKAGE_NAME}
        PRIVATE
        ${CMAKE_CURRENT_LIST_DIR}/include/private/
        ${CMAKE_CURRENT_LIST_DIR}/include/private/utils
        ${CMAKE_CURRENT_LIST_DIR}/include/private/helpers
        PUBLIC
        ${CMAKE_CURRENT_LIST_DIR}/include/public/
)
