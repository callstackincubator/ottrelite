set(PACKAGE_NAME ReactNativeOttreliteInteropOTEL)

# Allow VERSION in project()
if (POLICY CMP0048)
    cmake_policy(SET CMP0048 NEW)
endif ()

project(${PACKAGE_NAME} VERSION ${OTTRELITE_INTEROP_OTEL_VERSION})
cmake_minimum_required(VERSION 3.9.0)

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)

# Define C++ library and add all sources

file(GLOB_RECURSE SOURCES CONFIGURE_DEPENDS
        "${CMAKE_CURRENT_SOURCE_DIR}/src/main/cpp/*.cpp"
)

add_library(${PACKAGE_NAME} SHARED ${SOURCES})

# Add Nitrogen specs :)
include(${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/ReactNativeOttreliteInteropOTEL+autolinking.cmake)

# Set up local includes
target_include_directories(
        ${PACKAGE_NAME}
        PRIVATE
        "src/main/cpp"
)

# Include the cpp shared code's CMakeLists.txt
include("../cpp/CMakeLists.txt")

find_library(LOG_LIB log)

# Link all libraries together
target_link_libraries(
        ${PACKAGE_NAME}
        ${LOG_LIB}
        android          # <-- Android core
)
