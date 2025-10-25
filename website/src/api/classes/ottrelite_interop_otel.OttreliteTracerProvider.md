# Class: OttreliteTracerProvider

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).OttreliteTracerProvider

TracerProvider implementation that pipes trace data to Ottrelite's Development API.

## Hierarchy

- `BasicTracerProvider`

  ↳ **`OttreliteTracerProvider`**

## Table of contents

### Constructors

- [constructor](./ottrelite_interop_otel.OttreliteTracerProvider.md#constructor)

### Methods

- [forceFlush](./ottrelite_interop_otel.OttreliteTracerProvider.md#forceflush)
- [getTracer](./ottrelite_interop_otel.OttreliteTracerProvider.md#gettracer)
- [register](./ottrelite_interop_otel.OttreliteTracerProvider.md#register)
- [shutdown](./ottrelite_interop_otel.OttreliteTracerProvider.md#shutdown)

## Constructors

### constructor

**new OttreliteTracerProvider**(`config?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config?` | `TracerConfig` |

#### Overrides

BasicTracerProvider.constructor

## Methods

### forceFlush

**forceFlush**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Inherited from

BasicTracerProvider.forceFlush

___

### getTracer

**getTracer**(`name`, `version?`, `options?`): `Tracer`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `version?` | `string` |
| `options?` | `Object` |
| `options.schemaUrl?` | `string` |

#### Returns

`Tracer`

#### Inherited from

BasicTracerProvider.getTracer

___

### register

**register**(`config?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `SDKRegistrationConfig` |

#### Returns

`void`

___

### shutdown

**shutdown**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Inherited from

BasicTracerProvider.shutdown
