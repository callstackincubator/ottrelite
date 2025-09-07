import {
  ProxyTracerProvider,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Tracer is used in a docstring link
  type Tracer,
  trace,
} from '@opentelemetry/api';

import { OttreliteTracerProvider } from '../OttreliteTracerProvider';

/**
 * Returns a {@link Tracer} instance with the given name & (optionally) version.
 *
 * @param name Name of the tracer unit; must be unique within the application.
 * @param version Optional version of the tracer unit.
 * @returns The tracer instance.
 */
export function vanillaTracerFactory(name: string, version?: string) {
  if (
    !(
      (
        trace.getTracerProvider() as ProxyTracerProvider
      ).getDelegate() instanceof OttreliteTracerProvider
    )
  ) {
    console.warn(
      `[useTracer] Expected the registered TracerProvider to be RNTracerProvider, but got: ${trace.getTracerProvider().constructor.name}. Did you forget to set up Ottrelite?`
    );
  }

  return trace.getTracer(name, version);
}
