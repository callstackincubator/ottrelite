# Type alias: SerializedReadableSpan

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).SerializedReadableSpan

 **SerializedReadableSpan**: `Object`

Wrapper for

**`See`**

ReadableSpan that takes into account the fact that the some props may be undefined (wrong OTEL typings), fixing Nitro Modules converter error in runtime in such case
FIXME: some props adjusted because of a bug in Nitro Modules that fails to compile TS types which recursively reference themselves; this may be dropped when Nitro fixes this issue

#### Type declaration

| Name | Type |
| :------ | :------ |
| `attributes` | `Record`\<`string`, `AttributeValue`\> |
| `droppedAttributesCount?` | `number` |
| `droppedEventsCount?` | `number` |
| `droppedLinksCount?` | `number` |
| `duration?` | `HrTime` |
| `endTime` | `HrTime` |
| `ended?` | `boolean` |
| `events` | `NitroFixedTimedEvent`[] |
| `instrumentationScope` | `InstrumentationScope` |
| `kind` | `SpanKind` |
| `links` | `NitroFixedLink`[] |
| `name` | `string` |
| `parentSpanContext?` | [`SpanContextWithSerializedTraceState`](../interfaces/ottrelite_interop_otel.SpanContextWithSerializedTraceState.md) |
| `resource` | `NitroFixedResource` |
| `spanContext` | [`SpanContextWithSerializedTraceState`](../interfaces/ottrelite_interop_otel.SpanContextWithSerializedTraceState.md) |
| `startTime` | `HrTime` |
| `status` | `SpanStatus` |
