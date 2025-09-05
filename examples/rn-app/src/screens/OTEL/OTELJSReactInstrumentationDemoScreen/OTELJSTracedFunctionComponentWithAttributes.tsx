import { useComponentRenderTracing } from '@ottrelite/core';
import { memo } from 'react';
import { Card, Text } from 'react-native-paper';

import { commonStyles } from '../../../commonStyles';
import type { ExternallyDrivenComponentProps } from '../../../types/ExternallyDrivenComponentProps';

export const OTELJSTracedFunctionComponentWithAttributes = memo(
  function OTELJSTracedFunctionComponentWithAttributes({
    formattedDate,
    rerenderCount,
  }: ExternallyDrivenComponentProps) {
    const { markJSRenderEnd } = useComponentRenderTracing(
      'OTELJSTracedFunctionComponentWithAttributes',
      {
        formattedDate,
        rerenderCount: rerenderCount.toString(),
      },
      'otel'
    );

    const contents = (
      <Card mode="outlined">
        <Card.Title
          title="FC with attributes via hook"
          titleStyle={commonStyles.centeredText}
        />

        <Card.Content>
          <Text style={commonStyles.centeredText}>
            Rerender #{rerenderCount}
          </Text>

          <Text variant="bodyMedium" style={commonStyles.centeredText}>
            Last rendered at {formattedDate}
          </Text>
        </Card.Content>
      </Card>
    );

    markJSRenderEnd();

    return contents;
  }
);
