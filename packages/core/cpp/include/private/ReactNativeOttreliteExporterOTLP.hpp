#pragma once

#include <memory>
#include <string>
#include <utility>
#include <variant>

#include "HybridReactNativeOttreliteExporterOTLPSpec.hpp"

#include "opentelemetry/exporters/otlp/otlp_http_exporter_options.h"
#include "opentelemetry/exporters/otlp/otlp_http_log_record_exporter_options.h"
#include "opentelemetry/exporters/otlp/otlp_http_metric_exporter_options.h"

#include "opentelemetry/sdk/logs/exporter.h"
#include "opentelemetry/sdk/metrics/push_metric_exporter.h"
#include "opentelemetry/sdk/trace/exporter.h"

namespace margelo::nitro::ottrelite
{
    using CommonOTLPExporterOptionsVariant =
        std::variant<opentelemetry::exporter::otlp::OtlpHttpExporterOptions,
                     opentelemetry::exporter::otlp::OtlpHttpMetricExporterOptions,
                     opentelemetry::exporter::otlp::OtlpHttpLogRecordExporterOptions>;

    class ReactNativeOttreliteExporterOTLP : public HybridReactNativeOttreliteExporterOTLPSpec
    {
      public:
        /**
         * Constructor for the ReactNativeOttrelite Nitro Module.
         */
        ReactNativeOttreliteExporterOTLP();

        ~ReactNativeOttreliteExporterOTLP();

        void initExporter(const OTLPExporterConfig &config) override;

        void exportSpans(const std::vector<SerializedReadableSpan> &spans,
                         const std::function<void(const ExportResult & /* result */)> &resultCallback) override;
        std::shared_ptr<Promise<void>> shutdown() override;
        std::shared_ptr<Promise<void>> forceFlush() override;

      private:
        void initTracer(const OTLPExporterConfig &config);
        void initMetrics(const OTLPExporterConfig &config);
        void initLogger(const OTLPExporterConfig &config);

        void fillCommonConfigAttrs(const OTLPExporterConfig &source, CommonOTLPExporterOptionsVariant &target);

        std::string suffixEndpoint(const std::string &endpoint, const std::string &suffix);

        opentelemetry::sdk::trace::SpanExporter *otlpExporterPtr_;
        opentelemetry::sdk::metrics::PushMetricExporter *metricExporterPtr_;
        opentelemetry::sdk::logs::LogRecordExporter *logExporterPtr_;
    };
} // namespace margelo::nitro::ottrelite
