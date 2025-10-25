# Class: Ottrelite

[@ottrelite/core](../modules/ottrelite_core.md).Ottrelite

## Table of contents

### Constructors

- [constructor](./ottrelite_core.Ottrelite.md#constructor)

### Properties

- [wasInstallCalled](./ottrelite_core.Ottrelite.md#wasinstallcalled)

### Methods

- [beginAsyncEvent](./ottrelite_core.Ottrelite.md#beginasyncevent)
- [beginEvent](./ottrelite_core.Ottrelite.md#beginevent)
- [counterEvent](./ottrelite_core.Ottrelite.md#counterevent)
- [endAsyncEvent](./ottrelite_core.Ottrelite.md#endasyncevent)
- [endEvent](./ottrelite_core.Ottrelite.md#endevent)
- [getJsStackTrace](./ottrelite_core.Ottrelite.md#getjsstacktrace)
- [install](./ottrelite_core.Ottrelite.md#install)
- [listInstalledBackends](./ottrelite_core.Ottrelite.md#listinstalledbackends)
- [safelyIterateBackendsList](./ottrelite_core.Ottrelite.md#safelyiteratebackendslist)

## Constructors

### constructor

**new Ottrelite**()

## Properties

### wasInstallCalled

 `Static` `Private` **wasInstallCalled**: `boolean` = `false`

## Methods

### beginAsyncEvent

`Static` **beginAsyncEvent**(`eventName`, `additionalArgs?`): `number`

Begins tracing a new event using the asynchronous API
(allowing multiple events with the same name simultaneously).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` | The name of the event to begin |
| `additionalArgs?` | `Record`\<`string`, `string`\> | Optional map of additional event metadata |

#### Returns

`number`

Token assigned to this trace entry, required to end this event

___

### beginEvent

`Static` **beginEvent**(`eventName`, `additionalArgs?`): `void`

Begins tracing a new event using the synchronous API.
Needs to have a matching invocation of endEvent() to close the event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` | The name of the event to begin |
| `additionalArgs?` | `Record`\<`string`, `string`\> | Optional map of additional event metadata |

#### Returns

`void`

___

### counterEvent

`Static` **counterEvent**(`eventName`, `value`): `void`

Registers a counter event with a given value.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` | The name of the event |
| `value` | `number` | The numerical value of the counter event |

#### Returns

`void`

___

### endAsyncEvent

`Static` **endAsyncEvent**(`eventName`, `token`, `additionalArgs?`): `void`

Ends tracing a previously started event in a given frame using the asynchronous API.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` | The name of the event to begin |
| `token` | `number` | Token returned by beginAsyncEvent |
| `additionalArgs?` | `Record`\<`string`, `string`\> | Optional map of additional event metadata |

#### Returns

`void`

___

### endEvent

`Static` **endEvent**(`additionalArgs?`): `void`

Ends tracing a previously started event in a given frame using the synchronous API.

#### Parameters

| Name | Type |
| :------ | :------ |
| `additionalArgs?` | `Record`\<`string`, `string`\> |

#### Returns

`void`

___

### getJsStackTrace

`Static` `Private` **getJsStackTrace**(): [`StackTraceEntry`](../types/ottrelite_core.StackTraceEntry.md)[]

#### Returns

[`StackTraceEntry`](../types/ottrelite_core.StackTraceEntry.md)[]

___

### install

`Static` **install**(`backends?`, `options?`): `void`

Used to register the backends you want to use in your application.
You can pass an array of backend classes to this function, and it will initialize them, making all invocations to the core API be passed to the backends **that support them**.

Not all backends support all API calls; sometimes the support level may depend on e.g. the minimum Android API level targeted by your application (which is the case for the ATrace
backend) - please consult the `README.md` files of the individual backends for detailed information.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `backends` | [`OttreliteBackend`](../types/ottrelite_core.OttreliteBackend.md)[] | `[]` | Array of backend classes to register; these classes are pure imports from the individual backend packages. |
| `options` | `OttreliteOptions` | `{}` | Optional configuration. |

#### Returns

`void`

___

### listInstalledBackends

`Static` **listInstalledBackends**(): [`OttreliteBackendInfo`](../interfaces/ottrelite_core.OttreliteBackendInfo.md)[]

Returns detailed information about the currently-installed backends.

#### Returns

[`OttreliteBackendInfo`](../interfaces/ottrelite_core.OttreliteBackendInfo.md)[]

List of details of installed backends

___

### safelyIterateBackendsList

`Static` `Private` **safelyIterateBackendsList**(`backends`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `backends` | [`OttreliteBackend`](../types/ottrelite_core.OttreliteBackend.md)[] |
| `callback` | (`backend`: [`OttreliteBackend`](../types/ottrelite_core.OttreliteBackend.md)) => `void` |

#### Returns

`void`
