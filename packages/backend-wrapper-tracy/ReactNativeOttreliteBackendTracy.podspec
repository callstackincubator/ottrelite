require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ReactNativeOttreliteBackendTracy"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported, :visionos => 1.0 }
  s.source       = { :git => "https://github.com/callstackincubator/ReactNativeOttrelite.git", :tag => "#{s.version}" }

  s.source_files = [
    # Implementation (Swift)
    "ios/**/*.{swift}",
    # Autolinking/Registration (Objective-C++)
    "ios/**/*.{m,mm}",
    # Implementation (C++ objects)
    "cpp/**/*.{hpp,cpp}",
    # Tracy client library
    "ios/tracy/public/TracyClient.cpp",
  ]

  s.exclude_files = 'ios/tracy/public/**/elf.cpp', 'ios/tracy/public/**/TracySourceView.cpp', 'ios/tracy/public/**/TracyCpuid.hpp', 'ios/tracy/public/**/TracySystem.cpp', 'ios/tracy/public/**/TracyRingBuffer.hpp', 'ios/tracy/public/**/TracyD3D*.hpp', 'ios/tracy/public/**/TracyLua.hpp', 'ios/tracy/public/**/TracyOpenCL.hpp', 'ios/tracy/public/**/TracyVulkan.hpp', 'ios/tracy/public/**/TracyCUDA.hpp'
  s.public_header_files = 'ios/tracy/public/**/*.{h,hpp}'
  s.header_mappings_dir = 'ios/tracy/public'

  s.pod_target_xcconfig = {
    # C++ compiler flags, mainly for folly.
    "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) TRACY_ENABLE=ON TRACY_CALLSTACK=5 OTTRELITE_BACKEND_TRACY_VERSION=\\\"#{package["version"]}\\\" FOLLY_NO_CONFIG FOLLY_CFG_NO_COROUTINES"
  }

  project_dir = File.absolute_path("./ios/")

  s.script_phase = {
    :name => "Build Tracy client",
    :execution_position => :before_compile,
    :script => <<-SCRIPT
      cd #{project_dir}
      if [ ! -d tracy ]; then
          echo "Cloning Tracy..."
          git clone -b v0.12.2 https://github.com/wolfpld/tracy.git
      fi
    SCRIPT
  }

  load 'nitrogen/generated/ios/ReactNativeOttreliteBackendTracy+autolinking.rb'
  add_nitrogen_files(s)

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'
  s.dependency 'ReactNativeOttrelite'
  install_modules_dependencies(s)
end
