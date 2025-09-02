import { NitroModules } from 'react-native-nitro-modules';

import type { NitroOttreliteConsumerLibCpp } from './specs/NitroOttreliteConsumerLibCpp.nitro';
import type { NitroOttreliteConsumerLibPlatform } from './specs/NitroOttreliteConsumerLibPlatform.nitro';

export type { NitroOttreliteConsumerLib } from './specs/NitroOttreliteConsumerLib';

const NitroOttreliteConsumerLibHybridObject =
  NitroModules.createHybridObject<NitroOttreliteConsumerLibCpp>(
    'NitroOttreliteConsumerLibCpp'
  );

const NitroOttreliteConsumerLibPlatformHybridObject =
  NitroModules.createHybridObject<NitroOttreliteConsumerLibPlatform>(
    'NitroOttreliteConsumerLibPlatform'
  );

export class CppConsumerLib {
  static generateImage(width: number, height: number): number[] {
    return NitroOttreliteConsumerLibHybridObject.generateImage(width, height);
  }
}

export class PlatformConsumerLib {
  static generateImage(width: number, height: number): number[] {
    return NitroOttreliteConsumerLibPlatformHybridObject.generateImage(
      width,
      height
    );
  }
}
