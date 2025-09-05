import { memo } from 'react';
import { Card, Text } from 'react-native-paper';

import { commonStyles } from '../../../commonStyles';
import type { ExternallyDrivenComponentProps } from '../../../types/ExternallyDrivenComponentProps';

export const JSTracedFunctionComponent = memo(function TracedFunctionComponent({
  formattedDate,
  rerenderCount,
}: ExternallyDrivenComponentProps) {
  'use trace dev';

  return (
    <Card mode="outlined">
      <Card.Title
        title="Autoinstrumented Functional Component"
        titleStyle={commonStyles.centeredText}
      />

      <Card.Content>
        <Text style={commonStyles.centeredText}>Rerender #{rerenderCount}</Text>

        <Text variant="bodyMedium" style={commonStyles.centeredText}>
          Last rendered at {formattedDate}
        </Text>
      </Card.Content>
    </Card>
  );
});
