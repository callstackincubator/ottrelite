import { NitroModules } from 'react-native-nitro-modules';

import type { ReactNativeOttrelite as NativeOttrelite } from './specs/ReactNativeOttrelite.nitro';

/** @internal */
export const ReactNativeOttreliteHybridObject =
  NitroModules.createHybridObject<NativeOttrelite>('ReactNativeOttrelite');
