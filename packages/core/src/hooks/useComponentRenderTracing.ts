import type { Span, Tracer } from '@opentelemetry/api';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import Ottrelite from '../Ottrelite';
import type { TracingAPI } from '../types/TracingAPI';

let maybeUseOTELTracer: (name: string, version?: string) => Tracer;
try {
  maybeUseOTELTracer =
    require('@ottrelite/interop-otel/hooks/useTracer').useTracer;
  if (!maybeUseOTELTracer) {
    throw new Error('package not installed');
  }
} catch {
  maybeUseOTELTracer = () => {
    const spanMock = {
      setAttribute: () => {},
      end: () => {},
    } as any as Span;

    return {
      startSpan: () => {
        console.warn(
          '[useComponentRenderTracing] Invalid setup - @ottrelite/interop-otel interop package is not installed, falling back to no-op tracer. Please install @ottrelite/interop-otel to enable OTEL tracing.'
        );

        return spanMock;
      },
      startActiveSpan: () => spanMock,
    };
  };
}

/**
 * Helper for getting current epoch time, with sub-millisecond precision if `performance.now()`
 * is available, or with 1-ms-precision from `Date.now()` otherwise.
 *
 * @returns Current epoch time in milliseconds.
 */
function now(): number {
  if ('performance' in global && 'now' in performance) {
    return performance.now();
  }

  return Date.now();
}

/**
 * Hook to trace component render performance. Registers immediate events if using the `'dev'` API; for `'otel'` API,
 * records spans starting & ending at component actual **render** after shadow tree commit, the JS rendering logic duration
 * is recorded as attribute `jsLogicDuration`. This is because of React's concurrent rendering model, see the README for more information on that.
 *
 * @param eventName - The name of the event to trace.
 * @param additionalEventArgs - Additional arguments to include in the trace. In case of both APIs, they will be set at event start.
 * @param api - The API to use for tracing (default is 'dev').
 * @returns An object containing the markJSRenderEnd function.
 */
export function useComponentRenderTracing(
  eventName: string,
  additionalEventArgs?: Record<string, string>,
  api: TracingAPI = 'dev'
) {
  const { startSpan: startOTELSpan } = maybeUseOTELTracer(eventName);
  const jsLogicStartTimestampRef = useRef<number | null>(null);

  jsLogicStartTimestampRef.current = now();

  const jsLogicRenderEndTimeRef = useRef<number | null>(null);

  const devTokenRef = useRef<number | null>(null);
  const otelSpanRef = useRef<Span | null>(null);

  // the below effect executes before shadow tree commit, but with the commit guaranteed
  useLayoutEffect(() => {
    if (api === 'dev') {
      devTokenRef.current = Ottrelite.beginAsyncEvent(
        eventName,
        additionalEventArgs
      );
    } else {
      otelSpanRef.current = startOTELSpan(eventName, {
        attributes: additionalEventArgs,
      });
    }
  });

  // the below effect executes after shadow tree commit
  useEffect(() => {
    if (jsLogicStartTimestampRef.current === null) {
      console.warn(
        `[useComponentRenderTracing] jsLogicStartTimestampRef is null for event: ${eventName}. This might indicate that the component was not rendered properly.`
      );
      return;
    }

    if (jsLogicRenderEndTimeRef.current === null) {
      console.warn(
        `[useComponentRenderTracing] jsLogicRenderEndTimeRef is null for event: ${eventName}. Are you sure you have invoked markJSRenderEnd just before returning the rendered tree?`
      );
      return;
    }

    const jsLogicDuration = `${jsLogicRenderEndTimeRef.current - jsLogicStartTimestampRef.current}ms`;

    if (devTokenRef.current !== null) {
      Ottrelite.endAsyncEvent(eventName, devTokenRef.current, {
        jsLogicDuration,
      });
      devTokenRef.current = null;
    } else if (otelSpanRef.current) {
      otelSpanRef.current.setAttribute('jsLogicDuration', jsLogicDuration);
      otelSpanRef.current.end();
      otelSpanRef.current = null;
    } else {
      console.warn(
        `[useComponentRenderTracing] Neither tokenRef nor spanRef is set for event: ${eventName}. Something went wrong, please report a bug.`
      );
    }
  });

  const markJSRenderEnd = useCallback(() => {
    jsLogicRenderEndTimeRef.current = now();
  }, []);

  return { markJSRenderEnd };
}
