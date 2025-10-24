import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { OttreliteBackendPlatform } from '@ottrelite/backend-platform';
import { OttreliteBackendTracy } from '@ottrelite/backend-wrapper-tracy';
import { Ottrelite } from '@ottrelite/core';
import {
  DevSpanProcessorInterceptor,
  OttreliteMeterProvider,
  OttreliteTracerProvider,
} from '@ottrelite/interop-otel';
import { Platform } from 'react-native';
import {
  getDeviceId,
  getSystemVersion,
  getVersion,
} from 'react-native-device-info';

import { name as appName } from '../app.json';

const JAEGER_ENDPOINT_BASE = 'http://localhost:4318/v1';

// initialize Ottrelite Development API
Ottrelite.install(
  // below: list of development backends to install
  [OttreliteBackendPlatform, OttreliteBackendTracy],
  // below: optional configuration options
  {
    reviveSystraceAPI: true, // if set to true, the RN Systrace API will be revived & configured to call Ottrelite's methods
  }
);

console.log(
  'Ottrelite running with the following installed backends:',
  Ottrelite.listInstalledBackends()
);

// optional step: resource attributes; below: example options, this can be customized as needed
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: appName,
  [ATTR_SERVICE_VERSION]: getVersion(),
  'device.id': getDeviceId(),
  'os.name': Platform.OS,
  'os.version': getSystemVersion(),
});

// configure OpenTelemetry to use Ottrelite's OttreliteTracerProvider
const tracerProvider = new OttreliteTracerProvider({
  spanProcessors: [
    new DevSpanProcessorInterceptor(),

    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: `${JAEGER_ENDPOINT_BASE}/traces`,
      }),
      {
        scheduledDelayMillis: 500,
      }
    ),
  ],
  resource,
});

// optional step: register instrumentations; Ottrelite integrates with the OTEL JS API, therefore allowing to
// use the same instrumentations as you would with OpenTelemetry JS
// the below example shows a few common instrumentations, but you can add more as needed, inspired by https://opentelemetry.io/docs/demo/services/react-native-app/
registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      clearTimingResources: false,
      propagateTraceHeaderCorsUrls: /.*/,
    }),
    new XMLHttpRequestInstrumentation({
      ignoreUrls: [/\/fetch-urls\/.*/],
    }),
  ],
});

// register the React Native tracer provider
tracerProvider.register({
  propagator: new CompositePropagator({
    propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
  }),
});

const metricExporter = new OTLPMetricExporter({
  url: `${JAEGER_ENDPOINT_BASE}/metrics`,
});
const meterProvider = new OttreliteMeterProvider({
  resource,
  readers: [
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 1000,
    }),
  ],
});

meterProvider.register();
