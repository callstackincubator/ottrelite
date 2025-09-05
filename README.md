# React Native Ottrelite

- [React Native Ottrelite](#react-native-ottrelite)
  - [State of the project](#state-of-the-project)
    - [Development API](#development-api)
    - [OTEL Interoperability](#otel-interoperability)
    - [RN internals integration](#rn-internals-integration)
  - [Installation](#installation)
  - [Documentation](#documentation)

---

The aim of this project is to provide a unified API for performance tracing in React Native applications, allowing developers to easily instrument their apps with various backends for tracing, profiling, and performance monitoring.

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

## Documentation

Please consult the [documentation website](https://callstackincubator.github.io/ottrelite/).
