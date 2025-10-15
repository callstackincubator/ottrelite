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

  [![core npm downloads](https://img.shields.io/npm/dm/@ottrelite/core.svg?style=flat-square&label=NPM%20-%20%40ottrelite%2Fcore)](https://www.npmjs.com/package/@ottrelite/core)
  [![instrumentation-react npm downloads](https://img.shields.io/npm/dm/@ottrelite/instrumentation-react.svg?style=flat-square&label=NPM%20-%20%40ottrelite%2Finstrumentation-react)](https://www.npmjs.com/package/@ottrelite/instrumentation-react)
  [![backend-platform npm downloads](https://img.shields.io/npm/dm/@ottrelite/backend-platform.svg?style=flat-square&label=NPM%20-%20%40ottrelite%2Fbackend-platform)](https://www.npmjs.com/package/@ottrelite/backend-platform)
  [![backend-wrapper-tracy npm downloads](https://img.shields.io/npm/dm/@ottrelite/backend-wrapper-tracy.svg?style=flat-square&label=NPM%20-%20%40ottrelite%2Fbackend-wrapper-tracy)](https://www.npmjs.com/package/@ottrelite/backend-wrapper-tracy)
  [![interop-otel npm downloads](https://img.shields.io/npm/dm/@ottrelite/interop-otel.svg?style=flat-square&label=NPM%20-%20%40ottrelite%2Finterop-otel)](https://www.npmjs.com/package/@ottrelite/interop-otel)

</div>

- [State of the project](#state-of-the-project)
  - [Development API](#development-api)
  - [OTEL Interoperability](#otel-interoperability)
  - [RN internals integration](#rn-internals-integration)
- [Installation](#installation)
- [Documentation](#documentation)

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
