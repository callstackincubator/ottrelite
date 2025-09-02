import type { HybridObject } from 'react-native-nitro-modules';

import type { NitroOttreliteConsumerLib } from './NitroOttreliteConsumerLib';

export interface NitroOttreliteConsumerLibPlatform
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }>,
    NitroOttreliteConsumerLib {}
