# React Native Ottrelite

- [React Native Ottrelite](#react-native-ottrelite)
  - [State of the project](#state-of-the-project)
    - [Development API](#development-api)
    - [OTEL Interoperability](#otel-interoperability)
    - [RN internals integration](#rn-internals-integration)
  - [Installation](#installation)
  - [React API](#react-api)
    - [`useTracer`](#usetracer)
    - [`useComponentRenderTracing`](#usecomponentrendertracing)
    - [`vanillaTracerFactory`](#vanillatracerfactory)
  - [OpenTelemetry (OTEL) API - production \& development](#opentelemetry-otel-api---production--development)
    - [Ottrelite cross-language exporters](#ottrelite-cross-language-exporters)
    - [Ottrelite React / Native Instrumentations](#ottrelite-react--native-instrumentations)
      - [React Instrumentation - Babel Plugin](#react-instrumentation---babel-plugin)
      - [React Native Instrumentation - Systrace API for JS \& Java/Kotlin](#react-native-instrumentation---systrace-api-for-js--javakotlin)
        - [JavaScript](#javascript)
        - [Java/Kotlin](#javakotlin)
  - [Development API](#development-api-1)
    - [Available development backends](#available-development-backends)
    - [API usage](#api-usage)
      - [Synchronous traces](#synchronous-traces)
      - [Asynchronous traces](#asynchronous-traces)
      - [Counter events](#counter-events)
    - [Integration with RN's Systrace API](#integration-with-rns-systrace-api)
    - [Recording traces](#recording-traces)
    - [Creating a backend](#creating-a-backend)
    - [Development](#development)
      - [iOS - additional setup](#ios---additional-setup)
  - [Examples](#examples)
    - [Example RN app](#example-rn-app)
    - [Example consumer lib (C++, Kotlin \& Swift APIs)](#example-consumer-lib-c-kotlin--swift-apis)
    - [Jaeger backend Docker service](#jaeger-backend-docker-service)

---

The aim of this project is to provide a unified API for observability in React Native applications, allowing developers to easily instrument their apps with various backends for tracing, profiling, and performance monitoring.

The core package - `@ottrelite/core` - provides a so-called [**Development API**](#development-api) (which is designed to be consumed by programmers) for instrumenting your application for purely **development use cases** (profiling your code, tracing performance issues, etc.). The actual implementation of recording / displaying / reporting of the data is provided by individual, pluggable packages (called **backends**). An arbitrary number of backends (0, 1 or more) can be installed simultaneously, allowing you to use multiple backends at once, or switch between them as needed.

For **production use cases**, Ottrelite [integrates with OpenTelemetry (OTEL) JS API](#opentelemetry-otel-api---production--development), supporting all OTEL community instrumentations, custom processors, etc. The only limitation is that the setup must follow our guidelines, which are described in this README.

## State of the project

### Development API

| Feature         | Status          |
| --------------- | --------------- |
| C++ API         | ✅               |
| JS API          | ✅               |
| Swift API       | ⏳ (in progress) |
| Java/Kotlin API | ✅               |
| RN integration  | ✅               |

> [!WARNING]
> Currently, Android builds are not working *yet*. This is because we didn't integrate the native C++ code builds into Gradle yet. Please stay tuned for new updates soon. If you want to try out the Android API with RN internals tracing, please switch to the `feature/gradle-plugin` branch.

### OTEL Interoperability

| Feature            | Status |
| ------------------ | ------ |
| OTEL-JS interop    | ✅      |
| OTEL-CPP interop   | ✅      |
| OTEL-Java interop  | TBD    |
| OTEL-Swift interop | TBD    |
| RN integration     | ✅      |

### RN internals integration

| Platform | Status                         |
| -------- | ------------------------------ |
| iOS      | ⚠️ - only `Systrace.js` enabled |
| Android  | ✅                              |

## Installation

First, install the package with:

```bash
npm install --save @ottrelite/core
# or
yarn add @ottrelite/core
# or
pnpm add @ottrelite/core
```

Then, follow the instructions from the respective section(s) below, depending on whether your use case involves production-time telemetry, development-time tracing or both.

## React API

The library offers features simplifying integration with React.

### `useTracer`

This hook simply wraps the .

```typescript
const tracer = useTracer('my-trace-unit');
```

### `useComponentRenderTracing`

This hook traces a component's render lifecycle (i.e., any - first or subsequent - render), however in a different way than you might expect - please read the following explanation.

The start & end of the span (event) in the trace results is **not** the start & end time of JS render logic execution due to limitations coming from the concurrent root feature of React starting from v18 ([more about that here](https://legacy.reactjs.org/blog/2022/03/29/react-v18.html)). Concurrent rendering makes it possible for React to interrupt a render, effectively making this redundant. Since the Development API **must** maintain integrity within calls to begin/end event methods (e.g. orphaning a started event could cause all sorts of different problems, which could happen if the render was interrupted), it is not possible to simply synchronously start/end events within the render function.

Therefore, instead we capture the JS logic start and end times in a ref, trace the event from `useEffect` / `useLayoutEffect` hooks to produce a span that starts after its JS render logic finishes running, and ends after the component has been rendered to the tree. The measured JS logic render time is reported as an attribute named `jsLogicDuration` within that span.

Additional event arguments can be passed as the optional second argument to `useComponentRenderTracing`.

> [!IMPORTANT]
> The hook **must** be called first in the component to mark the JS logic start time undelayed. Any components you render & return **must** first be stored in a variable, and returned **after** calling the hook's returned `markJSRenderEnd` function.

```typescript
function MyComponent() {
  const { markJSRenderEnd } = useComponentRenderTracing(heading, {
    attr1: "...",
    ...
  });

  // ...

  const contents = <View>{/* ... */}</View>;

  markJSRenderEnd();

  return contents;
}
```

### `vanillaTracerFactory`

This function (not a hook, though) is meant for internal consumption in `useTracer`, or for Class Components. It wraps the OTEL `trace.getTracer` API but also performs a sanity check whether the global `TracerProvider` is actually Ottrelite's implementation, otherwise logging a warning.

```typescript
class MyComponent {
  private tracer = vanillaTracerFactory('MyComponent');

  ...
}
```

## OpenTelemetry (OTEL) API - production & development

To use the package in production, you can use OpenTelemetry as you would normally do in any project. With Ottrelite, all the spans are processed by JS processor but finally land in exporter(s) only from the `@ottrelite/` packages. Naturally, if you include non-ottrelite's exporters, the JS events will be properly exported via them, yet the events captured in C++, Java/Kotlin, Swift or Objective-C code would not reach these exporters. The main design objective of Ottrelite is to have a common sink (i.e., set of exporters), configured once from JS, implemented in C++ as a native module (current implementation uses Nitro Modules).

> ![NOTE]
> The above implies a limitation of Ottrelite: to leverage a cross-language single exporter(s) sink, all exporters that are configured must be ottrelite-compatible native exporter packages. What we offer has full parity with the exporters offered by OTEL JS and can be freely extended; contributions are always welcome.

### Ottrelite cross-language exporters

TODO: write this!

### Ottrelite React / Native Instrumentations

Apart from the [OTEL community instrumentations for JS](https://github.com/open-telemetry/opentelemetry-js-contrib) you can use, Ottrelite provides its own set of instrumentations specifically designed for React and React Native applications.

#### React Instrumentation - Babel Plugin

This instrumentation is a Babel plugin that automatically instruments your React components with OpenTelemetry tracing for:

- lifecycle of components (first & every next render), for both functional and class components
- React hooks (e.g., `useEffect`, `useMemo`, etc.)

It leverages a visitor to inject instrumentation into your code at Babel transformation time, so you don't have to manually instrument your components / hooks. The transformation is opt-in via a directive, `"use trace";`. For more information, please refer to the [README of the `@ottrelite/instrumentation-react` package](./packages/instrumentation-react/README.md).

#### React Native Instrumentation - Systrace API for JS & Java/Kotlin

##### JavaScript

This package has opt-in options to revive the [RN Systrace API](https://reactnative.dev/docs/systrace), which is a simple JS API for tracing synchronous, asynchronous & counter events in your application. By default it's importable, but it's a no-op. Ottrelite can inject proper globals to make it functional and pipe the calls to [Ottrelite's Development API](#development-api).

To activate it, set `reviveSystraceAPI: true` in the optional configuration object passed to `Ottrelite.install`, as presented in the code extract in section [Development API](#development-api).

##### Java/Kotlin

TODO: write this! ~ Dominik - Gradle visitor, etc.

## Development API

The quickest way to use Ottrelite is via the Development API. This API resembles the [RN Systrace API](https://reactnative.dev/docs/systrace) and indeed 'revives' the no-op `Systrace` export of RN. Calls to this API are reported to Ottrelite backends and can be previewed .

To use it, install Ottrelite Core and register backends you'd like to use, include the following `Ottrelite.install()` call in your entrypoint file (e.g. `index.js`):

```javascript
// install the Ottrelite Core & backend(s)
import { OttreliteBackendPlatform } from '@ottrelite/backend-platform';
import { OttreliteBackendTracy } from '@ottrelite/backend-wrapper-tracy';
import { Ottrelite } from '@ottrelite/core';
import { AppRegistry } from 'react-native';

import { name as appName } from './app.json';
import App from './src/App';

Ottrelite.install(
  // below: list of development backends to install
  [OttreliteBackendPlatform, OttreliteBackendTracy],
  // below: optional configuration options
  {
    reviveSystraceAPI: true, // if set to true, the RN Systrace API will be revived & configured to call Ottrelite's methods
  }
);

AppRegistry.registerComponent(appName, () => App);
```

> [!TIP]
> In case of debugging performance problems, tracing usually makes sense only in **release** builds (used in a development environment, i.e., not in production). Debug builds are unoptimized (both the native and non-native sides) and therefore their performance may not be representative and could greatly differ from the performance of release builds.

> [!TIP]
>
> **At the same time**, depending on your use case, you may want to include a package in production-deployed release builds. Please remember not to `install()` the development-only backends in production-deployed builds and exclude them from even being packaged with the binary using `react-native.config.js` file, as per the RN CLI documentation ([iOS](https://github.com/react-native-community/cli/blob/main/docs/dependencies.md#platformsiosconfigurations), [Android](https://github.com/react-native-community/cli/blob/main/docs/dependencies.md#platformsandroidbuildtypes))

### Available development backends

| Backend Name                       | Description                                                                 | Platform(s)  | OTEL compatiblity                              | README                                             |
| ---------------------------------- | --------------------------------------------------------------------------- | ------------ | ---------------------------------------------- | -------------------------------------------------- |
| `@ottrelite/backend-platform`      | Platform-default tracing backend (ATrace for Android, OSSignposter for iOS) | Android, iOS | ✅ Yes                                          | [README](packages/backend-platform/README.md)      |
| `@ottrelite/backend-wrapper-tracy` | Tracy profiler backend for Android and iOS                                  | Android, iOS | ❌ Incompatible (lack of support for async API) | [README](packages/backend-wrapper-tracy/README.md) |

### API usage

#### Synchronous traces

To record synchronous traces, you can use the `Ottrelite.beginEvent()` and `Ottrelite.endEvent()` methods. The `beginEvent` method starts a new event (imagine it is put on top of a stack), while the `endEvent` method ends the most recent event (analogy: popping it off the stack). The event name is a string that identifies the event.

Events maintain a hierarchical structure, so you can nest them. If you begin a new event while another one is already in progress, the new event will be a child of the previous one.

```javascript
import { Ottrelite } from '@ottrelite/core';

Ottrelite.beginEvent('MyEvent');
// ... do some work ...
Ottrelite.endEvent('MyEvent');
```

#### Asynchronous traces

To record asynchronous traces, you can use the `Ottrelite.beginAsyncEvent()` and `Ottrelite.endAsyncEvent()` methods. The `beginAsyncEvent` method starts a new asynchronous event, while the `endAsyncEvent` method ends the most recent asynchronous event.

```javascript
import { Ottrelite } from '@ottrelite/core';

// begin an asynchronous event
const token = Ottrelite.beginAsyncEvent('MyAsyncEvent');
// ... do some work ...
Ottrelite.endAsyncEvent('MyAsyncEvent', token);
```

#### Counter events

To record counter events, you can use the `Ottrelite.counterEvent()` method. This method allows you to record a numeric value over time, which can be useful for tracking metrics such as performance counters.

```javascript
import { Ottrelite } from '@ottrelite/core';

Ottrelite.counterEvent('MyCounterEvent', 42);

setTimeout(() => {
  // update the value
  Ottrelite.counterEvent('MyCounterEvent', 80);
}, 1000);
```

### Integration with RN's Systrace API

React Native exports its own `Systrace` API, which supports synchronous, asynchronous and counter events. While this API is mostly used for development of RN itself, it is still exposed for production apps, but does nothing (i.e., calls are no-ops).

Ottrelite optionally (when `reviveSystraceAPI` is set to `true`) defines global variables that this `Systrace` API uses, effectively making these calls effective. For instance, if you launch the app, you will see a hierarchy of events related to `require()` invocations.

> [!NOTE]
> It is advised to use the `Ottrelite` API instead of the `Systrace` API, as the former is more flexible and provides a unified interface for all backends. The `Systrace` API is provided for compatibility with existing code that uses it.

> [!WARNING]
> The synchronous and counter APIs of `Systrace` and `Ottrelite` are interoperable, i.e., an event began with one API can be ended with the other. However, the asynchronous APIs are not interoperable (the tokens / cookies returned by `Systrace` are numbered differently than these of `Ottrelite` and could cause collisions if passed crossing API boundaries), so you must use either `Ottrelite` or `Systrace` for given events, but not mix them at start & end of a given event.

```javascript
// using the Systrace API
import { Systrace } from 'react-native';

Systrace.beginEvent('MyEvent');
// ... do some work ...
Systrace.endEvent('MyEvent');

Systrace.beginAsyncEvent('MyAsyncEvent', 1);
// ... do some work ...
Systrace.endAsyncEvent('MyAsyncEvent', 1);

Systrace.counterEvent('MyCounterEvent', 80);
```

### Recording traces

Each of the backends provides a different way of recording traces, so the exact usage will depend on the backend you choose to use. Please consult their individual `README.md` files for instructions.

### Creating a backend

TODO: write this section.

### Development

To start developing, first clone the repository:

```bash
git clone https://github.com/callstackincubator/ReactNativeOttrelite
```

Then, install the dependencies & generate the glue code using Nitro Modules:

```bash
pnpm i
```

Any time you change the Nitro spec files (TS), run `pnpm run build` to regenerate the glue code.

#### iOS - additional setup

For iOS, you need to install the CocoaPods dependencies. Run the following command in the `ios` directory of your project:

```bash
pnpm pod:install
```

## Examples

### Example RN app

The `examples/rn-app` directory contains an example app presenting most of the features. After running `pnpm i` in the root directory, you can `cd` to it and run `pnpm android` or `pnpm ios`.

### Example consumer lib (C++, Kotlin & Swift APIs)

The `examples/lib-consumer-cpp` directory contains an example native module (in this case, a Nitro Module, but this is not required) that consumes the Ottrelite C++ API.

TODO: Kotlin & Swift API demos are still under construction

### Jaeger backend Docker service

The `examples/backend-jaeger` directory contains a Docker Compose file for running the Jaeger backend service. When run (`docker compose up -d`), it will start the Jaeger UI to collect OTEL data from the example app. Then, just run the app on the device you've run Jaeger on (otherwise, you will need to adjust endpoint path to match your server's address) and you should start seeing traces in the Jaeger UI.
