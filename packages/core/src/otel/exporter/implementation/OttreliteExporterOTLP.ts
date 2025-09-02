import type { ExportResult } from '@opentelemetry/core';
import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { NitroModules } from 'react-native-nitro-modules';

import type { ReactNativeOttreliteExporterOTLP } from '../../../specs/ReactNativeOttreliteExporterOTLP.nitro';
import type { OTLPExporterConfig } from '../../../types';
import { convertSpans } from '../utils';

export class OttreliteExporterOTLP implements SpanExporter {
  protected ReactNativeOttreliteExporterOTLPHybridObject: ReactNativeOttreliteExporterOTLP;

  constructor(private config: OTLPExporterConfig) {
    this.ReactNativeOttreliteExporterOTLPHybridObject =
      NitroModules.createHybridObject<ReactNativeOttreliteExporterOTLP>(
        'ReactNativeOttreliteExporterOTLP'
      );

    this.ReactNativeOttreliteExporterOTLPHybridObject.initExporter(this.config);
  }

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ) {
    return this.ReactNativeOttreliteExporterOTLPHybridObject.exportSpans(
      convertSpans(spans),
      resultCallback
    );
  }

  async forceFlush?() {
    return await this.ReactNativeOttreliteExporterOTLPHybridObject.forceFlush?.();
  }

  async shutdown() {
    return await this.ReactNativeOttreliteExporterOTLPHybridObject.shutdown();
  }
}
