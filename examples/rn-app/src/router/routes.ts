import { Platform } from 'react-native';

export enum Routes {
  Menu = 'Menu',
  JSDemosListing = 'JSDemosListing',
  JSDevelopmentAPIDemo = 'JSTracingDemo',
  JSAutoinstrumentationDevelopmentAPIDemo = 'JSAutoinstrumentationDevelopmentAPIDemo',
  CPPTracingDemo = 'CPPTracingDemo',
  PlatformTracingDemo = 'PlatformTracingDemo',
  OTELDemosListing = 'OTELDemosListing',

  // subtree: OTEL demos
  OTELJSNestedSpansDemo = 'OTELNestedSpansDemo',
  OttreliteReactInstrumentationWithOTEL = 'OttreliteReactInstrumentationWithOTEL',
}

const platformPrimaryLanguageName =
  Platform.OS === 'android' ? 'Kotlin/Java' : 'Swift';

export const RouteNames: Record<Routes, string> = {
  [Routes.Menu]: 'RN Ottrelite Demos',
  [Routes.JSDemosListing]: 'JS Demos',
  [Routes.JSAutoinstrumentationDevelopmentAPIDemo]:
    'JS Autoinstrumentation Directive',
  [Routes.JSDevelopmentAPIDemo]: 'JS Development API',
  [Routes.CPPTracingDemo]: 'C++ API',
  [Routes.PlatformTracingDemo]: `${platformPrimaryLanguageName} API`,
  [Routes.OTELDemosListing]: 'OpenTelemetry Interop',

  // subtree: OTEL demos
  [Routes.OTELJSNestedSpansDemo]: 'JS Nested Spans Demo',
  [Routes.OttreliteReactInstrumentationWithOTEL]:
    'Ottrelite React Instrumentation x OTEL',
};

export const RouteDescriptions: Record<Routes, string> = {
  [Routes.Menu]: '', // N/A
  [Routes.JSDemosListing]: 'Demos using the Ottrelite JS Development API.',
  [Routes.JSAutoinstrumentationDevelopmentAPIDemo]:
    'Demo of Ottrelite Babel plugin autoinstrumentation directive configured to trace with the Development API.',
  [Routes.JSDevelopmentAPIDemo]:
    'Demo tracing using the Development JS API (sync, async & counter events).',
  [Routes.CPPTracingDemo]:
    'Demo tracing using the C++ API from a native module (here: C++ Nitro Module).',
  [Routes.PlatformTracingDemo]: `Demo tracing using the ${platformPrimaryLanguageName} API from a native module (here: ${platformPrimaryLanguageName} Nitro Module).`,
  [Routes.OTELDemosListing]:
    'Demos using Ottrelite interoperability adapter with the OpenTelemetry library.',

  // subtree: OTEL demos
  [Routes.OTELJSNestedSpansDemo]:
    'JS demo presenting tracing with spans nested in each other.',
  [Routes.OttreliteReactInstrumentationWithOTEL]:
    'JS demo presenting React instrumentation using the OpenTelemetry JS API.',
};

export const RouteSubtitles: Partial<Record<Routes, string>> = {
  [Routes.JSDemosListing]: 'JS Development API demos',
  [Routes.OTELDemosListing]: 'OTEL demos group',
  [Routes.OttreliteReactInstrumentationWithOTEL]:
    'Ottrelite hook x OTEL JS SDK',
};

export const RouteIcons: Record<Routes, string> = {
  [Routes.Menu]: 'menu',
  [Routes.JSDemosListing]: 'language-javascript',
  [Routes.JSDevelopmentAPIDemo]: 'wrench-cog-outline',
  [Routes.JSAutoinstrumentationDevelopmentAPIDemo]: 'auto-fix',
  [Routes.PlatformTracingDemo]:
    platformPrimaryLanguageName === 'Swift'
      ? 'language-swift'
      : 'language-kotlin',
  [Routes.CPPTracingDemo]: 'language-cpp',
  [Routes.OTELDemosListing]: 'antenna',

  // subtree: OTEL demos
  [Routes.OTELJSNestedSpansDemo]: 'calculator',
  [Routes.OttreliteReactInstrumentationWithOTEL]: 'react',
};
