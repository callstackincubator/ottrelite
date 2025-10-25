# Interface: OTELCPPMetricReaderOptions

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).OTELCPPMetricReaderOptions

Options controlling how the C++ exporter's PeriodicExportingMetricReader handles metrics.

**`Remarks`**

Only applies to the C++ API metrics; JS, Kotlin & Swift metrics' behaviour is controlled by respective language-specific SDKs.

## Table of contents

### Properties

- [exportIntervalMillis](./ottrelite_interop_otel.OTELCPPMetricReaderOptions.md#exportintervalmillis)
- [exportTimeoutMillis](./ottrelite_interop_otel.OTELCPPMetricReaderOptions.md#exporttimeoutmillis)

## Properties

### exportIntervalMillis

 `Optional` **exportIntervalMillis**: `number`

The interval at which to export metrics, in milliseconds.

___

### exportTimeoutMillis

 `Optional` **exportTimeoutMillis**: `number`

The timeout for exporting metrics, in milliseconds.
