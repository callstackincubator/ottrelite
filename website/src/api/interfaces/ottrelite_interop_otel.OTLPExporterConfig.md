# Interface: OTLPExporterConfig

[@ottrelite/interop-otel](../modules/ottrelite_interop_otel.md).OTLPExporterConfig

Configuration options for the OTLP exporter.

## Table of contents

### Properties

- [caCertString](./ottrelite_interop_otel.OTLPExporterConfig.md#cacertstring)
- [clientCertString](./ottrelite_interop_otel.OTLPExporterConfig.md#clientcertstring)
- [compression](./ottrelite_interop_otel.OTLPExporterConfig.md#compression)
- [endpoint](./ottrelite_interop_otel.OTLPExporterConfig.md#endpoint)
- [headers](./ottrelite_interop_otel.OTLPExporterConfig.md#headers)
- [protocol](./ottrelite_interop_otel.OTLPExporterConfig.md#protocol)
- [retryPolicyOptions](./ottrelite_interop_otel.OTLPExporterConfig.md#retrypolicyoptions)
- [skipInsecureSSLVerification](./ottrelite_interop_otel.OTLPExporterConfig.md#skipinsecuresslverification)
- [timeoutMillis](./ottrelite_interop_otel.OTLPExporterConfig.md#timeoutmillis)

## Properties

### caCertString

 `Optional` **caCertString**: `string`

Custom CA SSL certificate for the exporter.

___

### clientCertString

 `Optional` **clientCertString**: `string`

Custom client SSL certificate for the exporter.

___

### compression

 `Optional` **compression**: [`OTLPExporterCompression`](../types/ottrelite_interop_otel.OTLPExporterCompression.md)

Compression used by the exporter.

___

### endpoint

 **endpoint**: `string`

The endpoint URL for the OTLP exporter. Must not end with the suffix (e.g. /traces or /metrics) - it will be added automatically.

**`Example`**

```ts
"http://localhost:4318/v1/"
```

___

### headers

 `Optional` **headers**: `Record`\<`string`, `string`\>

Headers for the HTTP exporter.

**`Remarks`**

This field is **only applicable** when the protocol is set to `"http/protobuf"`.

___

### protocol

 `Optional` **protocol**: [`OTLPExporterProtocol`](../types/ottrelite_interop_otel.OTLPExporterProtocol.md)

The protocol used by the OTLP exporter.

___

### retryPolicyOptions

 `Optional` **retryPolicyOptions**: [`RetryPolicyOptions`](../types/ottrelite_interop_otel.RetryPolicyOptions.md)

Options controlling how the exporter behaves in case of upload failures.

___

### skipInsecureSSLVerification

 `Optional` **skipInsecureSSLVerification**: `boolean`

Set to `true` to disable SSL.

___

### timeoutMillis

 `Optional` **timeoutMillis**: `number`

Export timeout in milliseconds.
