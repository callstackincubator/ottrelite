#pragma once

#include <memory>

#include "SpanConverter.hpp"

#include "ExportResult.hpp"
#include "SerializedReadableSpan.hpp"

#include "opentelemetry/sdk/trace/exporter.h"

namespace ottrelite::interop::otel
{
    using margelo::nitro::ottrelite::interop::otel::ExportResult;
    using margelo::nitro::ottrelite::interop::otel::ExportResultCode;
    using margelo::nitro::ottrelite::interop::otel::SerializedReadableSpan;

    class OTELExporterAdapterUtils
    {
      public:
        static ExportResult exportInternalSpansReprsViaOTEL(ResourcesMemory &resourcesMemory,
                                                            const std::vector<SerializedReadableSpan> &spans,
                                                            opentelemetry::sdk::trace::SpanExporter *&otelExporterPtr);
    };
} // namespace ottrelite::interop::otel
