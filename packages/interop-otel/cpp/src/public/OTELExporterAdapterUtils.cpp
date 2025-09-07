#include "OTELExporterAdapterUtils.hpp"

#include "OttreliteInteropOTEL.hpp"
#include "SpanConverter.hpp"

#include "opentelemetry/nostd/span.h"
#include "opentelemetry/sdk/trace/recordable.h"

namespace ottrelite::interop::otel
{
    ExportResult OTELExporterAdapterUtils::exportInternalSpansReprsViaOTEL(
        ResourcesMemory &resourcesMemory, const std::vector<SerializedReadableSpan> &spans,
        opentelemetry::sdk::trace::SpanExporter *&otelExporterPtr)
    {
        if (otelExporterPtr == nullptr)
        {
            // exporter not initialized
            return ExportResult{ExportResultCode::FAILED, std::nullopt};
        }

        try
        {
            // convert internal span reprs to OpenTelemetry recordables
            auto recordables = ::ottrelite::interop::otel::SpanConverter::convertSpans(spans, resourcesMemory);

            // create a span view for the OTLP exporter
            opentelemetry::nostd::span<std::unique_ptr<opentelemetry::sdk::trace::Recordable>> spanView(
                recordables.data(), recordables.size());

            // call the OTLP exporter
            auto otelResult = otelExporterPtr->Export(spanView);

            // convert OpenTelemetry result to our result format
            switch (otelResult)
            {
            case opentelemetry::sdk::common::ExportResult::kSuccess:
                return ExportResult{ExportResultCode::SUCCESS, std::nullopt};

            case opentelemetry::sdk::common::ExportResult::kFailure:
            default:
                return ExportResult{ExportResultCode::FAILED, std::nullopt};
            }
        }
        catch (const std::exception &e)
        {
            // handle any exceptions
            return ExportResult{ExportResultCode::FAILED, std::make_exception_ptr(e)};
        }
        catch (...)
        {
            // handle unknown errors
            return ExportResult{ExportResultCode::FAILED, std::current_exception()};
        }
    }
} // namespace ottrelite::interop::otel
