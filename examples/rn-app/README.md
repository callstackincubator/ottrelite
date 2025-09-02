# Demonstrator pure RN application for Ottrelite

This is a demonstrator application for the Ottrelite project, showcasing how to set up, run a React Native application with Ottrelite backends & use the Ottrelite Core API to apply observability to the application.

- [Demonstrator pure RN application for Ottrelite](#demonstrator-pure-rn-application-for-ottrelite)
- [Getting Started](#getting-started)
  - [Step 1: Start Metro](#step-1-start-metro)
  - [Step 2: Build and run the app](#step-2-build-and-run-the-app)
    - [Android](#android)
    - [iOS](#ios)
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

### Android

```sh
pnpm android
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

```sh
pnpm ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run the app — you can also build it directly from Android Studio or Xcode.

## Step 3: Trace the application

The final step is to trace the application using one of the available backends. This step varies depending on the backend you would like to use.

The demonstrator application has all backends installed simultaneously, so you can record the trace from any backend of your choice. The correct way to do it is by following the steps of the backend, which is described in a given `README.md` file of the backends. You can find a list of available backends in the [root README](../../README.md) file.
