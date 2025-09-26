#include "ReactNativeOttreliteInteropOTEL.hpp"

#include <ranges>
#include <vector>

#include "OttreliteInteropOTEL.hpp"
#include "ReactNativeOttrelite/JSIUtils.hpp"
#include "ReactNativeOttrelite/Logger.hpp"
#include "ReactNativeOttrelite/OttreliteBackendRegistrar.hpp"

using namespace ::ottrelite;
using namespace ::ottrelite::backend;
using namespace ::ottrelite::interop::otel;

namespace margelo::nitro::ottrelite::interop::otel
{
    ReactNativeOttreliteInteropOTEL::ReactNativeOttreliteInteropOTEL() : HybridObject(TAG)
    {
    }

    void ReactNativeOttreliteInteropOTEL::configure(const OttreliteInteropOTELOptions &options)
    {
        if (options.cppTraceBatchSpanProcessorOptions.has_value())
        {
            const auto &traceBatchSpanProcessorOptions = options.cppTraceBatchSpanProcessorOptions.value();

            if (traceBatchSpanProcessorOptions.maxBatchSize.has_value())
            {
                ::ottrelite::interop::otel::OttreliteInteropOTEL::otelBatchSpanProcessorOptions_.max_export_batch_size =
                    traceBatchSpanProcessorOptions.maxBatchSize.value();
            }

            if (traceBatchSpanProcessorOptions.maxQueueSize.has_value())
            {
                ::ottrelite::interop::otel::OttreliteInteropOTEL::otelBatchSpanProcessorOptions_.max_queue_size =
                    traceBatchSpanProcessorOptions.maxQueueSize.value();
            }

            if (traceBatchSpanProcessorOptions.scheduleDelayMs.has_value())
            {
                ::ottrelite::interop::otel::OttreliteInteropOTEL::otelBatchSpanProcessorOptions_.schedule_delay_millis =
                    std::chrono::milliseconds(
                        static_cast<uint32_t>(traceBatchSpanProcessorOptions.scheduleDelayMs.value()));
            }
        }

        if (options.cppMetricReaderOptions.has_value())
        {
            const auto &cppMetricReaderOptions = options.cppMetricReaderOptions.value();

            if (cppMetricReaderOptions.exportIntervalMillis.has_value())
            {
                ::ottrelite::interop::otel::OttreliteInteropOTEL::otelMetricReaderOptions_.export_interval_millis =
                    std::chrono::milliseconds(
                        static_cast<uint32_t>(cppMetricReaderOptions.exportIntervalMillis.value()));
            }

            if (cppMetricReaderOptions.exportTimeoutMillis.has_value())
            {
                ::ottrelite::interop::otel::OttreliteInteropOTEL::otelMetricReaderOptions_.export_timeout_millis =
                    std::chrono::milliseconds(
                        static_cast<uint32_t>(cppMetricReaderOptions.exportTimeoutMillis.value()));
            }
        }

        if (options.cppBatchLogRecordProcessorOptions.has_value())
        {
            const auto &batchLogRecordProcessorOptions = options.cppBatchLogRecordProcessorOptions.value();

            if (batchLogRecordProcessorOptions.maxBatchSize.has_value())
            {
                ::ottrelite::interop::otel::OttreliteInteropOTEL::otelBatchLogRecordProcessorOptions_
                    .max_export_batch_size = batchLogRecordProcessorOptions.maxBatchSize.value();
            }

            if (batchLogRecordProcessorOptions.maxQueueSize.has_value())
            {
                ::ottrelite::interop::otel::OttreliteInteropOTEL::otelBatchLogRecordProcessorOptions_.max_queue_size =
                    batchLogRecordProcessorOptions.maxQueueSize.value();
            }

            if (batchLogRecordProcessorOptions.exportIntervalMillis.has_value())
            {
                ::ottrelite::interop::otel::OttreliteInteropOTEL::otelBatchLogRecordProcessorOptions_
                    .schedule_delay_millis = std::chrono::milliseconds(
                    static_cast<uint32_t>(batchLogRecordProcessorOptions.exportIntervalMillis.value()));
            }
        }
    }

    void ReactNativeOttreliteInteropOTEL::installGlobalOTELCPPTracerProvider()
    {
        ::ottrelite::interop::otel::OttreliteInteropOTEL::installGlobalOTELTracerProvider();
    }

    void ReactNativeOttreliteInteropOTEL::installGlobalOTELCPPMeterProvider()
    {
        ::ottrelite::interop::otel::OttreliteInteropOTEL::installGlobalOTELMeterProvider();
    }

    void ReactNativeOttreliteInteropOTEL::installGlobalOTELCPPLoggerProvider()
    {
        ::ottrelite::interop::otel::OttreliteInteropOTEL::installGlobalOTELLoggerProvider();
    }

    ExportResult ReactNativeOttreliteInteropOTEL::exportSpans(const std::vector<SerializedReadableSpan> &spans)
    {
        return OttreliteInteropOTEL::exportSpans(spans);
    }

    logging::Logger ReactNativeOttreliteInteropOTEL::logger_{"ReactNativeOttreliteInteropOTEL"};
} // namespace margelo::nitro::ottrelite::interop::otel
