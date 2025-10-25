# Class: OttreliteMeterProvider

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).OttreliteMeterProvider

IMeterProvider implementation that pipes metrics data to Ottrelite's Development API.

## Hierarchy

- `MeterProvider`

  ↳ **`OttreliteMeterProvider`**

## Implements

- `MeterProvider`

## Table of contents

### Constructors

- [constructor](./ottrelite_interop_otel.OttreliteMeterProvider.md#constructor)

### Properties

- [\_meterStates](./ottrelite_interop_otel.OttreliteMeterProvider.md#_meterstates)

### Methods

- [forceFlush](./ottrelite_interop_otel.OttreliteMeterProvider.md#forceflush)
- [getMeter](./ottrelite_interop_otel.OttreliteMeterProvider.md#getmeter)
- [hookIntoObservableInstrument](./ottrelite_interop_otel.OttreliteMeterProvider.md#hookintoobservableinstrument)
- [register](./ottrelite_interop_otel.OttreliteMeterProvider.md#register)
- [shutdown](./ottrelite_interop_otel.OttreliteMeterProvider.md#shutdown)

## Constructors

### constructor

**new OttreliteMeterProvider**(`options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `MeterProviderOptions` |

#### Inherited from

MeterProvider.constructor

## Properties

### \_meterStates

 `Private` **\_meterStates**: `Map`\<`string`, `Meter`\>

## Methods

### forceFlush

**forceFlush**(`options?`): `Promise`\<`void`\>

Notifies all registered MetricReaders to flush any buffered data.

Returns a promise which is resolved when all flushes are complete.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `CommonReaderOptions` |

#### Returns

`Promise`\<`void`\>

#### Inherited from

MeterProvider.forceFlush

___

### getMeter

**getMeter**(`meterName`, `meterVersion?`, `meterOptions?`): `Meter`

#### Parameters

| Name | Type |
| :------ | :------ |
| `meterName` | `string` |
| `meterVersion?` | `string` |
| `meterOptions?` | `MeterOptions` |

#### Returns

`Meter`

#### Implementation of

IMeterProvider.getMeter

#### Overrides

MeterProvider.getMeter

___

### hookIntoObservableInstrument

`Private` **hookIntoObservableInstrument**(`observableInstrument`, `«destructured»`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `observableInstrument` | `ObservableCounter`\<`Attributes`\> \| `ObservableGauge`\<`Attributes`\> \| `ObservableUpDownCounter`\<`Attributes`\> |
| `«destructured»` | `Object` |
| › `instrumentCategory` | `string` |
| › `meterId` | `string` |
| › `name` | `string` |

#### Returns

`void`

___

### register

**register**(): `void`

#### Returns

`void`

___

### shutdown

**shutdown**(`options?`): `Promise`\<`void`\>

Shut down the MeterProvider and all registered
MetricReaders.

Returns a promise which is resolved when all flushes are complete.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `CommonReaderOptions` |

#### Returns

`Promise`\<`void`\>

#### Inherited from

MeterProvider.shutdown
