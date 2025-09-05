import { GenericDemosListingScreen } from '../../components/GenericDemosListingScreen';
import { Routes } from '../../router/routes';

export function JSDemosListing() {
  return (
    <GenericDemosListingScreen
      routes={[
        Routes.JSDevelopmentAPIDemo,
        Routes.JSAutoinstrumentationDevelopmentAPIDemo,
      ]}
      defaultSubtitle="JS API Demo"
    />
  );
}
