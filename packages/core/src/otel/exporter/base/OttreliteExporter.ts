import type { ExportResult } from '@opentelemetry/core';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in docstrings
import type { SpanExporter } from '@opentelemetry/sdk-trace-base';

import type {
  OTLPExporterConfig,
  SerializedReadableSpan,
} from '../../../types';

export interface OttreliteExporter {
  initExporter(config: OTLPExporterConfig): void;

  /**
   * Called to export sampled {@link SerializedReadableSpan}s.
   * @param spans the list of sampled Spans to be exported.
   * @see {@link SpanExporter.export}
   *
   * note: this method matches {@link SpanExporter.export} but is named 'exportSpans'
   * since 'export' is a reserved keyword in objective-c, which effectively would
   * break compilation of the native module on iOS
   */
  exportSpans(
    spans: SerializedReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void;

  /**
   * Stops the exporter.
   * @see {@link SpanExporter.shutdown}
   */
  shutdown(): Promise<void>;

  /**
   * Immediately export all spans
   * @see {@link SpanExporter.export}
   */
  forceFlush?(): Promise<void>;
}
