/**
 * Options for the C++ batch span trace processor that will wrap the native C++ API exporter(s).
 *
 * @remarks
 * Only applies to the C++ API traces; JS, Kotlin & Swift traces' behaviour is controlled by respective language-specific SDKs.
 */
export type OTELCPPTraceBatchSpanProcessorOptions = {
  /**
   * The maximum number of spans to process in a batch.
   */
  maxBatchSize?: number;

  /**
   * The maximum number of spans to keep in the queue before dropping them.
   */
  maxQueueSize?: number;

  /**
   * The delay between consecutive batches.
   */
  scheduleDelayMs?: number;
};
