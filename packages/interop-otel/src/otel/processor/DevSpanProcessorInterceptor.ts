import type { Span, SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Ottrelite } from '@ottrelite/core';

import { stringifyAttributes } from '../utils/stringifyAttributes';

/**
 * OTEL SpanProcessor implementation that intercepts spans live and passes them to Ottrelite's Development API.
 *
 * This is useful for **development and debugging** purposes, allowing you to live-trace using compatible backends
 * and see the events in real-time without needing to export them to a backend, nor (usually) have an infrastructure.
 *
 * Example backends that are meant to be used with this processor are: `@ottrelite/backend-platform`, `@ottrelite/backend-wrapper-tracy`.
 *
 * This class uses the asynchronous Ottrelite API to functionally match OTEL's async-capable tracing API.
 */
export class DevSpanProcessorInterceptor implements SpanProcessor {
  /**
   * Maps OTEL Span objects to internal Ottrelite API tokens in the async tracing API.
   * This is needed to match OTEL's async-aware API.
   */
  protected spanToInternalTokenMapping = new WeakMap<Span, number>();

  onStart(span: Span): void {
    // so as not to duplicate attributes, since they may change before end of the span, they are only added at the end of the span
    const token = Ottrelite.beginAsyncEvent(span.name);

    // since our API depends on the name of the span, we need to hook into changes to it
    const origUpdateName = span.updateName.bind(span);
    span.updateName = (newName: string) => {
      this.spanToInternalTokenMapping.set(span, token);
      return origUpdateName(newName);
    };

    this.spanToInternalTokenMapping.set(span, token);
  }

  onEnd(span: Span): void {
    const token = this.spanToInternalTokenMapping.get(span);

    if (token === undefined) {
      console.warn(
        `[OttreliteDevSpanProcessor] No token found for span: ${span.name}, dropping. This is likely a bug, did you do something strange?`
      );

      return;
    }

    Ottrelite.endAsyncEvent(
      span.name,
      token,
      stringifyAttributes(span.attributes)
    );
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}
