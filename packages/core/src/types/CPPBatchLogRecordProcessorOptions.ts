/**
 * Options controlling how the C++ exporter's BatchLogRecordProcessor handles logs.
 *
 * @remarks
 * Only applies to the C++ API logs; JS, Kotlin & Swift logs' behaviour is controlled by respective language-specific SDKs.
 */
export interface CPPBatchLogRecordProcessorOptions {
  /**
   * The maximum number of logs to export in a single batch.
   */
  maxBatchSize?: number;

  /**
   * The maximum number of logs to keep in the queue; excessive will be dropped.
   */
  maxQueueSize?: number;

  /**
   * The interval at which to export logs, in milliseconds.
   */
  exportIntervalMillis?: number;
}
