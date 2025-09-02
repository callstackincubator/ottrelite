import type { OttreliteBackend } from '@ottrelite/core';
import type { HybridObject } from 'react-native-nitro-modules';

export interface ReactNativeOttreliteBackendPlatform
  extends HybridObject<{ ios: 'c++'; android: 'c++' }>,
    OttreliteBackend {}
