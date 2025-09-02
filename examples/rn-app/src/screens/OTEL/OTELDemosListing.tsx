import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';

import { commonStyles } from '../../commonStyles';
import {
  RouteDescriptions,
  RouteIcons,
  RouteNames,
  Routes,
} from '../../router/routes';

interface IOTELMenuItem {
  key: string;
  title: string;
  subtitle?: string;
  contents: string;
  icon: string;
  action: () => void;
  actionIcon: string;
}

export function OTELDemosListing() {
  const { navigate } = useNavigation();

  return (
    <ScrollView
      style={commonStyles.fullWidth}
      contentContainerStyle={styles.scrollViewContainer}
    >
      {[Routes.OTELJSNestedSpansDemo, Routes.OTELJSInstrumentationReactDemo]
        .filter(
          (route) => route !== Routes.Menu && route !== Routes.OTELDemosListing
        )
        .map<IOTELMenuItem>((route) => ({
          key: route,
          title: RouteNames[route],
          subtitle: 'OTEL API Demo',
          contents: RouteDescriptions[route],
          icon: RouteIcons[route],
          action: () => {
            navigate(route);
          },
          actionIcon: 'open-in-new',
        }))
        .map(({ key, title, subtitle, contents, icon, action, actionIcon }) => (
          <Card key={key} style={commonStyles.fullWidth}>
            <Card.Title
              title={title}
              subtitle={subtitle}
              // eslint-disable-next-line react/no-unstable-nested-components
              left={(props) => <Avatar.Icon {...props} icon={icon} />}
              // eslint-disable-next-line react/no-unstable-nested-components
              right={() => (
                <Button
                  mode="contained-tonal"
                  onPress={action}
                  icon={actionIcon}
                  style={styles.actionButtonRight}
                >
                  Open
                </Button>
              )}
            />
            <Card.Content>
              <Text variant="bodyMedium">{contents}</Text>
            </Card.Content>
          </Card>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    gap: 30,
    paddingHorizontal: 12,
    paddingVertical: 22,
  },
  actionButtonRight: { marginRight: 12 },
});
