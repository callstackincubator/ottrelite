# Type alias: OTELCPPTraceBatchSpanProcessorOptions

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).OTELCPPTraceBatchSpanProcessorOptions

 **OTELCPPTraceBatchSpanProcessorOptions**: `Object`

Options for the C++ batch span trace processor that will wrap the native C++ API exporter(s).

**`Remarks`**

Only applies to the C++ API traces; JS, Kotlin & Swift traces' behaviour is controlled by respective language-specific SDKs.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `maxBatchSize?` | `number` | The maximum number of spans to process in a batch. |
| `maxQueueSize?` | `number` | The maximum number of spans to keep in the queue before dropping them. |
| `scheduleDelayMs?` | `number` | The delay between consecutive batches. |
