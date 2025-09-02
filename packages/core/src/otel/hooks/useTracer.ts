import { useMemo } from 'react';

import { vanillaTracerFactory } from '../logic/vanillaTracerFactory';

/**
 * Hook supplying a tracer instance with the given name and (optionally) version.
 *
 * @param name Name of the tracer unit; must be unique within the application.
 * @param version Optional version of the tracer unit.
 * @returns The tracer instance.
 */
export function useTracer(name: string, version?: string) {
  const tracer = useMemo(
    () => vanillaTracerFactory(name, version),
    [name, version]
  );

  return tracer;
}
