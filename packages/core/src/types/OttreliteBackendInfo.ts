export interface OttreliteBackendInfo {
  /**
   * The name of the backend.
   */
  name: string;

  /**
   * Whether the backend supports synchronous events (beginEvent, endEvent).
   */
  supportsSyncEvents: boolean;

  /**
   * Whether the backend supports asynchronous events (beginAsyncEvent, endAsyncEvent).
   */
  supportsAsyncEvents: boolean;

  /**
   * Whether the backend supports counter events (counterEvent).
   */
  supportsCounterEvents: boolean;
}
