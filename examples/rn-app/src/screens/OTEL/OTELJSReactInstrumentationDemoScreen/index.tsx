import { InstrumentationExternallyDrivenPropsDemoScreen } from '../../../components/InstrumentationExternallyDrivenPropsDemoScreen';

import { OTELJSTracedClassComponent } from './OTELJSTracedClassComponent';
import { OTELJSTracedFunctionComponent } from './OTELJSTracedFunctionComponent';
import { OTELJSTracedFunctionComponentWithAttributes } from './OTELJSTracedFunctionComponentWithAttributes';

export function OTELJSReactInstrumentationDemoScreen() {
  return (
    <InstrumentationExternallyDrivenPropsDemoScreen
      hookAPI="otel"
      TracedClassComponent={OTELJSTracedClassComponent}
      TracedFunctionComponent={OTELJSTracedFunctionComponent}
      TracedFunctionComponentWithAttributes={
        OTELJSTracedFunctionComponentWithAttributes
      }
    />
  );
}
