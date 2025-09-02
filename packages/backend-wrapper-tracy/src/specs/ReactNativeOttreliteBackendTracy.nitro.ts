import type { OttreliteBackend } from '@ottrelite/core';
import type { HybridObject } from 'react-native-nitro-modules';

export interface ReactNativeOttreliteBackendTracy
  extends HybridObject<{ ios: 'c++'; android: 'c++' }>,
    OttreliteBackend {}
