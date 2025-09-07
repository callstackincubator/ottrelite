import type { HybridObject } from 'react-native-nitro-modules';

import type { OttreliteExporter } from '../otel/exporter/base/OttreliteExporter';

export interface ReactNativeOttreliteInteropOTELExporterOTLP
  extends HybridObject<{ ios: 'c++'; android: 'c++' }>,
    OttreliteExporter {}
