import type { HybridObject } from 'react-native-nitro-modules';

import type { OttreliteExporter } from '../otel';

export interface ReactNativeOttreliteExporterOTLP
  extends HybridObject<{ ios: 'c++'; android: 'c++' }>,
    OttreliteExporter {}
