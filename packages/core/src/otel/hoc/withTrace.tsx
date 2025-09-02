import { type Tracer } from '@opentelemetry/api';
import type { ComponentType, FC, JSX } from 'react';

import { useTracer } from '../hooks';

export type WithTraceProps = {
  /**
   * A hook that returns a tracer instance scoped to the component's name.
   *
   * @returns A tracer instance scoped to the component's name.
   */
  useTracer: () => Tracer;
};

/**
 * Higher-order component that supplies the wrapped component with
 * a wrapped `useTracer` hook that is already scoped to the proper name of the component.
 *
 * @param WrappedComponent The component to wrap with tracing
 * @param traceName Optional name name of the trace; if not provided, `displayName` of the component will be used.
 *
 * @returns A higher-order component that wraps the given component with tracing
 *
 * @see {@link useTracer} for the hook that is used internally.
 */
export const withTrace =
  <ComponentProps extends JSX.IntrinsicAttributes>(
    WrappedComponent: ComponentType<ComponentProps & Partial<WithTraceProps>>,
    traceName: string
  ): FC<ComponentProps & WithTraceProps> =>
  (props: ComponentProps) => (
    <WrappedComponent
      useTracer={() =>
        useTracer(
          traceName ?? WrappedComponent.displayName ?? WrappedComponent.name
        )
      }
      {...props}
    />
  );
