#include "ReactNativeOttreliteInteropOTELExporterOTLP.hpp"

#include <chrono>
#include <functional>
#include <iostream>
#include <memory>
#include <string>
#include <tuple>
#include <unordered_map>
#include <vector>

#include "OTELExporterAdapterUtils.hpp"
#include "OttreliteInteropOTEL.hpp"
#include "ReactNativeOttrelite/Ottrelite.hpp"
#include "SpanConverter.hpp"

#include "ExportResult.hpp"
#include "SerializedReadableSpan.hpp"
#include "SpanKind.hpp"
#include "SpanStatus.hpp"

#include "opentelemetry/exporters/otlp/otlp_http_exporter_factory.h"
#include "opentelemetry/exporters/otlp/otlp_http_log_record_exporter_factory.h"
#include "opentelemetry/exporters/otlp/otlp_http_metric_exporter_factory.h"

#include "opentelemetry/sdk/logs/processor.h"
#include "opentelemetry/sdk/metrics/aggregation/default_aggregation.h"
#include "opentelemetry/sdk/trace/processor.h"

namespace margelo::nitro::ottrelite::interop::otel
{
    ReactNativeOttreliteInteropOTELExporterOTLP::ReactNativeOttreliteInteropOTELExporterOTLP() : HybridObject(TAG)
    {
    }

    ReactNativeOttreliteInteropOTELExporterOTLP::~ReactNativeOttreliteInteropOTELExporterOTLP()
    {
        // unregister the exporter with Ottrelite
        ::ottrelite::interop::otel::OttreliteInteropOTEL::unregisterOTELSpanExporter(otlpExporterPtr_);
        ::ottrelite::interop::otel::OttreliteInteropOTEL::unregisterOTELMetricExporter(metricExporterPtr_);
        ::ottrelite::interop::otel::OttreliteInteropOTEL::unregisterOTELLogRecordExporter(logExporterPtr_);
    }

    void ReactNativeOttreliteInteropOTELExporterOTLP::initExporter(const OTLPExporterConfig &config)
    {
        initTracer(config);
        initMetrics(config);
        initLogger(config);
    }

    void ReactNativeOttreliteInteropOTELExporterOTLP::initTracer(const OTLPExporterConfig &config)
    {
        const OTLPExporterProtocol protocol = config.protocol.value_or(OTLPExporterProtocol::HTTP_PROTOBUF);
        // FIXME: support grpc exporter
        if (protocol == OTLPExporterProtocol::GRPC)
        {
            throw std::runtime_error("GRPC protocol is not supported yet");
        }

        opentelemetry::exporter::otlp::OtlpHttpExporterOptions otlpOptions;
        otlpOptions.url = suffixEndpoint(config.endpoint, "traces");
        CommonOTLPExporterOptionsVariant otlpOptionsVariant = std::ref(otlpOptions);
        fillCommonConfigAttrs(config, otlpOptionsVariant);

        auto otlpExporterUnique = opentelemetry::exporter::otlp::OtlpHttpExporterFactory::Create(otlpOptions);

        // store the exporter in the instance attribute before moving it
        otlpExporterPtr_ = otlpExporterUnique.release();

        // register the exporter with Ottrelite
        ::ottrelite::interop::otel::OttreliteInteropOTEL::registerOTELSpanExporter(otlpExporterPtr_);
    }

    void ReactNativeOttreliteInteropOTELExporterOTLP::initMetrics(const OTLPExporterConfig &config)
    {
        opentelemetry::exporter::otlp::OtlpHttpMetricExporterOptions otlpOptions;
        otlpOptions.url = suffixEndpoint(config.endpoint, "metrics");
        CommonOTLPExporterOptionsVariant otlpOptionsVariant = std::ref(otlpOptions);
        fillCommonConfigAttrs(config, otlpOptionsVariant);

        auto otlpExporter = opentelemetry::exporter::otlp::OtlpHttpMetricExporterFactory::Create(otlpOptions);

        // store the exporter in the instance attribute before moving it
        metricExporterPtr_ = otlpExporter.release();

        // register the exporter with Ottrelite
        ::ottrelite::interop::otel::OttreliteInteropOTEL::registerOTELMetricExporter(metricExporterPtr_);
    }

    void ReactNativeOttreliteInteropOTELExporterOTLP::initLogger(const OTLPExporterConfig &config)
    {
        opentelemetry::exporter::otlp::OtlpHttpLogRecordExporterOptions otlpOptions;
        otlpOptions.url = suffixEndpoint(config.endpoint, "logs");
        CommonOTLPExporterOptionsVariant otlpOptionsVariant = std::ref(otlpOptions);
        fillCommonConfigAttrs(config, otlpOptionsVariant);

        auto otlpExporter = opentelemetry::exporter::otlp::OtlpHttpLogRecordExporterFactory::Create(otlpOptions);

        // store the exporter in the instance attribute before moving it
        logExporterPtr_ = otlpExporter.release();

        // register the exporter with Ottrelite
        ::ottrelite::interop::otel::OttreliteInteropOTEL::registerOTELLogRecordExporter(logExporterPtr_);
    }

    void ReactNativeOttreliteInteropOTELExporterOTLP::fillCommonConfigAttrs(const OTLPExporterConfig &source,
                                                                            CommonOTLPExporterOptionsVariant &target)
    {
        std::visit(
            [&source](auto &targetOpt) {
                if (source.caCertString.has_value())
                {
                    targetOpt.ssl_ca_cert_string = source.clientCertString.value();
                }

                if (source.clientCertString.has_value())
                {
                    targetOpt.ssl_client_cert_string = source.clientCertString.value();
                }

                if (source.compression.has_value())
                {
                    switch (source.compression.value())
                    {
                    case OTLPExporterCompression::GZIP:
                        targetOpt.compression = "gzip";
                        break;

                    case OTLPExporterCompression::NONE:
                    default:
                        targetOpt.compression = "none";
                        break;
                    }
                }

                if (source.headers.has_value())
                {
                    opentelemetry::exporter::otlp::OtlpHeaders targetHeaders;

                    for (const auto &[key, value] : source.headers.value())
                    {
                        targetHeaders.emplace(key, value);
                    }

                    targetOpt.http_headers = std::move(targetHeaders);
                }

                if (source.timeoutMillis.has_value())
                {
                    targetOpt.timeout = std::chrono::milliseconds(static_cast<uint32_t>(source.timeoutMillis.value()));
                }

                if (source.skipInsecureSSLVerification.has_value())
                {
                    targetOpt.ssl_insecure_skip_verify = !source.skipInsecureSSLVerification.value();
                }

                if (source.retryPolicyOptions.has_value())
                {
                    const auto &retryPolicyOptions = source.retryPolicyOptions.value();

                    if (retryPolicyOptions.maxAttempts.has_value())
                    {
                        targetOpt.retry_policy_max_attempts = retryPolicyOptions.maxAttempts.value();
                    }

                    if (retryPolicyOptions.maxBackoffSeconds.has_value())
                    {
                        targetOpt.retry_policy_max_backoff =
                            std::chrono::duration<float>(retryPolicyOptions.maxBackoffSeconds.value());
                    }

                    if (retryPolicyOptions.initialBackoffSeconds.has_value())
                    {
                        targetOpt.retry_policy_initial_backoff =
                            std::chrono::duration<float>(retryPolicyOptions.initialBackoffSeconds.value());
                    }

                    if (retryPolicyOptions.backoffMultiplier.has_value())
                    {
                        targetOpt.retry_policy_backoff_multiplier = retryPolicyOptions.backoffMultiplier.value();
                    }
                }
            },
            target);
    }

    std::string ReactNativeOttreliteInteropOTELExporterOTLP::suffixEndpoint(const std::string &endpoint,
                                                                            const std::string &suffix)
    {
        if (endpoint.ends_with("/"))
        {
            return endpoint + suffix;
        }

        return endpoint + "/" + suffix;
    }

    void ReactNativeOttreliteInteropOTELExporterOTLP::exportSpans(
        const std::vector<SerializedReadableSpan> &spans,
        const std::function<void(const ExportResult & /* result */)> &resultCallback)
    {
        // converted Resource-s must be kept in memory for the time of export
        ::ottrelite::interop::otel::ResourcesMemory resourcesMemory{};

        resultCallback(::ottrelite::interop::otel::OTELExporterAdapterUtils::exportInternalSpansReprsViaOTEL(
            resourcesMemory, spans, otlpExporterPtr_));
    }

    std::shared_ptr<Promise<void>> ReactNativeOttreliteInteropOTELExporterOTLP::shutdown()
    {
        return Promise<void>::async([this]() -> void {
            if (otlpExporterPtr_)
            {
                otlpExporterPtr_->Shutdown();
                otlpExporterPtr_ = nullptr;
            }
        });
    }

    std::shared_ptr<Promise<void>> ReactNativeOttreliteInteropOTELExporterOTLP::forceFlush()
    {
        return Promise<void>::async([this]() -> void {
            if (otlpExporterPtr_)
            {
                otlpExporterPtr_->ForceFlush();
            }
        });
    }
} // namespace margelo::nitro::ottrelite::interop::otel
