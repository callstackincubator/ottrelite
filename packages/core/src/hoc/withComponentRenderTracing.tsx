import { type JSX, memo } from 'react';

import { useComponentRenderTracing } from '../hooks';
import type { TracingAPI } from '../types/TracingAPI';

/**
 * High-Order Component that wraps @see{@link useComponentRenderTracing} hook. For details, please consult the hook's documentation.
 *
 * @param eventName - The name of the event to trace.
 * @param api - The API to use for tracing (default is 'dev').
 * @returns An object containing the markJSRenderEnd function.
 */
export function withComponentRenderTracing<P extends JSX.IntrinsicAttributes>(
  eventName: string,
  api: TracingAPI = 'dev',
  WrappedComponent: React.ComponentType<P>
) {
  const TracedComponent = memo(function TracedComponent(props: P) {
    const { markJSRenderEnd } = useComponentRenderTracing(
      eventName,
      undefined,
      api
    );

    const rendered = <WrappedComponent {...props} />;

    markJSRenderEnd();

    return rendered;
  });

  TracedComponent.displayName = `Traced(${WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'})`;

  return TracedComponent;
}
