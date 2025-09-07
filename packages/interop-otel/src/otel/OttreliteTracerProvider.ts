import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TracerProvider is used in a docstring link
  type TracerProvider,
  context,
  propagation,
  trace,
} from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import {
  defaultResource as otelDefaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  BasicTracerProvider,
  type SDKRegistrationConfig,
  type TracerConfig,
} from '@opentelemetry/sdk-trace-base';
import { StackContextManager } from '@opentelemetry/sdk-trace-web';
import {
  ATTR_TELEMETRY_SDK_LANGUAGE,
  ATTR_TELEMETRY_SDK_NAME,
  ATTR_TELEMETRY_SDK_VERSION,
} from '@opentelemetry/semantic-conventions';

import { ReactNativeOttreliteInteropOTELHybridObject } from '../ReactNativeOttreliteInteropOTELHybridObject';

/**
 * {@link TracerProvider} implementation that pipes trace data to Ottrelite's Development API.
 */
export class OttreliteTracerProvider extends BasicTracerProvider {
  constructor(config?: TracerConfig) {
    super({
      ...config,
      resource: (config?.resource ?? otelDefaultResource()).merge(
        resourceFromAttributes({
          [ATTR_TELEMETRY_SDK_LANGUAGE]: 'javascript',
          [ATTR_TELEMETRY_SDK_NAME]: 'ottrelite',
          [ATTR_TELEMETRY_SDK_VERSION]: '1.0.0',
        })
      ),
    });
  }

  register(config: SDKRegistrationConfig = {}) {
    trace.setGlobalTracerProvider(this);

    propagation.setGlobalPropagator(
      config.propagator ??
        new CompositePropagator({
          propagators: [
            new W3CBaggagePropagator(),
            new W3CTraceContextPropagator(),
          ],
        })
    );

    context.setGlobalContextManager(
      (config.contextManager ?? new StackContextManager()).enable()
    );

    ReactNativeOttreliteInteropOTELHybridObject.installGlobalOTELCPPTracerProvider();
  }
}
