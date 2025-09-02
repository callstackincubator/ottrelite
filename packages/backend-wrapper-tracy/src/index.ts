import { NitroModules } from 'react-native-nitro-modules';

import type { ReactNativeOttreliteBackendTracy } from './specs/ReactNativeOttreliteBackendTracy.nitro';

const ReactNativeOttreliteBackendTracyHybridObject =
  NitroModules.createHybridObject<ReactNativeOttreliteBackendTracy>(
    'ReactNativeOttreliteBackendTracy'
  );

export class OttreliteBackendTracy {
  static install() {
    ReactNativeOttreliteBackendTracyHybridObject.install();
  }
}
