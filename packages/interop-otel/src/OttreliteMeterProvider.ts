import {
  type HrTime,
  type Meter as IMeter,
  type MeterProvider as IMeterProvider,
  type MeterOptions,
  metrics,
} from '@opentelemetry/api';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { instrumentationScopeId } from '@opentelemetry/sdk-metrics/build/src/utils';
import Ottrelite from '@ottrelite/core';

/**
 * {@link IMeterProvider} implementation that pipes metrics data to Ottrelite's Development API.
 */
export class OttreliteMeterProvider
  extends MeterProvider
  implements IMeterProvider
{
  private _meterStates: Map<string, IMeter> = new Map();

  private hookIntoObservableInstrument(
    observableInstrument: ReturnType<
      | IMeter['createObservableCounter']
      | IMeter['createObservableGauge']
      | IMeter['createObservableUpDownCounter']
    >,
    {
      meterId,
      instrumentCategory,
      name,
    }: { meterId: string; instrumentCategory: string; name: string }
  ) {
    // below: see https://github.com/open-telemetry/opentelemetry-js/blob/48538b46add710483af3ff8147572d5bd4b273e0/packages/sdk-metrics/src/state/AsyncMetricStorage.ts#L27
    (observableInstrument as any)._metricStorages.forEach((storage: any) => {
      const originalRecord = storage.record.bind(storage);

      storage.record = function (measurements: any, _observationTime: HrTime) {
        Array.from(measurements.entries() as any[]).forEach(([_, value]) => {
          Ottrelite.counterEvent(
            `${meterId}/${instrumentCategory}/${name}`,
            value
          );
        });

        return originalRecord(measurements, _observationTime);
      };
    });
  }

  override getMeter(
    meterName: string,
    meterVersion?: string,
    meterOptions?: MeterOptions
  ): IMeter {
    const meterId = instrumentationScopeId({
      name: meterName,
      version: meterVersion,
      schemaUrl: meterOptions?.schemaUrl,
    });
    const maybeExistingMeter = this._meterStates.get(meterId);

    if (maybeExistingMeter) {
      return maybeExistingMeter;
    }

    const meter = super.getMeter(meterId, meterVersion, meterOptions);

    const originalCreateCounter = meter.createCounter.bind(meter);
    meter.createCounter = function (name, ...createArgs) {
      const counter = originalCreateCounter(name, ...createArgs);

      let currentValue = 0;
      const originalAdd = counter.add.bind(counter);
      counter.add = function (value, ...args) {
        currentValue += Math.max(0, value);

        Ottrelite.counterEvent(`${meterId}${name}`, currentValue);

        return originalAdd(value, ...args);
      };

      return counter;
    };

    const originalCreateGauge = meter.createGauge.bind(meter);
    meter.createGauge = function (name, ...createArgs) {
      const gauge = originalCreateGauge(name, ...createArgs);

      const originalRecord = gauge.record.bind(gauge);
      gauge.record = function (value, ...args) {
        Ottrelite.counterEvent(`${meterId}/gauge/${name}`, value);

        return originalRecord(value, ...args);
      };

      return gauge;
    };

    const originalCreateUpDownCounter = meter.createUpDownCounter.bind(meter);
    meter.createUpDownCounter = function (name, ...createArgs) {
      const upDownCounter = originalCreateUpDownCounter(name, ...createArgs);

      let currentValue = 0;
      const originalAdd = upDownCounter.add.bind(upDownCounter);
      upDownCounter.add = function (value, ...args) {
        currentValue += value;

        Ottrelite.counterEvent(`${meterId}/gauge/${name}`, currentValue);

        return originalAdd(value, ...args);
      };

      return upDownCounter;
    };

    // eslint-disable-next-line consistent-this -- needed to reference the provider in hooked methods
    const meterProvider = this;

    const originalCreateObservableCounter =
      meter.createObservableCounter.bind(meter);
    meter.createObservableCounter = function (name, ...createArgs) {
      const observableCounter = originalCreateObservableCounter(
        name,
        ...createArgs
      );

      meterProvider.hookIntoObservableInstrument(observableCounter, {
        meterId,
        instrumentCategory: 'observableCounter',
        name,
      });

      return observableCounter;
    };

    const originalCreateObservableGauge =
      meter.createObservableGauge.bind(meter);
    meter.createObservableGauge = function (name, ...createArgs) {
      const observableGauge = originalCreateObservableGauge(
        name,
        ...createArgs
      );

      meterProvider.hookIntoObservableInstrument(observableGauge, {
        meterId,
        instrumentCategory: 'observableGauge',
        name,
      });

      return observableGauge;
    };

    const originalCreateObservableUpDownCounter =
      meter.createObservableUpDownCounter.bind(meter);
    meter.createObservableUpDownCounter = function (name, ...createArgs) {
      const observableUpDownCounter = originalCreateObservableUpDownCounter(
        name,
        ...createArgs
      );

      meterProvider.hookIntoObservableInstrument(observableUpDownCounter, {
        meterId,
        instrumentCategory: 'observableUpDownCounter',
        name,
      });

      return observableUpDownCounter;
    };

    this._meterStates.set(meterId, meter);

    return meter;
  }

  register() {
    metrics.setGlobalMeterProvider(this);
  }
}
