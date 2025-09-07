#pragma once

#include <optional>
#include <string>
#include <vector>

#include "Logger.hpp"
#include "OTELExporterAdapterUtils.hpp"
#include "SpanConverter.hpp"
#include "constants.hpp"
#include "types.hpp"

#include "opentelemetry/sdk/logs/batch_log_record_processor_options.h"
#include "opentelemetry/sdk/logs/exporter.h"
#include "opentelemetry/sdk/metrics/export/periodic_exporting_metric_reader.h"
#include "opentelemetry/sdk/metrics/push_metric_exporter.h"
#include "opentelemetry/sdk/trace/batch_span_processor_options.h"
#include "opentelemetry/sdk/trace/exporter.h"

namespace ottrelite::interop::otel
{
    class OttreliteInteropOTEL
    {
      public:
        /**
         * Registers a new OTEL span exporter.
         *
         * This only has effect on OTEL CPP TracerProvider if it is called before installGlobalOTELTracerProvider().
         *
         * @param exporter The span exporter to register
         */
        static void registerOTELSpanExporter(opentelemetry::sdk::trace::SpanExporter *exporter);

        /**
         * Unregisters a previously registered OTEL span exporter.
         *
         * This does **NOT** alter the already-installed TracerProvider in CPP API. This is meant to be invoked from the
         * destructor of exporter wrapper.
         *
         * @param exporter The span exporter to unregister
         */
        static void unregisterOTELSpanExporter(opentelemetry::sdk::trace::SpanExporter *exporter);

        /**
         * Registers a new OTEL metric exporter.
         *
         * This only has effect on OTEL CPP MetricProvider if it is called before installGlobalOTELMeterProvider().
         *
         * @param exporter The metric exporter to register
         */
        static void registerOTELMetricExporter(opentelemetry::sdk::metrics::PushMetricExporter *exporter);

        /**
         * Unregisters a previously registered OTEL metric exporter.
         *
         * This does **NOT** alter the already-installed MeterProvider in CPP API. This is meant to be invoked from the
         * destructor of exporter wrapper.
         *
         * @param exporter The metric exporter to unregister
         */
        static void unregisterOTELMetricExporter(opentelemetry::sdk::metrics::PushMetricExporter *exporter);

        /**
         * Registers a new OTEL log exporter.
         *
         * This only has effect on OTEL CPP LoggerProvider if it is called before installGlobalOTELLoggerProvider().
         *
         * @param exporter The log exporter to register
         */
        static void registerOTELLogRecordExporter(opentelemetry::sdk::logs::LogRecordExporter *exporter);

        /**
         * Unregisters a previously registered OTEL log exporter.
         *
         * This does **NOT** alter the already-installed LoggerProvider in CPP API. This is meant to be invoked from the
         * destructor of exporter wrapper.
         *
         * @param exporter The log exporter to unregister
         */
        static void unregisterOTELLogRecordExporter(opentelemetry::sdk::logs::LogRecordExporter *exporter);

        /**
         * Batch span processor options
         */
        static opentelemetry::sdk::trace::BatchSpanProcessorOptions otelBatchSpanProcessorOptions_;

        /**
         * Metric reader options
         */
        static opentelemetry::sdk::metrics::PeriodicExportingMetricReaderOptions otelMetricReaderOptions_;

        /**
         * Batch log record processor options
         */
        static opentelemetry::sdk::logs::BatchLogRecordProcessorOptions otelBatchLogRecordProcessorOptions_;

        /**
         * Registers the global OTEL TracerProvider using current configuration & registered exporters
         */
        static void installGlobalOTELTracerProvider();

        /**
         * Registers the global OTEL MeterProvider using current configuration & registered exporters
         */
        static void installGlobalOTELMeterProvider();

        /**
         * Registers the global OTEL LoggerProvider using current configuration & registered exporters
         */
        static void installGlobalOTELLoggerProvider();

        /**
         * Exports a batch of spans to the configured OTEL exporter.
         *
         * @param spans The spans to export
         * @return Result of the export operation: success if all exporters reported success, failure if at least one
         * exporter failed; the error code will be assigned the last failed exporter's error value
         */
        static ExportResult exportSpans(const std::vector<SerializedReadableSpan> &spans);

      protected:
        /**
         * Registered OTEL span exporters
         */
        static std::vector<opentelemetry::sdk::trace::SpanExporter *> otelSpanExporters_;

        /**
         * Registered OTEL metric exporters
         */
        static std::vector<opentelemetry::sdk::metrics::PushMetricExporter *> otelMetricExporters_;

        /**
         * Registered OTEL log record exporters
         */
        static std::vector<opentelemetry::sdk::logs::LogRecordExporter *> otelLogRecordExporters_;

        static logging::Logger logger_;

        /**
         * Whether installGlobalOTELTracerProvider() has already been called
         */
        static bool globalOTELTracerProviderInstalled_;

        /**
         * Whether installGlobalOTELMeterProvider() has already been called
         */
        static bool globalOTELMeterProviderInstalled_;

        /**
         * Whether installGlobalOTELLoggerProvider() has already been called
         */
        static bool globalOTELLoggerProviderInstalled_;
    };
} // namespace ottrelite::interop::otel
