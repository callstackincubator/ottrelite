import type { SpanContext } from '@opentelemetry/api';

import type { SpanContextWithSerializedTraceState } from '../../../types';

/**
 * Converts OTEL JS SpanContext to Ottrelite spans that can be passed to the C++ module by serializing the trace state since it suffers from the problem described below
 * FIXME: this is because of a bug in Nitro Modules that fails to compile TS types which recursively reference themselves; this may be dropped when Nitro fixes this issue
 * @param spanContext the OTEL JS SpanContext object
 * @returns the Ottrelite-compatible object with serialized traceState
 */
export function serializeSpanContext(
  spanContext?: SpanContext
): SpanContextWithSerializedTraceState | undefined {
  if (!spanContext) {
    return undefined;
  }

  return {
    ...spanContext,
    traceState: spanContext.traceState?.serialize(),
  };
}
