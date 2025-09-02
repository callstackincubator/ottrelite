import { CppConsumerLib } from '@ottrelite/ottrelite-consumer-lib';

import { GenericTracingDemoScreen } from '../components/GenericTracingDemoScreen';

export default function CPPTracingDemoScreen() {
  return <GenericTracingDemoScreen apiName="C++" apiObject={CppConsumerLib} />;
}
