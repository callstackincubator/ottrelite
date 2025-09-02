#include "OttreliteOTELInterop.hpp"

#include <algorithm>
#include <memory>
#include <ranges>

#include "OttreliteBackendRegistrar.hpp"

#include "opentelemetry/sdk/trace/batch_span_processor.h"
#include "opentelemetry/sdk/trace/batch_span_processor_factory.h"
#include "opentelemetry/sdk/trace/batch_span_processor_options.h"
#include "opentelemetry/sdk/trace/simple_processor_factory.h"
#include "opentelemetry/sdk/trace/tracer_provider.h"
#include "opentelemetry/sdk/trace/tracer_provider_factory.h"

#include "opentelemetry/sdk/metrics/export/periodic_exporting_metric_reader.h"
#include "opentelemetry/sdk/metrics/export/periodic_exporting_metric_reader_factory.h"
#include "opentelemetry/sdk/metrics/meter_context_factory.h"
#include "opentelemetry/sdk/metrics/meter_provider.h"
#include "opentelemetry/sdk/metrics/meter_provider_factory.h"

#include "opentelemetry/sdk/logs/batch_log_record_processor_factory.h"
#include "opentelemetry/sdk/logs/logger_provider_factory.h"
#include "opentelemetry/sdk/logs/processor.h"
#include "opentelemetry/sdk/logs/simple_log_record_processor_factory.h"

#include "opentelemetry/exporters/ostream/log_record_exporter_factory.h"
#include "opentelemetry/exporters/ostream/metric_exporter_factory.h"
#include "opentelemetry/exporters/ostream/span_exporter_factory.h"

#include "opentelemetry/logs/provider.h"
#include "opentelemetry/metrics/provider.h"
#include "opentelemetry/trace/provider.h"

namespace ottrelite::otel
{
    void OttreliteOTELInterop::registerOTELSpanExporter(opentelemetry::sdk::trace::SpanExporter *exporter)
    {
        if (globalOTELTracerProviderInstalled_)
        {
            logger_.warn()
                << "[OttreliteOTELInterop::registerOTELSpanExporter] OTEL TracerProvider has already been registered! "
                   "This call will have no effect on OTEL CPP TracerProvider (which will only use "
                   "previously-registered exporters).";
        }

        otelSpanExporters_.push_back(exporter);
    }

    void OttreliteOTELInterop::unregisterOTELSpanExporter(opentelemetry::sdk::trace::SpanExporter *exporter)
    {
        otelSpanExporters_.erase(std::remove(otelSpanExporters_.begin(), otelSpanExporters_.end(), exporter),
                                 otelSpanExporters_.end());
    }

    void OttreliteOTELInterop::registerOTELMetricExporter(opentelemetry::sdk::metrics::PushMetricExporter *exporter)
    {
        if (globalOTELMeterProviderInstalled_)
        {
            logger_.warn()
                << "[OttreliteOTELInterop::registerOTELMetricExporter] OTEL MeterProvider has already been registered! "
                   "This call will have no effect on OTEL CPP MeterProvider (which will only use "
                   "previously-registered exporters).";
        }

        otelMetricExporters_.push_back(exporter);
    }

    void OttreliteOTELInterop::unregisterOTELMetricExporter(opentelemetry::sdk::metrics::PushMetricExporter *exporter)
    {
        otelMetricExporters_.erase(std::remove(otelMetricExporters_.begin(), otelMetricExporters_.end(), exporter),
                                   otelMetricExporters_.end());
    }

    void OttreliteOTELInterop::registerOTELLogRecordExporter(opentelemetry::sdk::logs::LogRecordExporter *exporter)
    {
        if (globalOTELLoggerProviderInstalled_)
        {
            logger_.warn() << "[OttreliteOTELInterop::registerOTELLogRecordExporter] OTEL LoggerProvider has already "
                              "been registered! "
                              "This call will have no effect on OTEL CPP LoggerProvider (which will only use "
                              "previously-registered exporters).";
        }

        otelLogRecordExporters_.push_back(exporter);
    }

    void OttreliteOTELInterop::unregisterOTELLogRecordExporter(opentelemetry::sdk::logs::LogRecordExporter *exporter)
    {
        otelLogRecordExporters_.erase(
            std::remove(otelLogRecordExporters_.begin(), otelLogRecordExporters_.end(), exporter),
            otelLogRecordExporters_.end());
    }

    void OttreliteOTELInterop::installGlobalOTELTracerProvider()
    {
        if (globalOTELTracerProviderInstalled_)
        {
            logger_.error() << "[OttreliteOTELInterop::installGlobalOTELTracerProvider] OTEL TracerProvider has "
                               "already been registered! "
                               "Skipping this call.";
            return;
        }

        auto consoleExporter = opentelemetry::exporter::trace::OStreamSpanExporterFactory::Create();
        auto consoleProcessor =
            opentelemetry::sdk::trace::SimpleSpanProcessorFactory::Create(std::move(consoleExporter));

        std::vector<std::unique_ptr<opentelemetry::sdk::trace::SpanProcessor>> processors;
        processors.push_back(std::move(consoleProcessor));

        for (const auto exporterPtr : otelSpanExporters_)
        {
            auto otlpProcessor = opentelemetry::sdk::trace::BatchSpanProcessorFactory::Create(
                std::unique_ptr<opentelemetry::sdk::trace::SpanExporter>(exporterPtr), otelBatchSpanProcessorOptions_);

            processors.push_back(std::move(otlpProcessor));
        }

        std::shared_ptr<opentelemetry::trace::TracerProvider> provider =
            opentelemetry::sdk::trace::TracerProviderFactory::Create(std::move(processors));
        opentelemetry::trace::Provider::SetTracerProvider(provider);

        globalOTELTracerProviderInstalled_ = true;
    }

    void OttreliteOTELInterop::installGlobalOTELMeterProvider()
    {
        if (globalOTELMeterProviderInstalled_)
        {
            logger_.error() << "[OttreliteOTELInterop::installGlobalOTELMeterProvider] OTEL MeterProvider has already "
                               "been registered! "
                               "Skipping this call.";
            return;
        }

        auto consoleExporter = opentelemetry::exporter::metrics::OStreamMetricExporterFactory::Create(std::cout);
        auto consoleReader = opentelemetry::sdk::metrics::PeriodicExportingMetricReaderFactory::Create(
            std::move(consoleExporter), otelMetricReaderOptions_);

        auto context = opentelemetry::sdk::metrics::MeterContextFactory::Create();
        context->AddMetricReader(std::move(consoleReader));

        for (const auto exporterPtr : otelMetricExporters_)
        {
            auto reader = opentelemetry::sdk::metrics::PeriodicExportingMetricReaderFactory::Create(
                std::unique_ptr<opentelemetry::sdk::metrics::PushMetricExporter>(exporterPtr),
                otelMetricReaderOptions_);

            context->AddMetricReader(std::move(reader));
        }

        auto providerUniquePtr = opentelemetry::sdk::metrics::MeterProviderFactory::Create(std::move(context));
        std::shared_ptr<opentelemetry::metrics::MeterProvider> providerSharedPtr(std::move(providerUniquePtr));
        opentelemetry::metrics::Provider::SetMeterProvider(providerSharedPtr);

        globalOTELMeterProviderInstalled_ = true;
    }

    void OttreliteOTELInterop::installGlobalOTELLoggerProvider()
    {
        if (globalOTELLoggerProviderInstalled_)
        {
            logger_.error() << "[OttreliteOTELInterop::installGlobalOTELLoggerProvider] OTEL LoggerProvider has "
                               "already been registered! "
                               "Skipping this call.";
            return;
        }

        auto consoleExporter = opentelemetry::exporter::logs::OStreamLogRecordExporterFactory::Create();
        auto consoleProcessor =
            opentelemetry::sdk::logs::SimpleLogRecordProcessorFactory::Create(std::move(consoleExporter));

        std::vector<std::unique_ptr<opentelemetry::sdk::logs::LogRecordProcessor>> processors;
        processors.push_back(std::move(consoleProcessor));

        for (const auto exporterPtr : otelLogRecordExporters_)
        {
            auto otlpProcessor = opentelemetry::sdk::logs::BatchLogRecordProcessorFactory::Create(
                std::unique_ptr<opentelemetry::sdk::logs::LogRecordExporter>(exporterPtr),
                otelBatchLogRecordProcessorOptions_);

            processors.push_back(std::move(otlpProcessor));
        }

        std::shared_ptr<opentelemetry::logs::LoggerProvider> provider =
            opentelemetry::sdk::logs::LoggerProviderFactory::Create(std::move(processors));
        opentelemetry::logs::Provider::SetLoggerProvider(provider);

        globalOTELLoggerProviderInstalled_ = true;
    }

    ExportResult OttreliteOTELInterop::exportSpans(const std::vector<SerializedReadableSpan> &spans)
    {
        otel::ResourcesMemory resourcesMemory{};
        ExportResult commonResult{ExportResultCode::SUCCESS, std::nullopt};

        for (auto &exporter : otelSpanExporters_)
        {
            auto exporterResult = ::ottrelite::otel::OTELExporterAdapterUtils::exportInternalSpansReprsViaOTEL(
                resourcesMemory, spans, exporter);

            if (exporterResult.code != ExportResultCode::SUCCESS)
            {
                commonResult = ExportResult{ExportResultCode::FAILED, exporterResult.error};
            }
        }

        return commonResult;
    }

    std::vector<opentelemetry::sdk::trace::SpanExporter *> OttreliteOTELInterop::otelSpanExporters_;
    std::vector<opentelemetry::sdk::metrics::PushMetricExporter *> OttreliteOTELInterop::otelMetricExporters_;
    std::vector<opentelemetry::sdk::logs::LogRecordExporter *> OttreliteOTELInterop::otelLogRecordExporters_;

    opentelemetry::sdk::trace::BatchSpanProcessorOptions OttreliteOTELInterop::otelBatchSpanProcessorOptions_;
    opentelemetry::sdk::metrics::PeriodicExportingMetricReaderOptions OttreliteOTELInterop::otelMetricReaderOptions_;
    opentelemetry::sdk::logs::BatchLogRecordProcessorOptions OttreliteOTELInterop::otelBatchLogRecordProcessorOptions_;

    logging::Logger OttreliteOTELInterop::logger_{"OttreliteOTELInterop"};

    bool OttreliteOTELInterop::globalOTELTracerProviderInstalled_{false};
    bool OttreliteOTELInterop::globalOTELMeterProviderInstalled_{false};
    bool OttreliteOTELInterop::globalOTELLoggerProviderInstalled_{false};
} // namespace ottrelite::otel
