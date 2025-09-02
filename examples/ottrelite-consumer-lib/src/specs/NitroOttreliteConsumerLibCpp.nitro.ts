import type { HybridObject } from 'react-native-nitro-modules';

import type { NitroOttreliteConsumerLib } from './NitroOttreliteConsumerLib';

export interface NitroOttreliteConsumerLibCpp
  extends HybridObject<{ ios: 'c++'; android: 'c++' }>,
    NitroOttreliteConsumerLib {}
