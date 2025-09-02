import { PlatformConsumerLib } from '@ottrelite/ottrelite-consumer-lib';
import { Platform } from 'react-native';

import { GenericTracingDemoScreen } from '../components/GenericTracingDemoScreen';

export default function PlatformTracingDemoScreen() {
  return (
    <GenericTracingDemoScreen
      apiName={Platform.OS === 'android' ? 'Kotlin' : 'Swift'}
      apiObject={PlatformConsumerLib}
    />
  );
}
