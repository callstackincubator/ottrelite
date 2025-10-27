import { NitroModules } from 'react-native-nitro-modules';

import type { NitroOttreliteConsumerLibCpp } from './specs/NitroOttreliteConsumerLibCpp.nitro';
import type { NitroOttreliteConsumerLibPlatform } from './specs/NitroOttreliteConsumerLibPlatform.nitro';

export type { NitroOttreliteConsumerLib } from './specs/NitroOttreliteConsumerLib';

export class CppConsumerLib {
  static hybridObject: NitroOttreliteConsumerLibCpp;
  static generateImage(width: number, height: number): number[] {
    if (!this.hybridObject) {
      this.hybridObject =
        NitroModules.createHybridObject<NitroOttreliteConsumerLibCpp>(
          'NitroOttreliteConsumerLibCpp'
        );
    }

    return this.hybridObject.generateImage(width, height);
  }
}

export class PlatformConsumerLib {
  static hybridObject: NitroOttreliteConsumerLibPlatform;

  static generateImage(width: number, height: number): number[] {
    if (!this.hybridObject) {
      this.hybridObject =
        NitroModules.createHybridObject<NitroOttreliteConsumerLibPlatform>(
          'NitroOttreliteConsumerLibPlatform'
        );
    }

    return this.hybridObject.generateImage(width, height);
  }
}
