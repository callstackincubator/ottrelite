# Class: DevSpanProcessorInterceptor

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).DevSpanProcessorInterceptor

OTEL SpanProcessor implementation that intercepts spans live and passes them to Ottrelite's Development API.

This is useful for **development and debugging** purposes, allowing you to live-trace using compatible backends
and see the events in real-time without needing to export them to a backend, nor (usually) have an infrastructure.

Example backends that are meant to be used with this processor are: `@ottrelite/backend-platform`, `@ottrelite/backend-wrapper-tracy`.

This class uses the asynchronous Ottrelite API to functionally match OTEL's async-capable tracing API.

## Implements

- `SpanProcessor`

## Table of contents

### Constructors

- [constructor](./ottrelite_interop_otel.DevSpanProcessorInterceptor.md#constructor)

### Properties

- [spanToInternalTokenMapping](./ottrelite_interop_otel.DevSpanProcessorInterceptor.md#spantointernaltokenmapping)

### Methods

- [forceFlush](./ottrelite_interop_otel.DevSpanProcessorInterceptor.md#forceflush)
- [onEnd](./ottrelite_interop_otel.DevSpanProcessorInterceptor.md#onend)
- [onStart](./ottrelite_interop_otel.DevSpanProcessorInterceptor.md#onstart)
- [shutdown](./ottrelite_interop_otel.DevSpanProcessorInterceptor.md#shutdown)

## Constructors

### constructor

**new DevSpanProcessorInterceptor**()

## Properties

### spanToInternalTokenMapping

 `Protected` **spanToInternalTokenMapping**: `WeakMap`\<`Span`, `number`\>

Maps OTEL Span objects to internal Ottrelite API tokens in the async tracing API.
This is needed to match OTEL's async-aware API.

## Methods

### forceFlush

**forceFlush**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Implementation of

SpanProcessor.forceFlush

___

### onEnd

**onEnd**(`span`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `span` | `Span` |

#### Returns

`void`

#### Implementation of

SpanProcessor.onEnd

___

### onStart

**onStart**(`span`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `span` | `Span` |

#### Returns

`void`

#### Implementation of

SpanProcessor.onStart

___

### shutdown

**shutdown**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Implementation of

SpanProcessor.shutdown
