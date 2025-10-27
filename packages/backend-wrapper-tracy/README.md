# @ottrelite/backend-wrapper-tracy

This plugin is a wrapper around the [open-source Tracy profiler](https://github.com/wolfpld/tracy) client, which brings tracing using Tracy to Ottrelite.

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

  [![backend-wrapper-tracy npm downloads](https://img.shields.io/npm/dm/@ottrelite/backend-wrapper-tracy.svg?style=flat-square&label=NPM%20-%20%40ottrelite%2Fbackend-wrapper-tracy)](https://www.npmjs.com/package/@ottrelite/backend-wrapper-tracy)

</div>

## Supported features

| Feature                                       | Support level                                                              |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| synchronous traces (`{begin,end}Event`)       | Supported                                                                  |
| asynchronous traces (`{begin,end}AsyncEvent`) | Unsupported (see [tracy#149](https://github.com/wolfpld/tracy/issues/149)) |
| counter events (`counterEvent`)               | Supported                                                                  |

## Use case coverage

This backend is designed to cover development-time use cases, such as:

- Profiling the app performance during development
- Debugging performance issues

This backend is not designed for production use cases and should not be installed in such builds - be sure to conditionally install it from JS when a feature flag is set, such as `isProfilingEnabled`. To exclude it from the binary at build time, you can use the `react-native.config.js` file to specify that it should only be included in debug builds as per the RN CLI documentation ([iOS](https://github.com/react-native-community/cli/blob/main/docs/dependencies.md#platformsiosconfigurations), [Android](https://github.com/react-native-community/cli/blob/main/docs/dependencies.md#platformsandroidbuildtypes)).

## Installation

To use this package, you need to install it in your React Native project:

```bash
npm install @ottrelite/backend-wrapper-tracy
# or
yarn add @ottrelite/backend-wrapper-tracy
# or
pnpm add @ottrelite/backend-wrapper-tracy
```

Additionally, for iOS run `pod install` in the `ios` directory.

And register the backend with Ottrelite Core in your entrypoint file (e.g. `index.js`):

```typescript
import { OttreliteBackendTracy } from '@ottrelite/backend-wrapper-tracy';
import { Ottrelite } from '@ottrelite/core';

// register the Tracy wrapper backend
Ottrelite.install([OttreliteBackendTracy, ...]);

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

Remember to give attribution to the Tracy Profiler in your application, as in the [last section](#additional-information).

## Recording the trace

To record the trace, you must use the Tracy Profiler tool. For Windows, there are releases containg `.7z` archives with prebuilt binaries, for other platforms you must follow the [documentation](https://github.com/wolfpld/tracy/releases/latest/download/tracy.pdf) to build it yourself. In short, the instructions to build locally are as follows:

```bash
git clone -b v0.12.2 https://github.com/wolfpld/tracy
cd tracy
cmake -B profiler/build -S profiler -DCMAKE_BUILD_TYPE=Release
cmake --build profiler/build --config Release --parallel
cd profiler/build
# on Windows, you can now run tracy-profiler.exe from this directory.
# on macOS & Linux, you can run ./tracy-profiler from this directory.
./tracy-profiler
```

In case of Android, simply forward the port used by Tracy (default is `8086`) to your device/emulator, e.g. using `adb` for Android:

```bash
adb forward tcp:8086 tcp:8086
```

## Limitations

The `tracy::Profiler::PlotData` function that handles counter events assumes that the counter's name is persisted (it does not copy the string data, just a pointer to it). This is valid for C++ usage where the data is hardcoded in the code (static), yet here (e.g. from JS) it is dynamic. Therefore, this backend keeps the strings passed to the `counterEvent` function in an `std::unordered_set` to ensure that the strings are not deallocated whenever Tracy would try to access them. This means that the counter names will be kept in memory for the lifetime of the backend instance, so be careful with the number of unique counter names you use - using an enormous number of unique counter names (or of enormous lengths) may lead to increased memory usage.

Since Tracy does not support async events, OTEL APIs data will not be visible here. This is because the closest equivalent of OTEL's `Span`s are async events, which are not supported by this backend.

## Additional information

This package utilizes the Tracy Profiler client API under the hood. Please remember to give proper attribution to the Tracy Profiler in your application, as per the [Tracy Profiler license](https://github.com/wolfpld/tracy/blob/master/LICENSE).

Many thanks to the author & contributors of the [Tracy Profiler](https://github.com/wolfpld/tracy).
