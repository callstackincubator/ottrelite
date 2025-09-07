/** @module @ottrelite/backend-platform */
import { NitroModules } from 'react-native-nitro-modules';

import type { ReactNativeOttreliteBackendPlatform } from './specs/ReactNativeOttreliteBackendPlatform.nitro';

const ReactNativeOttreliteBackendPlatformHybridObject =
  NitroModules.createHybridObject<ReactNativeOttreliteBackendPlatform>(
    'ReactNativeOttreliteBackendPlatform'
  );

/**
 * Ottrelite backend providing integration with the OS-specific tracing API available at runtime.
 * On Android, it uses ATrace, on iOS, it uses OSSignposter.
 */
export class OttreliteBackendPlatform {
  static install() {
    ReactNativeOttreliteBackendPlatformHybridObject.install();
  }
}
