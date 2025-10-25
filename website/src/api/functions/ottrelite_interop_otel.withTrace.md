# Function: withTrace

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).withTrace

**withTrace**\<`ComponentProps`\>(`WrappedComponent`, `traceName`): `FC`\<`ComponentProps` & [`WithTraceProps`](../types/ottrelite_interop_otel.WithTraceProps.md)\>

Higher-order component that supplies the wrapped component with
a wrapped `useTracer` hook that is already scoped to the proper name of the component.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ComponentProps` | extends `IntrinsicAttributes` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `WrappedComponent` | `ComponentType`\<`ComponentProps` & `Partial`\<[`WithTraceProps`](../types/ottrelite_interop_otel.WithTraceProps.md)\>\> | The component to wrap with tracing |
| `traceName` | `string` | Optional name name of the trace; if not provided, `displayName` of the component will be used. |

#### Returns

`FC`\<`ComponentProps` & [`WithTraceProps`](../types/ottrelite_interop_otel.WithTraceProps.md)\>

A higher-order component that wraps the given component with tracing

**`See`**

[useTracer](./ottrelite_interop_otel.useTracer.md) for the hook that is used internally.
