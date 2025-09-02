include(FetchContent)

if (CMAKE_BUILD_TYPE STREQUAL "Debug")
    add_compile_definitions(DEBUG_MODE)
else ()
    add_compile_definitions(RELEASE_MODE)
endif ()

if (OTTRELITE_CORE_VERSION)
    add_compile_definitions(OTTRELITE_CORE_VERSION="${OTTRELITE_CORE_VERSION}")
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
        PUBLIC
        ${CMAKE_CURRENT_LIST_DIR}/include/public/
        ${CMAKE_CURRENT_LIST_DIR}/include/public/backend/
        ${CMAKE_CURRENT_LIST_DIR}/include/public/logging/
        ${CMAKE_CURRENT_LIST_DIR}/include/public/utils/
)
