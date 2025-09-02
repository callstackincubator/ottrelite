import {
  DarkTheme,
  DefaultTheme,
  type StaticParamList,
  createStaticNavigation,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { useTheme } from 'react-native-paper';

import { withLayout } from '../decorators/withLayout';
import CPPTracingDemoScreen from '../screens/CPPTracingDemoScreen';
import { JsDevelopmentAPIDemoScreen } from '../screens/JsDevelopmentAPIDemoScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { OTELDemosListing } from '../screens/OTEL/OTELDemosListing';
import { OTELJSNestedSpansDemoScreen } from '../screens/OTEL/OTELJSNestedSpansDemoScreen';
import { OTELJSReactInstrumentationDemoScreen } from '../screens/OTEL/OTELJSReactInstrumentationDemoScreen';
import PlatformTracingDemoScreen from '../screens/PlatformTracingDemoScreen';

import { RouteNames, Routes } from './routes';

const Stack = createNativeStackNavigator({
  screens: {
    [Routes.Menu]: withLayout(MenuScreen),
    [Routes.JSDevelopmentAPIDemo]: withLayout(JsDevelopmentAPIDemoScreen),
    [Routes.CPPTracingDemo]: withLayout(CPPTracingDemoScreen),
    [Routes.PlatformTracingDemo]: withLayout(PlatformTracingDemoScreen),
    [Routes.OTELDemosListing]: withLayout(OTELDemosListing),

    // subtree: OTEL demos
    [Routes.OTELJSNestedSpansDemo]: withLayout(
      withLayout(OTELJSNestedSpansDemoScreen)
    ),
    [Routes.OTELJSInstrumentationReactDemo]: withLayout(
      OTELJSReactInstrumentationDemoScreen
    ),
  },
  screenOptions: ({ route }) => ({
    title: RouteNames[route.name as Routes],
    contentStyle: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
  initialRouteName: Routes.Menu,
});

type RootStackParamList = StaticParamList<typeof Stack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const StackNavigationComponent = createStaticNavigation(Stack);

export function StackNavigation() {
  const { dark } = useTheme();

  const ThemeBase = useMemo(() => (dark ? DarkTheme : DefaultTheme), [dark]);

  return (
    <StackNavigationComponent
      theme={{
        ...ThemeBase,
        dark,
      }}
    />
  );
}
