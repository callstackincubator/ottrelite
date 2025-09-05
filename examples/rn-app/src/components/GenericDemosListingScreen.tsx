import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';

import { commonStyles } from '../commonStyles';
import {
  RouteDescriptions,
  RouteIcons,
  RouteNames,
  RouteSubtitles,
  Routes,
} from '../router/routes';

interface IMenuItem {
  key: string;
  title: string;
  subtitle?: string;
  contents: string;
  icon: string;
  action: () => void;
  actionIcon: string;
}

export type GenericDemosListingScreenProps = {
  routes: Routes[];
  defaultSubtitle: string;
};

export function GenericDemosListingScreen({
  routes,
  defaultSubtitle,
}: GenericDemosListingScreenProps) {
  const { navigate } = useNavigation();

  return (
    <ScrollView
      style={commonStyles.fullWidth}
      contentContainerStyle={styles.scrollViewContainer}
    >
      {routes
        .filter(
          (route) => route !== Routes.Menu && route !== Routes.OTELDemosListing
        )
        .map<IMenuItem>((route) => ({
          key: route,
          title: RouteNames[route],
          subtitle: RouteSubtitles[route] ?? defaultSubtitle,
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
    paddingHorizontal: 4,
    paddingVertical: 22,
  },
  actionButtonRight: { marginRight: 12 },
});
