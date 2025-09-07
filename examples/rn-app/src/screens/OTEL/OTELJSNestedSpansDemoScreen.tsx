import { context, metrics, trace } from '@opentelemetry/api';
import { useTracer } from '@ottrelite/interop-otel';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { commonStyles } from '../../commonStyles';
import { factorial } from '../../utils/factorial';

const UNIT_NAME = 'otel-nested-spans-demo';

const meter = metrics.getMeter(UNIT_NAME);

const factorialCounter = meter.createCounter('factorial_value', {
  description: 'Factorial value',
});

const targetCounter = meter.createCounter('target', {
  description: 'Factorial argument',
});

export function OTELJSNestedSpansDemoScreen() {
  const [running, setRunning] = useState(false);
  const [value, setValue] = useState(0);
  const [n, setN] = useState(0);
  const tracer = useTracer(UNIT_NAME);

  const asyncSpanRef = useRef<any>(null);

  // goal setter effect
  useEffect(() => {
    if (running) return;

    const timeout = setTimeout(function goalSetterEffect() {
      const span = tracer.startSpan('SetTarget');

      context.with(trace.setSpan(context.active(), span), () => {
        console.log('Setting new target');

        const randomizeSpan = tracer.startSpan('RandomizeN');
        // generate an argument from 8 to 18 to keep the JS thread busy with factorial
        let newX = 8 + Math.round(Math.random() * 10);
        randomizeSpan.end();

        const updateStateSpan = tracer.startSpan('UpdateState', {
          attributes: {
            targetValue: newX.toString(),
          },
        });

        targetCounter.add(newX, { target: newX.toString() });
        setN(newX);
        setRunning(true);
        updateStateSpan.end();

        const consoleLogSpan = tracer.startSpan('ConsoleLog');
        console.log('Done setting new target, chosen', newX);
        consoleLogSpan.end();
      });

      span.end();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [running, tracer]);

  // calculation executor effect
  useEffect(
    function calculationExecutorEffect() {
      if (!running) return;

      const timeout = setTimeout(function calculationExecutorTimeout() {
        const beginMetadata = { n: n.toString() };

        // start a sample async span
        asyncSpanRef.current = tracer.startSpan('FactorialAsyncTask', {
          attributes: beginMetadata,
        });

        context.with(
          trace.setSpan(context.active(), asyncSpanRef.current),
          () => {
            const calculationSpan = tracer.startSpan('CalculateFactorial', {
              attributes: beginMetadata,
            });

            const consoleLogSpan = tracer.startSpan('ConsoleLog');
            console.log('Calculating factorial for', n);
            consoleLogSpan.end();

            const factorialValueSpan = tracer.startSpan('Factorial');
            const newValue = factorial(n);
            factorialValueSpan.end();

            const setValueSpan = tracer.startSpan('SetValue', {
              attributes: {
                newValue: newValue.toString(),
              },
            });
            setValue(newValue);
            setValueSpan.end();

            factorialCounter.add(newValue, { value: newValue.toString() });

            console.log('Done calculating factorial for', newValue);

            const endMetadata = {
              newValue: newValue.toString(),
            };

            calculationSpan.setAttributes(endMetadata);
            calculationSpan.end();

            // end the sample async span
            asyncSpanRef.current.setAttributes(endMetadata);
            asyncSpanRef.current.end();
          }
        );

        setRunning(false);
      }, 2000);

      return () => clearTimeout(timeout);
    },
    [n, running, tracer]
  );

  return (
    <>
      <Text
        variant="titleLarge"
        style={[commonStyles.title, commonStyles.centeredText]}
      >
        Factorial Calculator (OTEL)
      </Text>

      <View style={[commonStyles.spanningContainer, styles.controlsWrapper]}>
        <View style={commonStyles.spanningContainer}>
          <Text variant="bodyMedium" style={commonStyles.centeredText}>
            Using OpenTelemetry JS API (@opentelemetry/api)
          </Text>

          <Text
            variant="bodySmall"
            style={[commonStyles.centeredText, commonStyles.captionText]}
          >
            Capturing spans using a Tracer & metrics using a Meter
          </Text>
        </View>

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
