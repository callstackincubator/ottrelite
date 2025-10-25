# Interface: OTELCPPBatchLogRecordProcessorOptions

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).OTELCPPBatchLogRecordProcessorOptions

Options controlling how the C++ exporter's BatchLogRecordProcessor handles logs.

**`Remarks`**

Only applies to the C++ API logs; JS, Kotlin & Swift logs' behaviour is controlled by respective language-specific SDKs.

## Table of contents

### Properties

- [exportIntervalMillis](./ottrelite_interop_otel.OTELCPPBatchLogRecordProcessorOptions.md#exportintervalmillis)
- [maxBatchSize](./ottrelite_interop_otel.OTELCPPBatchLogRecordProcessorOptions.md#maxbatchsize)
- [maxQueueSize](./ottrelite_interop_otel.OTELCPPBatchLogRecordProcessorOptions.md#maxqueuesize)

## Properties

### exportIntervalMillis

 `Optional` **exportIntervalMillis**: `number`

The interval at which to export logs, in milliseconds.

___

### maxBatchSize

 `Optional` **maxBatchSize**: `number`

The maximum number of logs to export in a single batch.

___

### maxQueueSize

 `Optional` **maxQueueSize**: `number`

The maximum number of logs to keep in the queue; excessive will be dropped.
