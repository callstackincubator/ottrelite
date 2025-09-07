import type { ExportResult } from '@opentelemetry/core';
import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { NitroModules } from 'react-native-nitro-modules';

import type { ReactNativeOttreliteInteropOTELExporterOTLP } from '../../../specs/ReactNativeOttreliteInteropOTELExporterOTLP.nitro';
import type { OTLPExporterConfig } from '../../../types';
import { convertSpans } from '../utils';

export class OttreliteExporterOTLP implements SpanExporter {
  protected ReactNativeOttreliteInteropOTELExporterOTLPHybridObject: ReactNativeOttreliteInteropOTELExporterOTLP;

  /**
   * Creates a new C++ OTLP exporter instance.
   * @param config Configuration for the OTLP exporter.
   */
  constructor(private config: OTLPExporterConfig) {
    this.ReactNativeOttreliteInteropOTELExporterOTLPHybridObject =
      NitroModules.createHybridObject<ReactNativeOttreliteInteropOTELExporterOTLP>(
        'ReactNativeOttreliteInteropOTELExporterOTLP'
      );

    this.ReactNativeOttreliteInteropOTELExporterOTLPHybridObject.initExporter(
      this.config
    );
  }

  /**
   * Export buffered {@link ReadableSpan}s to the OTLP endpoint.
   * @param spans The spans to export.
   * @param resultCallback The callback to invoke with the result of this operation.
   */
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ) {
    return this.ReactNativeOttreliteInteropOTELExporterOTLPHybridObject.exportSpans(
      convertSpans(spans),
      resultCallback
    );
  }

  /**
   * Export all spans.
   * @see {@link SpanExporter.forceFlush}
   */
  async forceFlush?() {
    return await this.ReactNativeOttreliteInteropOTELExporterOTLPHybridObject.forceFlush?.();
  }

  /**
   * Shut down this exporter.
   */
  async shutdown() {
    return await this.ReactNativeOttreliteInteropOTELExporterOTLPHybridObject.shutdown();
  }
}
