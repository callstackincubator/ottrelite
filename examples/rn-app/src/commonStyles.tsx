import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  spanningContainer: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    width: '100%',
  },
  spacingContainer: {
    gap: 10,
  },
  title: {
    marginVertical: 20,
  },
  centeredText: {
    textAlign: 'center',
  },
  captionText: {
    fontStyle: 'italic',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  fullWidth: { width: '100%' },
});
