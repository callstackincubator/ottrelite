# Demonstrator pure RN application for Ottrelite

This is a demonstrator application for the Ottrelite project, showcasing how to set up, run a React Native application with Ottrelite backends & use the Ottrelite Core API to apply observability to the application.

- [Demonstrator pure RN application for Ottrelite](#demonstrator-pure-rn-application-for-ottrelite)
- [Getting Started](#getting-started)
  - [Step 1: Start Metro](#step-1-start-metro)
  - [Step 2: Build and run the app](#step-2-build-and-run-the-app)
    - [Build types](#build-types)
      - [Debug build](#debug-build)
      - [Release build](#release-build)
      - [Profiling build](#profiling-build)
    - [Android](#android)
      - [Debug build](#debug-build-1)
      - [Release build](#release-build-1)
      - [Profiling build](#profiling-build-1)
    - [iOS](#ios)
      - [Debug build](#debug-build-2)
      - [Release build](#release-build-2)
      - [Profiling build](#profiling-build-2)
  - [Step 3: Trace the application](#step-3-trace-the-application)

---

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
pnpm start
```

## Step 2: Build and run the app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Build types


#### Debug build

The `debug` build variant (Android) or `Debug` configuration (iOS) will build the app in debug mode, with tracing enabled by default.

```sh
pnpm android
```

#### Release build

The `release` build variant (Android) or `Release` configuration (iOS) will build the app in release mode with the env var `DISABLE_TRACING` set to `true`, causing Ottrelite tracing to be disabled at runtime.

**Please note** that disabling of tracing at runtime happens only via `pnpm {android,ios}:release` script, not if building from Android Studio or Xcode, in which case tracing will be disabled. This is just the exemplary setup for this demo, in a usual case you'd likely want the inverted logic, in which case tracing is disabled by default and you only enable it when the env var is set instead. Handling of this env var is done by Babel plugin `transform-inline-environment-variables` and the `pnpm {android,ios}:release` script which passes the proper value of `DISABLE_TRACING` env var.

```sh
pnpm android:release
```

#### Profiling build

The `profiling` build variant (Android) or `Profiling` configuration (iOS) inherits everything from the `release` build variant and will build the app in profiling mode. This is the perfect mode that gives reliable performance behaviour after all compile-time optimizations.

```sh
pnpm android:profiling
```

### Android

The script [`android/app/build.gradle`](android/app/build.gradle) configures Ottrelite's Gradle plugin to inject tracing instrumentation for RN internals only for the `profiling` variant.

#### Debug build

```sh
pnpm android
```

#### Release build

```sh
pnpm android:release
```

#### Profiling build

```sh
pnpm android:profiling
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

#### Debug build

```sh
pnpm ios
```

#### Release build

```sh
pnpm ios:release
```

#### Profiling build

```sh
pnpm ios:profiling
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

## Step 3: Trace the application

The final step is to trace the application using one of the available backends. This step varies depending on the backend you would like to use.

The demonstrator application has all backends installed simultaneously, so you can record the trace from any backend of your choice. The correct way to do it is by following the steps of the backend, which is described in a given `README.md` file of the backends. You can find a list of available backends in the [root README](../../README.md) file.

If using the Jaeger backend from [the example](../backend-jaeger/), remember to `adb forward tcp:4318 tcp:4318` for Android devices/emulators.
