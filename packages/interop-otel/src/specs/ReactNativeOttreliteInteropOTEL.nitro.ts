import type { HybridObject } from 'react-native-nitro-modules';

import type { OttreliteInteropOTELOptions } from '../types/OttreliteInteropOTELOptions';

export interface ReactNativeOttreliteInteropOTEL
  extends HybridObject<{ ios: 'c++'; android: 'c++' }> {
  configure(options: OttreliteInteropOTELOptions): void;

  installGlobalOTELCPPTracerProvider(): void;
  installGlobalOTELCPPMeterProvider(): void;
  installGlobalOTELCPPLoggerProvider(): void; // TODO: implement a JS counterpart that would call this
}
