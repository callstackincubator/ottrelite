/**
 * Protocols supported by the OTLP exporter.
 */
export type OTLPExporterProtocol = 'grpc' | 'http/protobuf';

/**
 * Compression types supported by the OTLP exporter.
 */
export type OTLPExporterCompression = 'gzip' | 'none';

/**
 * Exporter retry policy options.
 */
export type RetryPolicyOptions = {
  /**
   * The maximum number of retry attempts.
   */
  maxAttempts?: number;

  /**
   * The initial backoff delay between attempts, which is a random value between 0 and this value.
   */
  initialBackoffSeconds?: number;

  /**
   * The maximum delay between retry attempts.
   */
  maxBackoffSeconds?: number;

  /**
   * Multiplier used to increase backoff after each retry attempt.
   */
  backoffMultiplier?: number;
};

/**
 * Configuration options for the OTLP exporter.
 */
export interface OTLPExporterConfig {
  /**
   * The endpoint URL for the OTLP exporter. Must not end with the suffix (e.g. /traces or /metrics) - it will be added automatically.
   * @example
   * "http://localhost:4318/v1/"
   */
  endpoint: string;

  /**
   * The protocol used by the OTLP exporter.
   */
  protocol?: OTLPExporterProtocol;

  /**
   * Headers for the HTTP exporter.
   *
   * @remarks
   * This field is **only applicable** when the protocol is set to `"http/protobuf"`.
   */
  headers?: Record<string, string>;

  // TODO: populate GRPC OTLP exporter options

  /**
   * Compression used by the exporter.
   */
  compression?: OTLPExporterCompression;

  /**
   * Export timeout in milliseconds.
   */
  timeoutMillis?: number;

  /**
   * Set to `true` to disable SSL.
   */
  skipInsecureSSLVerification?: boolean;

  /**
   * Custom client SSL certificate for the exporter.
   */
  clientCertString?: string;

  /**
   * Custom CA SSL certificate for the exporter.
   */
  caCertString?: string;

  /**
   * Options controlling how the exporter behaves in case of upload failures.
   */
  retryPolicyOptions?: RetryPolicyOptions;
}
