import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';

import type { SerializedReadableSpan } from '../../../types';

import { serializeSpanContext } from './spanContextSerializer';

/**
 * Converts OTEL JS spans to Ottrelite spans that can be passed to the C++ module
 * FIXME: this is because of a bug in Nitro Modules that fails to compile TS types which recursively reference themselves; this may be dropped when Nitro fixes this issue
 * @param spans OTEL JS spans
 * @returns Ottrelite-native spans ready to be passed to the C++ module
 */
export function convertSpans(spans: ReadableSpan[]): SerializedReadableSpan[] {
  return spans.map(
    (span) =>
      ({
        ...span,
        spanContext: serializeSpanContext(span.spanContext()),
        parentSpanContext: serializeSpanContext(span.parentSpanContext),
        links: span.links.map((link) => ({
          ...link,
          context: serializeSpanContext(link.context),
        })),
        resource: span.resource as any, // FIXME: this does not need any modifications, there's just a change in a method's type so as for Nitro to not error on this (see other recursive type error comments)
      }) as SerializedReadableSpan
  );
}
