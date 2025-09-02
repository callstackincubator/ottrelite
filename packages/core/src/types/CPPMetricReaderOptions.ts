/**
 * Options controlling how the C++ exporter's PeriodicExportingMetricReader handles metrics.
 *
 * @remarks
 * Only applies to the C++ API metrics; JS, Kotlin & Swift metrics' behaviour is controlled by respective language-specific SDKs.
 */
export interface CPPMetricReaderOptions {
  /**
   * The interval at which to export metrics, in milliseconds.
   */
  exportIntervalMillis?: number;

  /**
   * The timeout for exporting metrics, in milliseconds.
   */
  exportTimeoutMillis?: number;
}
