// install the Ottrelite Core & backend(s)
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { OttreliteBackendPlatform } from '@ottrelite/backend-platform';
import { OttreliteBackendTracy } from '@ottrelite/backend-wrapper-tracy';
import { Ottrelite } from '@ottrelite/core';
import {
  DevSpanProcessorInterceptor,
  OttreliteExporterOTLP,
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
    // optional step: configure Ottrelite's span processor (required for live tracing in dev)
    new DevSpanProcessorInterceptor(),

    // optional step: configure Ottrelite's actual exporter using a preferred processor of choice
    new SimpleSpanProcessor(
      new OttreliteExporterOTLP({
        endpoint: 'http://localhost:4318/v1/',
      })
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
tracerProvider.register();

// configure the OpenTelemetry MeterProvider to use Ottrelite's capabilities
const meterProvider = new OttreliteMeterProvider({
  resource,
});

meterProvider.register();
