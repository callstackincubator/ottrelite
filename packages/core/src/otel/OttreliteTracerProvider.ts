import { context, propagation, trace } from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import {
  BasicTracerProvider,
  type SDKRegistrationConfig,
} from '@opentelemetry/sdk-trace-base';
import { StackContextManager } from '@opentelemetry/sdk-trace-web';

export class OttreliteTracerProvider extends BasicTracerProvider {
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
  }
}
