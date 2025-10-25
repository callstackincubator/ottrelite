# Interface: OttreliteExporter

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).OttreliteExporter

## Table of contents

### Methods

- [exportSpans](./ottrelite_interop_otel.OttreliteExporter.md#exportspans)
- [forceFlush](./ottrelite_interop_otel.OttreliteExporter.md#forceflush)
- [initExporter](./ottrelite_interop_otel.OttreliteExporter.md#initexporter)
- [shutdown](./ottrelite_interop_otel.OttreliteExporter.md#shutdown)

## Methods

### exportSpans

**exportSpans**(`spans`, `resultCallback`): `void`

Called to export sampled [SerializedReadableSpan](../types/ottrelite_interop_otel.SerializedReadableSpan.md)s.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `spans` | [`SerializedReadableSpan`](../types/ottrelite_interop_otel.SerializedReadableSpan.md)[] | the list of sampled Spans to be exported. |
| `resultCallback` | (`result`: `ExportResult`) => `void` | - |

#### Returns

`void`

**`See`**

SpanExporter.export

note: this method matches SpanExporter.export but is named 'exportSpans'
since 'export' is a reserved keyword in objective-c, which effectively would
break compilation of the native module on iOS

___

### forceFlush

`Optional` **forceFlush**(): `Promise`\<`void`\>

Immediately export all spans

#### Returns

`Promise`\<`void`\>

**`See`**

SpanExporter.export

___

### initExporter

**initExporter**(`config`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`OTLPExporterConfig`](./ottrelite_interop_otel.OTLPExporterConfig.md) |

#### Returns

`void`

___

### shutdown

**shutdown**(): `Promise`\<`void`\>

Stops the exporter.

#### Returns

`Promise`\<`void`\>

**`See`**

SpanExporter.shutdown
