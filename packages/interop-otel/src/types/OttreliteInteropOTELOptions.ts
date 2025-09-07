import type { OTELCPPBatchLogRecordProcessorOptions } from './OTELCPPBatchLogRecordProcessorOptions';
import type { OTELCPPMetricReaderOptions } from './OTELCPPMetricReaderOptions';
import type { OTELCPPTraceBatchSpanProcessorOptions } from './OTELCPPTraceBatchSpanProcessorOptions';

export interface OttreliteInteropOTELOptions {
  /**
   * Options controlling how the C++ exporter's PeriodicExportingMetricReader handles metrics.
   *
   * @remarks
   * Only applies to the C++ API metrics; JS, Kotlin & Swift metrics' behaviour is controlled by respective language-specific SDKs.
   */
  cppMetricReaderOptions?: OTELCPPMetricReaderOptions;

  /**
   * Options for the C++ batch span trace processor that will wrap the native C++ API exporter(s).
   *
   * @remarks
   * Only applies to the C++ API traces; JS, Kotlin & Swift traces' behaviour is controlled by respective language-specific SDKs.
   */
  cppTraceBatchSpanProcessorOptions?: OTELCPPTraceBatchSpanProcessorOptions;

  cppBatchLogRecordProcessorOptions?: OTELCPPBatchLogRecordProcessorOptions;
}
