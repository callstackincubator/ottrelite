# Function: vanillaTracerFactory

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).vanillaTracerFactory

**vanillaTracerFactory**(`name`, `version?`): `Tracer`

Returns a Tracer instance with the given name & (optionally) version.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | Name of the tracer unit; must be unique within the application. |
| `version?` | `string` | Optional version of the tracer unit. |

#### Returns

`Tracer`

The tracer instance.
