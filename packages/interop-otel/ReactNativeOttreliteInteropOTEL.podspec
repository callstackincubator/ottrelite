require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ReactNativeOttreliteInteropOTEL"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported, :visionos => 1.0 }
  s.source       = { :git => "https://github.com/callstackincubator/ottrelite.git" }
  
  s.pod_target_xcconfig = {
    # C++ compiler flags, mainly for folly.
    "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) OTTRELITE_INTEROP_OTEL_VERSION=\\\"#{package["version"]}\\\" FOLLY_NO_CONFIG FOLLY_CFG_NO_COROUTINES",
    # C++ standard and opentelemetry flags
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
    "CLANG_CXX_LIBRARY" => "libc++"
  }

  # below: provide headers of libraries to all targets that depend on this Pod
  deps_install_dir_path = File.expand_path('third_party/wrapper/ios/install/include', __dir__)
  s.user_target_xcconfig = {
    'HEADER_SEARCH_PATHS' => '$(inherited) "#{deps_install_dir_path}"'
  }

  # opentelemetry-cpp wrapper
  s.subspec 'ottrelite-otel-wrapper' do |ss|
    # ad below: protobuf requires a specific order of includes, all the below public headers will be included in compilation
    # in a random order via the umbrella header file, therefore protobuf is put to private headers, which are not appended to the umbrella header.
    ss.public_header_files = "third_party/wrapper/ios/install/include/**/*.{h,hpp,inc}"
    ss.header_mappings_dir = "third_party/wrapper/ios/install/include"
    ss.vendored_libraries = "third_party/wrapper/ios/install/lib/*.a"
  end

  # Ottrelite's sources
  s.subspec 'ottrelite-core' do |ss|
    ss.source_files = [
      # Implementation (Swift)
      "ios/**/*.{swift}",
      # Autolinking/Registration (Objective-C++)
      "ios/**/*.{m,mm,hpp,h}",
      # Implementation (C++ objects)
      "cpp/**/*.{h,hpp,c,cpp}"
    ]

    # Expose headers
    ss.public_header_files = [
      "cpp/**/*.{h,hpp}",
      "ios/**/*.{h,hpp}"
    ]

    load 'nitrogen/generated/ios/ReactNativeOttreliteInteropOTEL+autolinking.rb'
    add_nitrogen_files(s)

    ss.dependency 'React-jsi'
    ss.dependency 'React-callinvoker'
  end

  s.default_subspecs = ['ottrelite-core', 'ottrelite-otel-wrapper']

  # since the script_phase is run in an isolated shell, the cmake path needs to be set manually
  cmake_path = `which cmake`.strip
  if cmake_path.empty?
    raise "CMake not found on PATH during Pod configuration, but it is required. Please install CMake and try again."
  end

  cmake_dir = File.dirname(cmake_path)

  # Script to build local opentelemetry-cpp for iOS
  s.script_phase = {
    :name => "Build opentelemetry-cpp",
    :execution_position => :before_compile,
    :script => <<-SCRIPT
      # add cmake to path (script is run in an isolated shell)
      export PATH="#{cmake_dir}:$PATH"

      # patch the umbrella header to fix Swift compilation - remove unnecessary headers, from which protobuf causes Swift errors
      UMBRELLA_HEADER_PATH="${PODS_ROOT}/Headers/Public/ReactNativeOttreliteInteropOTEL/ReactNativeOttreliteInteropOTEL-umbrella.h"
      if [ -f "$UMBRELLA_HEADER_PATH" ]; then
        # comment out all files that should not be exposed to Swift compiler as they would break compilation
        sed -E '/^#import "(OttreliteInteropOTEL.hpp|SpanConverter.hpp|InstrumentationScopeStore.hpp|nlohmann|google|opentelemetry|curl|openssl|brotli|zconf|zlib)[^"]*"/ s@^#import @// #import @' "$UMBRELLA_HEADER_PATH" > new_umbrella.h
        mv new_umbrella.h "$UMBRELLA_HEADER_PATH"

        echo "✅ Patched umbrella header at $UMBRELLA_HEADER_PATH"
      else
        echo "⚠️ Umbrella header not found at $UMBRELLA_HEADER_PATH"
      fi

      # build third-party dependencies
      cd #{File.join(__dir__, "third_party")}

      echo "Building for platform ${PLATFORM_NAME}, archs ${ARCHS}"

      ./buildIOS.sh "$PLATFORM_NAME" "$ARCHS" "$CONFIGURATION"
    SCRIPT
  }

  install_modules_dependencies(s)
end
