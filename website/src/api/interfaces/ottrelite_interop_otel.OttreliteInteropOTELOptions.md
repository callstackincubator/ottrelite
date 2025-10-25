# Interface: OttreliteInteropOTELOptions

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).OttreliteInteropOTELOptions

## Table of contents

### Properties

- [cppBatchLogRecordProcessorOptions](./ottrelite_interop_otel.OttreliteInteropOTELOptions.md#cppbatchlogrecordprocessoroptions)
- [cppMetricReaderOptions](./ottrelite_interop_otel.OttreliteInteropOTELOptions.md#cppmetricreaderoptions)
- [cppTraceBatchSpanProcessorOptions](./ottrelite_interop_otel.OttreliteInteropOTELOptions.md#cpptracebatchspanprocessoroptions)

## Properties

### cppBatchLogRecordProcessorOptions

 `Optional` **cppBatchLogRecordProcessorOptions**: [`OTELCPPBatchLogRecordProcessorOptions`](./ottrelite_interop_otel.OTELCPPBatchLogRecordProcessorOptions.md)

___

### cppMetricReaderOptions

 `Optional` **cppMetricReaderOptions**: [`OTELCPPMetricReaderOptions`](./ottrelite_interop_otel.OTELCPPMetricReaderOptions.md)

Options controlling how the C++ exporter's PeriodicExportingMetricReader handles metrics.

**`Remarks`**

Only applies to the C++ API metrics; JS, Kotlin & Swift metrics' behaviour is controlled by respective language-specific SDKs.

___

### cppTraceBatchSpanProcessorOptions

 `Optional` **cppTraceBatchSpanProcessorOptions**: [`OTELCPPTraceBatchSpanProcessorOptions`](../types/ottrelite_interop_otel.OTELCPPTraceBatchSpanProcessorOptions.md)

Options for the C++ batch span trace processor that will wrap the native C++ API exporter(s).

**`Remarks`**

Only applies to the C++ API traces; JS, Kotlin & Swift traces' behaviour is controlled by respective language-specific SDKs.
