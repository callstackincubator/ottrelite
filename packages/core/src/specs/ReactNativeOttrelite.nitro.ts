import type { HybridObject } from 'react-native-nitro-modules';

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
}
