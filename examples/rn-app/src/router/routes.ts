import { Platform } from 'react-native';

export enum Routes {
  Menu = 'Menu',
  JSDevelopmentAPIDemo = 'JSTracingDemo',
  CPPTracingDemo = 'JSInternalAPIDemo',
  PlatformTracingDemo = 'PlatformTracingDemo',
  OTELDemosListing = 'OTELDemosListing',

  // subtree: OTEL demos
  OTELJSNestedSpansDemo = 'OTELNestedSpansDemo',
  OTELJSInstrumentationReactDemo = 'OTELInstrumentationReactDemo',
}

const platformPrimaryLanguageName =
  Platform.OS === 'android' ? 'Kotlin/Java' : 'Swift';

export const RouteNames: Record<Routes, string> = {
  [Routes.Menu]: 'RN Ottrelite Demos',
  [Routes.JSDevelopmentAPIDemo]: 'JS Development API',
  [Routes.CPPTracingDemo]: 'C++ API',
  [Routes.PlatformTracingDemo]: `${platformPrimaryLanguageName} API`,
  [Routes.OTELDemosListing]: 'OpenTelemetry Interop',

  // subtree: OTEL demos
  [Routes.OTELJSNestedSpansDemo]: 'JS Nested Spans Demo',
  [Routes.OTELJSInstrumentationReactDemo]: 'JS React Instrumentation Demo',
};

export const RouteDescriptions: Record<Routes, string> = {
  [Routes.Menu]: '', // N/A
  [Routes.JSDevelopmentAPIDemo]:
    'Demonstrates tracing using the Internal JS API (sync, async & counter events).',
  [Routes.CPPTracingDemo]:
    'Demonstrates tracing using the C++ API from a native module (here: C++ Nitro Module).',
  [Routes.PlatformTracingDemo]: `Demonstrates tracing using the ${platformPrimaryLanguageName} API from a native module (here: ${platformPrimaryLanguageName} Nitro Module).`,
  [Routes.OTELDemosListing]:
    'Demos using Ottrelite interoperability adapter with the OpenTelemetry library.',

  // subtree: OTEL demos
  [Routes.OTELJSNestedSpansDemo]:
    'JS demo presenting tracing with spans nested in each other.',
  [Routes.OTELJSInstrumentationReactDemo]:
    'JS demo presenting React instrumentation using the OpenTelemetry JS API.',
};

export const RouteIcons: Record<Routes, string> = {
  [Routes.Menu]: 'menu',
  [Routes.JSDevelopmentAPIDemo]: 'language-javascript',
  [Routes.PlatformTracingDemo]:
    platformPrimaryLanguageName === 'Swift'
      ? 'language-swift'
      : 'language-kotlin',
  [Routes.CPPTracingDemo]: 'language-cpp',
  [Routes.OTELDemosListing]: 'antenna',

  // subtree: OTEL demos
  [Routes.OTELJSNestedSpansDemo]: 'calculator',
  [Routes.OTELJSInstrumentationReactDemo]: 'react',
};
