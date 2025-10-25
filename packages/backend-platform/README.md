# @ottrelite/backend-platform

This plugin is the platform-specific backend implementation for RN Ottrelite Core. On Android, it utilizes [ATrace](https://developer.android.com/ndk/reference/group/tracing) (Android tracing API), on iOS it utilizes the [OSSignposter API](https://developer.apple.com/documentation/os/ossignposter).

<a href="https://www.callstack.com/open-source?utm_campaign=generic&utm_source=github&utm_medium=referral&utm_content=ottrelite" align="center">
  <picture>
    <img alt="Ottrelite" src="https://github.com/callstackincubator/ottrelite/blob/main/img/banner.jpg?raw=true">
  </picture>
</a>

<h3 align="center">
  <b>Ottrelite</b> - Unified, extensible, cross-language tracing toolkit for React Native ⚡️🔎
</h3>

---

<div align="center">

  [![Release](https://github.com/callstackincubator/ottrelite/actions/workflows/release.yml/badge.svg)](https://github.com/callstackincubator/ottrelite/actions/workflows/release.yml)
  [![Docs](https://github.com/callstackincubator/ottrelite/actions/workflows/docs.yml/badge.svg)](https://github.com/callstackincubator/ottrelite/actions/workflows/docs.yml)
  [![Build, lint & test (JS)](https://github.com/callstackincubator/ottrelite/actions/workflows/build-lint-test.yml/badge.svg)](https://github.com/callstackincubator/ottrelite/actions/workflows/build-lint-test.yml)

  [![backend-platform npm downloads](https://img.shields.io/npm/dm/@ottrelite/backend-platform.svg?style=flat-square&label=NPM%20-%20%40ottrelite%2Fbackend-platform)](https://www.npmjs.com/package/@ottrelite/backend-platform)

</div>

## Supported features

| Feature                                       | Android support (compile-time) | iOS support (compile-time) |
| --------------------------------------------- | ------------------------------ | -------------------------- |
| synchronous traces (`{begin,end}Event`)       | API level ≥ 23 (Android M)     | iOS ≥ 15.0                 |
| asynchronous traces (`{begin,end}AsyncEvent`) | API level ≥ 29 (Android Q)     | iOS ≥ 15.0                 |
| counter events (`counterEvent`)               | API level ≥ 29 (Android Q)     | iOS ≥ 15.0                 |

> [!NOTE]
> The support levels above mean that the application must be **compiled** with at least the given `minSdkVersion`. This is because those APIs are not available on older Android versions and therefore it is not possible to compile the native code against older SDKs.

## Use case coverage

This backend is designed to cover development-time use cases, such as:

- Profiling the app performance during development
- Debugging performance issues

This backend is not designed for production use cases and should not be installed in such builds - be sure to conditionally install it from JS when a feature flag is set, such as `isProfilingEnabled`. To exclude it from the binary at build time, you can use the `react-native.config.js` file to specify that it should only be included in debug builds as per the documentation ([iOS](https://github.com/react-native-community/cli/blob/main/docs/dependencies.md#platformsiosconfigurations), [Android](https://github.com/react-native-community/cli/blob/main/docs/dependencies.md#platformsandroidbuildtypes)).

## Installation

To use this package, you need to install it in your React Native project:

```bash
npm install @ottrelite/backend-platform
# or
yarn add @ottrelite/backend-platform
# or
pnpm add @ottrelite/backend-platform
```

And register the backend with Ottrelite Core in your entrypoint file (e.g. `index.js`):

```typescript
import { OttreliteBackendPlatform } from '@ottrelite/backend-platform';
import { Ottrelite } from '@ottrelite/core';

// register the platform backend
Ottrelite.install([OttreliteBackendPlatform, ...]);

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

## Recording the trace

### Android

You can record and view traces in two ways:
- using Android Studio's Profiler's 'Capture System Activities' option, as per the [documentation](https://developer.android.com/studio/profile); this method works both on physical devices & the Android emulator
- using the `perfetto` CLI tool, which is distributed as part of the Android OS onboard most modern devices. More details can be found in the [documentation](https://perfetto.dev/docs/getting-started/system-tracing); the resulting file can be viewed in [Perfetto UI](https://ui.perfetto.dev/); this method works only on a physical device

> [!NOTE]
> Make sure that the app you are profiling is `profileable` by placing an [appropriate element](https://developer.android.com/guide/topics/manifest/profileable-element) within your `AndroidManifest.xml`'s `<application>` element: `<profileable android:shell="true" />`

> [!NOTE]
> If using the Perfetto CLI via the `record_android_trace` script, make sure to adjust the `--app` argument to match your app's package. We discovered that on some devices it is needed to set it, otherwise some userspace events may be missing. Some devices allow to pass an additional tracing category, `app`, which can also be considered in such cases. An example invocation might look like the following: `./record_android_trace --app=com.callstack.ottrelite.demo -o trace_file.perfetto-trace -t 40s -b 64mb sched freq idle am wm gfx view binder_driver hal dalvik camera input res memory rs app`.
>
> If your events are still missing, make sure your app is `profileable`.
>
> The Android Studio Profiler does not require any kind of configuration as the one described here and it should always work out of the box; it will also warn you in case your app is not `profileable`.

### iOS

You can view the traces in Xcode Instruments, as per the [documentation](https://developer.apple.com/documentation/os/recording-performance-data#Review-Signposts-in-Instruments).

The traces will be signpost-ed using the `OSSignposter` API, using the default `OS_LOG_DEFAULT` logger.
