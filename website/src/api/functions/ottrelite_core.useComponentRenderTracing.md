# Function: useComponentRenderTracing

[@ottrelite/core](../modules/ottrelite_core.md).useComponentRenderTracing

**useComponentRenderTracing**(`eventName`, `additionalEventArgs?`, `api?`): `Object`

Hook to trace component render performance. Registers immediate events if using the `'dev'` API; for `'otel'` API,
records spans starting & ending at component actual **render** after shadow tree commit, the JS rendering logic duration
is recorded as attribute `jsLogicDuration`. This is because of React's concurrent rendering model, see the README for more information on that.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `eventName` | `string` | `undefined` | The name of the event to trace. |
| `additionalEventArgs?` | `Record`\<`string`, `string`\> | `undefined` | Additional arguments to include in the trace. In case of both APIs, they will be set at event start. |
| `api` | [`TracingAPI`](../types/ottrelite_core.TracingAPI.md) | `'dev'` | The API to use for tracing (default is 'dev'). |

#### Returns

`Object`

An object containing the markJSRenderEnd function.

| Name | Type |
| :------ | :------ |
| `markJSRenderEnd` | () => `void` |
