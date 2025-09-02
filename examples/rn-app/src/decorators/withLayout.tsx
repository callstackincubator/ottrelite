import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function withLayout<T extends React.ComponentType<any>>(Component: T) {
  return function WrappedComponent(props: React.ComponentProps<T>) {
    const insets = useSafeAreaInsets();

    return (
      <View style={[styles.root, { paddingBottom: insets.bottom }]}>
        <Component {...props} />
      </View>
    );
  };
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
});
