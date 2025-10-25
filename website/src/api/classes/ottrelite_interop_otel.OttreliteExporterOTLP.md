# Class: OttreliteExporterOTLP

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).OttreliteExporterOTLP

## Implements

- `SpanExporter`

## Table of contents

### Constructors

- [constructor](./ottrelite_interop_otel.OttreliteExporterOTLP.md#constructor)

### Properties

- [ReactNativeOttreliteInteropOTELExporterOTLPHybridObject](./ottrelite_interop_otel.OttreliteExporterOTLP.md#reactnativeottreliteinteropotelexporterotlphybridobject)
- [config](./ottrelite_interop_otel.OttreliteExporterOTLP.md#config)

### Methods

- [export](./ottrelite_interop_otel.OttreliteExporterOTLP.md#export)
- [forceFlush](./ottrelite_interop_otel.OttreliteExporterOTLP.md#forceflush)
- [shutdown](./ottrelite_interop_otel.OttreliteExporterOTLP.md#shutdown)

## Constructors

### constructor

**new OttreliteExporterOTLP**(`config`)

Creates a new C++ OTLP exporter instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`OTLPExporterConfig`](../interfaces/ottrelite_interop_otel.OTLPExporterConfig.md) | Configuration for the OTLP exporter. |

## Properties

### ReactNativeOttreliteInteropOTELExporterOTLPHybridObject

 `Protected` **ReactNativeOttreliteInteropOTELExporterOTLPHybridObject**: `ReactNativeOttreliteInteropOTELExporterOTLP`

___

### config

 `Private` **config**: [`OTLPExporterConfig`](../interfaces/ottrelite_interop_otel.OTLPExporterConfig.md)

Configuration for the OTLP exporter.

## Methods

### export

**export**(`spans`, `resultCallback`): `void`

Export buffered ReadableSpans to the OTLP endpoint.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `spans` | `ReadableSpan`[] | The spans to export. |
| `resultCallback` | (`result`: `ExportResult`) => `void` | The callback to invoke with the result of this operation. |

#### Returns

`void`

#### Implementation of

SpanExporter.export

___

### forceFlush

`Optional` **forceFlush**(): `Promise`\<`undefined` \| `void`\>

Export all spans.

#### Returns

`Promise`\<`undefined` \| `void`\>

**`See`**

SpanExporter.forceFlush

#### Implementation of

SpanExporter.forceFlush

___

### shutdown

**shutdown**(): `Promise`\<`void`\>

Shut down this exporter.

#### Returns

`Promise`\<`void`\>

#### Implementation of

SpanExporter.shutdown
