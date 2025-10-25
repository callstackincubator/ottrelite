# Type alias: RetryPolicyOptions

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).RetryPolicyOptions

 **RetryPolicyOptions**: `Object`

Exporter retry policy options.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `backoffMultiplier?` | `number` | Multiplier used to increase backoff after each retry attempt. |
| `initialBackoffSeconds?` | `number` | The initial backoff delay between attempts, which is a random value between 0 and this value. |
| `maxAttempts?` | `number` | The maximum number of retry attempts. |
| `maxBackoffSeconds?` | `number` | The maximum delay between retry attempts. |
