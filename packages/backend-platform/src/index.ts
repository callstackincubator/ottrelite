import { NitroModules } from 'react-native-nitro-modules';

import type { ReactNativeOttreliteBackendPlatform } from './specs/ReactNativeOttreliteBackendPlatform.nitro';

const ReactNativeOttreliteBackendPlatformHybridObject =
  NitroModules.createHybridObject<ReactNativeOttreliteBackendPlatform>(
    'ReactNativeOttreliteBackendPlatform'
  );

export class OttreliteBackendPlatform {
  static install() {
    ReactNativeOttreliteBackendPlatformHybridObject.install();
  }
}
