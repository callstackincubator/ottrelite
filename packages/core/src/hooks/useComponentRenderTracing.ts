import type { Span } from '@opentelemetry/api';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import { Ottrelite } from '../Ottrelite';
import { useTracer } from '../otel/hooks/useTracer';
import type { TracingAPI } from '../types/TracingAPI';

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
  const { startSpan } = useTracer(eventName);
  const jsLogicStartTimestampRef = useRef<number | null>(null);
  console.log(api);
  jsLogicStartTimestampRef.current = now();

  const jsLogicRenderEndTimeRef = useRef<number | null>(null);

  const tokenRef = useRef<number | null>(null);
  const spanRef = useRef<Span | null>(null);

  // the below effect executes before shadow tree commit, but with the commit guaranteed
  useLayoutEffect(() => {
    if (api === 'dev') {
      tokenRef.current = Ottrelite.beginAsyncEvent(
        eventName,
        additionalEventArgs
      );
    } else {
      spanRef.current = startSpan(eventName, {
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

    if (tokenRef.current !== null) {
      Ottrelite.endAsyncEvent(eventName, tokenRef.current, {
        jsLogicDuration,
      });
      tokenRef.current = null;
    } else if (spanRef.current) {
      spanRef.current.setAttribute('jsLogicDuration', jsLogicDuration);
      spanRef.current.end();
      spanRef.current = null;
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
