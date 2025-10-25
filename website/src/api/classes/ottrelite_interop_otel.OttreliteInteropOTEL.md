# Class: OttreliteInteropOTEL

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).OttreliteInteropOTEL

## Table of contents

### Constructors

- [constructor](./ottrelite_interop_otel.OttreliteInteropOTEL.md#constructor)

### Properties

- [wasInstallCalled](./ottrelite_interop_otel.OttreliteInteropOTEL.md#wasinstallcalled)

### Methods

- [configure](./ottrelite_interop_otel.OttreliteInteropOTEL.md#configure)

## Constructors

### constructor

**new OttreliteInteropOTEL**()

## Properties

### wasInstallCalled

 `Static` `Private` **wasInstallCalled**: `boolean` = `false`

## Methods

### configure

`Static` **configure**(`options?`): `void`

Used to configure the OTEL interoperability layer and in turn the C++ SDK.
The OTEL JS SDK must be configured manually as per the documentation.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`OttreliteInteropOTELOptions`](../interfaces/ottrelite_interop_otel.OttreliteInteropOTELOptions.md) | Optional configuration. |

#### Returns

`void`
