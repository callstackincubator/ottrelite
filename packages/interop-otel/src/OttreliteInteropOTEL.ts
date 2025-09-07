import { ReactNativeOttreliteInteropOTELHybridObject } from './ReactNativeOttreliteInteropOTELHybridObject';
import type { OttreliteInteropOTELOptions } from './types/OttreliteInteropOTELOptions';

export class OttreliteInteropOTEL {
  private static wasInstallCalled: boolean = false;

  /**
   * Used to configure the OTEL interoperability layer and in turn the C++ SDK.
   * The OTEL JS SDK must be configured manually as per the documentation.
   *
   * @param options Optional configuration.
   */
  static configure(options: OttreliteInteropOTELOptions = {}) {
    if (this.wasInstallCalled) {
      throw new Error(
        "OttreliteInteropOTEL.install() has already been called. This method can only be called once in an app's lifetime."
      );
    }

    ReactNativeOttreliteInteropOTELHybridObject.configure(options);

    this.wasInstallCalled = true;
  }
}
