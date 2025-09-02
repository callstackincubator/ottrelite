# @ottrelite/core

This is the core package of the Ottrelite library for React Native, which provides a unified interface for various backends that can be used to trace and profile React Native applications.

## Documentation

All the features, usage & installation of this package are documented in the [root README.md](../../README.md) file of the repository.

## Development

For developer reference, this package utilizes the JS OpenTelemetry API as well as opentelemetry-cpp to integrate with OTEL's APIs. The CPP package requires libcurl and protobuf, which in turn depends on openssl, brotli, zlib. This complicates the build process, especially for iOS, where the packages are configured using CocoaPods while the primary build system for the listed C++ packages is CMake.

For integration with opentelemetry-cpp, this project carries a file packages/core/third_party/wrapper/patches/useLocalOTELDeps.patch that contains changes to opentelemetry-cpp that disable CMake instructions causing the build to fail on iOS when libraries for the MacOS platform are discovered by CMake instead. The patch is applied during the build process to the local clone of opentelemetry-cpp.

### iOS

Moreover, the aforementioned packages need to be compiled from source for the right architecture, using the right toolchain for iOS.

To organize this, the packages are built with CMake and artifacts (static libraries, headers & CMake configs) are installed to `third_party/wrapper/ios/`; the headers & libraries are configured for use in Xcode via the `.podspec` file. The Pod registers a pre-compile script phase which runs `third_party/buildIOS.sh` script that builds the CMake wrapper & copies over necessary files. Moreover, since the CocoaPods-generated umbrella header would by default include all headers of dependencies, including opentelemetry-cpp's & protobuf's, all the dependency headers are excluded (commented out) by the script phase, as the special macros used by protobuf seem to break the Swift module compilation.

The `buildIOS.sh` script requires 2 positional arguments, which are passed from Xcode's env variables that the script phase has access to: the target platform (iOS device / simulator) & CPU architecture. An example invocation that builds artifacts for the simulator for the arm64 architecture is: `./buildIOS.sh iphonesimulator arm64`.

### Android

TODO: write this section

### OTEL interoperability

Ottrelite provides interoperability with OpenTelemetry (OTEL) through a set of adapter facilities.

#### Javascript

Firstly, Ottrelite provides its own `TracerProvider` ([`OttreliteTracerProvider.ts`](./src/otel/OttreliteTracerProvider.ts)) that provides adequate configuration for JS (configures the default resource to carry ottrelite's metadata, registers W3C & trace context baggage propagators, by default - `StackContextManager`). Invoking `register` on it, apart from the aforementioned, also calls invokes configuration of the global C++ API provider, described in the section below.

The analogous applies to [`OttreliteMeterProvider`](src/otel/OttreliteMeterProvider.ts). An implementation detail difference is that the meter provider hooks into returned instrument creation methods & their return values dynamically by replacing properties on instances, to call its own logic before the original is executed.

The OTEL API is also hooked into by the [`DevSpanProcessorInterceptor.ts`](src/otel/processor/DevSpanProcessorInterceptor.ts), which can be registered to propagate all OTEL spans live to the [Development API](../../README.md#development-api).

#### C++

##### Usage

The global C++ Tracer and Meter Providers are registered - respectively - from `installGlobalOTELCPPTracerProvider` and `installGlobalOTELCPPMeterProvider` Nitro Module methods. Calling each of those makes sense **only once**. At the first call, the Ottrelite tracer/meter exporters that have been instantiated and registered in JavaScript so far, will also be registered in the C++ API. This is the single-implementation, single-configuration approach that Ottrelite follows: create & configure all tracer/meter exporters in JS, use them from JS, C++, Kotlin/Java & Swift code.

> [!WARNING]
> Invoking the aforementioned install methods more than once will discard all previously registered C++ tracer/meter exporters. It is important to first register all the tracer/meter exporters in JS, and then call the `register()` methods of `OttreliteTracerProvider` and `OttreliteMeterProvider` in JS.

##### Configuration

The `Ottrelite.install` method accepts 3 C++ OTEL SDK - specific configuration options:

1. `cppBatchLogRecordProcessorOptions` - options for the `opentelemetry::sdk::logs::BatchLogRecordProcessorFactory`
2. `cppMetricReaderOptions` - options for the `opentelemetry::sdk::metrics::PeriodicExportingMetricReaderFactory`
3. `cppTraceBatchSpanProcessorOptions` - options for the `opentelemetry::sdk::trace::opentelemetry::sdk::trace::BatchSpanProcessorFactory`

Those can only be passed once and will be used to configure the C++ OTEL SDK, which is the data sink for OTEL traces from all interoperability layers in all languages. However, those options will only affect the C++ data export - other languages will process, report & provide the spans according to their own setup.

##### Implementing a custom exporter

To implement a custom exporter, first create a C++ Nitro Module spec:

```typescript
// in MyOttreliteExporter.nitro.ts
import type { OttreliteExporter } from '@ottrelite/core';

export interface MyOttreliteExporter
  extends HybridObject<{ ios: 'c++'; android: 'c++' }>,
    OttreliteExporter {}
```

After codegen-ing the C++ glue code from this spec, implement the exporter in C++. The primary methods that are crucial for the implementation are:

- `void initExporter(const OTLPExporterConfig &config);`
- `void exportSpans(const std::vector<SerializedReadableSpan> &spans, const std::function<void(const ExportResult & /* result */)> &resultCallback);`
- `std::shared_ptr<Promise<void>> shutdown();`
- `std::shared_ptr<Promise<void>> forceFlush();`

Those methods are standard for OTEL exporters in according to its specification, yet the methods accept internal Ottrelite object types.

The `OTLPExporterConfig` is Nitro-codegened from [`OTLPExporterConfig.ts`](src/types/OTLPExporterConfig.ts) and represents the most important JS configuration for exporters in general. If some more configuration levels are needed to be covered, please file a PR or issue.

The `ExportResult` is trivial and is a 1:1 CPP-JS mapping of the result type.

The `SerializedReadableSpan` is a representation of a span in JS. Due to some limitations of Nitro, the object currently is not possible to be passed to CPP 1:1, however the overhead of conversion is minimal: some properties are only cast as types, while some need to be remapped:

- due to Nitro codegen problems with recursive type references, some methods need to be masked & some types require aliases
- all `SpanContext` objects are serialized to a string using built-in JS OTEL functionality, which is then parsed on the C++ side using built-in C++ OTEL functionality

For conversion of `SerializedReadableSpan`s to C++ OTEL vector of `Recordable`s, the `::ottrelite::otel::SpanConverter::convertSpans(spans, resourcesMemory)` from `SpanConverter.hpp` can be used:

```cpp
#include "SpanConverter.hpp"

// ...

// converted Resource-s must be kept in memory for the time of export
::ottrelite::otel::ResourcesMemory resourcesMemory{};

auto recordables = ::ottrelite::otel::SpanConverter::convertSpans(spans, resourcesMemory);

// create a span view for the exporter
opentelemetry::nostd::span<std::unique_ptr<opentelemetry::sdk::trace::Recordable>> spanView(
    recordables.data(), recordables.size());

// example: call the exporter's Export method
auto otelResult = otelExporterPtr->Export(spanView);
```

More hollistically, a vector of `SerializedReadableSpan` can be converted & exported on an exporter instance using

```cpp
#include "SpanConverter.hpp" // required for ResourcesMemory alias
#include "OTELExporterAdapterUtils.hpp"

// ...

// converted Resource-s must be kept in memory for the time of export
::ottrelite::otel::ResourcesMemory resourcesMemory{};

resultCallback(::ottrelite::otel::OTELExporterAdapterUtils::exportInternalSpansReprsViaOTEL(
    resourcesMemory, spans, otlpExporterPtr_));
```

#### Android

TODO: write this section

#### iOS

TODO: write this section
