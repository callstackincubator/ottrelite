import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StackNavigation } from './router/StackNavigation';

export default function App() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <StackNavigation />
      </SafeAreaProvider>
    </PaperProvider>
  );
}
