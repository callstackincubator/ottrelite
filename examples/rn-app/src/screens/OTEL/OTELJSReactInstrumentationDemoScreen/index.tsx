import moment from 'moment';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { commonStyles } from '../../../commonStyles';

import { TracedClassComponent } from './TracedClassComponent';
import { TracedFunctionComponent } from './TracedFunctionComponent';
import { TracedFunctionComponentWithAttributes } from './TracedFunctionComponentWithAttributes';

// generate a new target moment at which the traced children should re-render
function getNewRerenderAt() {
  return moment().add(5, 'seconds');
}

// renders the given moment in a display format
function formatRenderedAt(date: moment.Moment) {
  return date.format('HH:mm:ss.SSS');
}

// update the component N times per second
const TIME_DISPLAY_FPS = 10;

export function OTELJSReactInstrumentationDemoScreen() {
  const [displayNow, setDisplayNow] = useState(() => moment());
  const [displayRenderedAt, setLastRenderedAt] = useState(() =>
    formatRenderedAt(moment())
  );
  const [rerenderAt, setRerenderAt] = useState(getNewRerenderAt);
  const [rerenderFlag, setRerenderFlag] = useState(0);

  // 'now' state var updater effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayNow(moment());
    }, 1000 / TIME_DISPLAY_FPS);

    return () => clearInterval(interval);
  }, []);

  // rerender flag updater effect
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = moment();

      if (now.isAfter(rerenderAt)) {
        setRerenderFlag((prev) => prev + 1);
        setLastRenderedAt(formatRenderedAt(now));
        setRerenderAt(getNewRerenderAt());
      }
    }, 1000 / TIME_DISPLAY_FPS);

    return () => clearInterval(checkInterval);
  }, [rerenderAt]);

  return (
    <>
      <Text
        variant="titleLarge"
        style={[commonStyles.title, commonStyles.centeredText]}
      >
        JS React Instrumentation Demo
      </Text>

      <View style={[commonStyles.spanningContainer, styles.controlsWrapper]}>
        <View>
          <Text variant="labelLarge" style={commonStyles.centeredText}>
            Current time: {displayNow.format('HH:mm:ss.S')}
          </Text>

          <Text variant="labelLarge" style={commonStyles.centeredText}>
            Next rerender in{' '}
            {moment
              .duration(rerenderAt.diff(displayNow))
              .asSeconds()
              .toFixed(2)}
            s
          </Text>

          <Text variant="labelLarge" style={commonStyles.centeredText}>
            Rerender flag: {rerenderFlag}
          </Text>
        </View>

        <View style={commonStyles.spanningContainer}>
          <Text variant="bodyMedium" style={commonStyles.centeredText}>
            Tracing of the below components is auto-instrumented, through the
            Babel plugin @ottrelite/instrumentation-react
          </Text>

          <Text
            variant="bodySmall"
            style={[commonStyles.centeredText, commonStyles.captionText]}
          >
            They will be creating spans upon every render
          </Text>

          <View
            style={[commonStyles.spanningContainer, styles.componentsWrapper]}
          >
            <TracedFunctionComponent
              formattedDate={displayRenderedAt}
              rerenderCount={rerenderFlag}
            />
            <TracedClassComponent
              formattedDate={displayRenderedAt}
              rerenderCount={rerenderFlag}
            />
            <TracedFunctionComponentWithAttributes
              formattedDate={displayRenderedAt}
              rerenderCount={rerenderFlag}
            />
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  controlsWrapper: { gap: 60 },
  componentsWrapper: { gap: 40 },
});
