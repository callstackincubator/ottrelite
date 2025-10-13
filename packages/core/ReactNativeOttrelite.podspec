require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ReactNativeOttrelite"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported, :visionos => 1.0 }
  s.source       = { :git => "https://github.com/callstackincubator/ottrelite.git" }
  
  s.pod_target_xcconfig = {
    # C++ compiler flags, mainly for folly.
    "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) OTTRELITE_CORE_VERSION=\\\"#{package["version"]}\\\" FOLLY_NO_CONFIG FOLLY_CFG_NO_COROUTINES",
    # C++ standard flags
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
    "CLANG_CXX_LIBRARY" => "libc++"
  }

  # Ottrelite's sources
  s.source_files = [
    # Implementation (Swift)
    "ios/**/*.{swift}",
    # Autolinking/Registration (Objective-C++)
    "ios/**/*.{m,mm,hpp,h}",
    # Implementation (C++ objects)
    "cpp/**/*.{h,hpp,c,cpp}"
  ]

  # Expose headers
  s.public_header_files = [
    "cpp/**/*.{h,hpp}",
    "ios/**/*.{h,hpp}"
  ]

  load 'nitrogen/generated/ios/ReactNativeOttrelite+autolinking.rb'
  add_nitrogen_files(s)

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'

  install_modules_dependencies(s)
end
