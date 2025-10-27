/** @module @ottrelite/backend-wrapper-tracy */
import { NitroModules } from 'react-native-nitro-modules';

import type { ReactNativeOttreliteBackendTracy } from './specs/ReactNativeOttreliteBackendTracy.nitro';

/**
 * Ottrelite backend being a wrapper for the Tracy client providing integration with the open-source profiler [Tracy](https://github.com/wolfpld/tracy/).
 */
export class OttreliteBackendTracy {
  static hybridObject: ReactNativeOttreliteBackendTracy;

  static install() {
    if (!this.hybridObject) {
      this.hybridObject =
        NitroModules.createHybridObject<ReactNativeOttreliteBackendTracy>(
          'ReactNativeOttreliteBackendTracy'
        );
    }

    this.hybridObject.install();
  }
}
