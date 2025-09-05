import { Ottrelite } from '@ottrelite/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Systrace, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';

import { commonStyles } from '../commonStyles';
import { factorial } from '../utils/factorial';

export function JSDevelopmentAPIDemoScreen() {
  const [running, setRunning] = useState(false);
  const [value, setValue] = useState(0);
  const [n, setN] = useState(0);
  const [useOttreliteAPI, setUseOttreliteAPI] = useState(true);

  const asyncTaskTokenRef = useRef<number | null>(null);

  const TracingAPI = useMemo(
    () => (useOttreliteAPI ? Ottrelite : Systrace),
    [useOttreliteAPI]
  );

  // goal setter effect
  useEffect(() => {
    if (running) return;

    const timeout = setTimeout(function goalSetterEffect() {
      TracingAPI.beginEvent('SetTarget');
      console.log('Setting new target');

      TracingAPI.beginEvent('RandomizeN');
      // generate an argument from 8 to 18 to keep the JS thread busy with factorial
      let newX = 8 + Math.round(Math.random() * 10);

      TracingAPI.endEvent();

      TracingAPI.beginEvent('UpdateState', {
        targetValue: newX.toString(),
      });
      TracingAPI.counterEvent('TargetValue', newX);
      setN(newX);
      setRunning(true);
      TracingAPI.endEvent();

      TracingAPI.beginEvent('ConsoleLog');
      console.log('Done setting new target, chosen', newX);
      TracingAPI.endEvent();

      TracingAPI.endEvent();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [running, TracingAPI]);

  // calculation executor effect
  useEffect(
    function calculationExecutorEffect() {
      if (!running) return;

      const timeout = setTimeout(function calculationExecutorTimeout() {
        const beginMetadata = { n: n.toString() };

        // start a sample async event
        asyncTaskTokenRef.current = TracingAPI.beginAsyncEvent(
          'FactorialAsyncTask',
          beginMetadata
        );

        TracingAPI.beginEvent('CalculateFactorial', beginMetadata);

        TracingAPI.beginEvent('ConsoleLog');
        console.log('Calculating factorial for', n);
        TracingAPI.endEvent();

        TracingAPI.beginEvent('Factorial');
        const newValue = factorial(n);
        TracingAPI.endEvent();

        TracingAPI.beginEvent('SetValue', {
          newValue: newValue.toString(),
        });
        setValue(newValue);
        TracingAPI.endEvent();

        TracingAPI.counterEvent('FactorialValue', newValue);

        console.log('Done calculating factorial for', newValue);

        const endMetadata = {
          newValue: newValue.toString(),
        };

        // end the sample async event
        TracingAPI.endAsyncEvent(
          'FactorialAsyncTask',
          asyncTaskTokenRef.current!,
          endMetadata
        );

        setRunning(false);
        TracingAPI.endEvent(endMetadata);
      }, 2000);

      return () => clearTimeout(timeout);
    },
    [n, running, TracingAPI]
  );

  const toggleUseOttreliteAPI = useCallback(
    () => setUseOttreliteAPI((previous) => !previous),
    []
  );

  return (
    <>
      <Text
        variant="titleLarge"
        style={[commonStyles.title, commonStyles.centeredText]}
      >
        Factorial Calculator
      </Text>

      <View style={[commonStyles.spanningContainer, styles.controlsWrapper]}>
        <View style={commonStyles.rowContainer}>
          <Text variant="bodyMedium">
            {useOttreliteAPI ? 'Using Ottrelite API' : 'Using Systrace API'}
          </Text>

          <Switch
            value={useOttreliteAPI}
            onValueChange={toggleUseOttreliteAPI}
          />
        </View>

        <Text
          variant="bodySmall"
          style={[commonStyles.centeredText, commonStyles.captionText]}
        >
          Capturing sync, async & counter events
        </Text>

        <View style={commonStyles.spacingContainer}>
          {running ? (
            <Text variant="labelLarge" style={commonStyles.centeredText}>
              Calculating Factorial ⌛️
              {'\n'}
              {n}! = ...
            </Text>
          ) : (
            <>
              <Text variant="labelLarge" style={commonStyles.centeredText}>
                Calculated ✅{'\n'}
                {n}! = {value}
              </Text>

              <Text
                variant="bodyMedium"
                style={[commonStyles.centeredText, commonStyles.captionText]}
              >
                Waiting for new target
              </Text>
            </>
          )}

          {running && <ActivityIndicator />}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  controlsWrapper: { gap: 60 },
});
