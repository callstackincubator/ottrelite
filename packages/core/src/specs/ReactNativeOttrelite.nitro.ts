import type { ExportResult } from '@opentelemetry/core';
import type { HybridObject } from 'react-native-nitro-modules';

import type { OttreliteBackendInfo } from '../types/OttreliteBackendInfo';
import type { StackTraceEntry } from '../types/StackTraceEntry';
import type { SerializedReadableSpan } from '../types/nitro/OTELSerializedReadableSpan';

export interface ReactNativeOttrelite
  extends HybridObject<{ ios: 'c++'; android: 'c++' }> {
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

  reviveSystraceAPI(): void;

  exportSpans(spans: SerializedReadableSpan[]): Promise<ExportResult>;
}

// export interface ReactNativeOttreliteKotlinSwift
//   extends HybridObject<{
//       android: 'kotlin';
//       ios: 'swift';
//     }>,
//     ReactNativeOttrelite {}
