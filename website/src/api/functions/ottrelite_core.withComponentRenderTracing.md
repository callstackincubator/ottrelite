# Function: withComponentRenderTracing

[@ottrelite/core](../modules/ottrelite_core.md).withComponentRenderTracing

**withComponentRenderTracing**\<`P`\>(`eventName`, `api?`, `WrappedComponent`): `NamedExoticComponent`\<`P`\>

High-Order Component that wraps @see[useComponentRenderTracing](./ottrelite_core.useComponentRenderTracing.md) hook. For details, please consult the hook's documentation.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends `IntrinsicAttributes` |

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `eventName` | `string` | `undefined` | The name of the event to trace. |
| `api` | [`TracingAPI`](../types/ottrelite_core.TracingAPI.md) | `'dev'` | The API to use for tracing (default is 'dev'). |
| `WrappedComponent` | `ComponentType`\<`P`\> | `undefined` | - |

#### Returns

`NamedExoticComponent`\<`P`\>

An object containing the markJSRenderEnd function.
