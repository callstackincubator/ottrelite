import { InstrumentationExternallyDrivenPropsDemoScreen } from '../../../components/InstrumentationExternallyDrivenPropsDemoScreen';

import { JSTracedClassComponent } from './JSTracedClassComponent';
import { JSTracedFunctionComponent } from './JSTracedFunctionComponent';
import { JSTracedFunctionComponentWithAttributes } from './JSTracedFunctionComponentWithAttributes';

export function JSAutoinstrumentationDevelopmentAPIDemoScreen() {
  return (
    <InstrumentationExternallyDrivenPropsDemoScreen
      hookAPI="dev"
      TracedClassComponent={JSTracedClassComponent}
      TracedFunctionComponent={JSTracedFunctionComponent}
      TracedFunctionComponentWithAttributes={
        JSTracedFunctionComponentWithAttributes
      }
    />
  );
}
