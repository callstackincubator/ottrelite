/** @module @ottrelite/backend-wrapper-tracy */
import { NitroModules } from 'react-native-nitro-modules';

import type { ReactNativeOttreliteBackendTracy } from './specs/ReactNativeOttreliteBackendTracy.nitro';

const ReactNativeOttreliteBackendTracyHybridObject =
  NitroModules.createHybridObject<ReactNativeOttreliteBackendTracy>(
    'ReactNativeOttreliteBackendTracy'
  );

/**
 * Ottrelite backend being a wrapper for the Tracy client providing integration with the open-source profiler [Tracy](https://github.com/wolfpld/tracy/).
 */
export class OttreliteBackendTracy {
  static install() {
    ReactNativeOttreliteBackendTracyHybridObject.install();
  }
}
