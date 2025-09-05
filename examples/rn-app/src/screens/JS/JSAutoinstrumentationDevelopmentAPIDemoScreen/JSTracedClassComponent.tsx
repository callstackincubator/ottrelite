import _ from 'lodash';
import { Component } from 'react';
import { Card, Text } from 'react-native-paper';

import { commonStyles } from '../../../commonStyles';
import type { ExternallyDrivenComponentProps } from '../../../types/ExternallyDrivenComponentProps';

export class JSTracedClassComponent extends Component<ExternallyDrivenComponentProps> {
  render() {
    'use trace dev';

    const { formattedDate, rerenderCount } = this.props;

    return (
      <Card mode="outlined">
        <Card.Title
          title="Autoinstrumented Class Component"
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
  }

  shouldComponentUpdate(
    nextProps: Readonly<ExternallyDrivenComponentProps>,
    nextState: Readonly<{}>,
    nextContext: any
  ): boolean {
    // only rerender if props have changed; this implementation is suboptimal, it's there just for the sake of an example
    return (
      !_.isEqual(this.props, nextProps) ||
      !_.isEqual(this.state, nextState) ||
      !_.isEqual(this.context, nextContext)
    );
  }
}
