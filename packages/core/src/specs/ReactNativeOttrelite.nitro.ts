import type { HybridObject } from 'react-native-nitro-modules';

import type {
  CPPBatchLogRecordProcessorOptions,
  CPPMetricReaderOptions,
  CPPTraceBatchSpanProcessorOptions,
} from '../types';
import type { OttreliteBackendInfo } from '../types/OttreliteBackendInfo';
import type { StackTraceEntry } from '../types/StackTraceEntry';

export interface OttreliteOptions {
  /**
   * If set to `true`, the `Systrace` RN API, which is no-op by default, will be replaced
   * and will call the `Ottrelite` API methods under the hood.
   *
   * @see https://reactnative.dev/docs/systrace
   */
  reviveSystraceAPI?: boolean;

  /**
   * Options controlling how the C++ exporter's PeriodicExportingMetricReader handles metrics.
   *
   * @remarks
   * Only applies to the C++ API metrics; JS, Kotlin & Swift metrics' behaviour is controlled by respective language-specific SDKs.
   */
  cppMetricReaderOptions?: CPPMetricReaderOptions;

  /**
   * Options for the C++ batch span trace processor that will wrap the native C++ API exporter(s).
   *
   * @remarks
   * Only applies to the C++ API traces; JS, Kotlin & Swift traces' behaviour is controlled by respective language-specific SDKs.
   */
  cppTraceBatchSpanProcessorOptions?: CPPTraceBatchSpanProcessorOptions;

  cppBatchLogRecordProcessorOptions?: CPPBatchLogRecordProcessorOptions;

  // TODO: add a enable boolean flag, on by default
}

export interface ReactNativeOttrelite
  extends HybridObject<{ ios: 'c++'; android: 'c++' }> {
  configure(options: OttreliteOptions): void;

  beginEvent(
    eventName: string,
    nonCppStackTrace?: StackTraceEntry[],
    additionalArgs?: Record<string, string>
  ): void;

  endEvent(additionalArgs?: Record<string, string>): void;

  beginAsyncEvent(
    eventName: string,
    nonCppStackTrace?: StackTraceEntry[],
    additionalArgs?: Record<string, string>
  ): number;

  endAsyncEvent(
    eventName: string,
    token: number,
    additionalArgs?: Record<string, string>
  ): void;

  counterEvent(eventName: string, value: number): void;

  listInstalledBackends(): OttreliteBackendInfo[];

  installGlobalOTELCPPTracerProvider(): void;
  installGlobalOTELCPPMeterProvider(): void;
  installGlobalOTELCPPLoggerProvider(): void; // TODO: implement a JS counterpart that would call this
}
