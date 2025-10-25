# Function: useTracer

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).useTracer

**useTracer**(`name`, `version?`): `Tracer`

Hook supplying a tracer instance with the given name and (optionally) version.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | Name of the tracer unit; must be unique within the application. |
| `version?` | `string` | Optional version of the tracer unit. |

#### Returns

`Tracer`

The tracer instance.
