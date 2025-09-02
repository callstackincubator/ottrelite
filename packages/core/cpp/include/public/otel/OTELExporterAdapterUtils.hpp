#pragma once

#include <memory>

#include "SpanConverter.hpp"

#include "ExportResult.hpp"
#include "SerializedReadableSpan.hpp"

#include "opentelemetry/sdk/trace/exporter.h"

namespace ottrelite::otel
{
    using margelo::nitro::ottrelite::ExportResult;
    using margelo::nitro::ottrelite::ExportResultCode;
    using margelo::nitro::ottrelite::SerializedReadableSpan;

    class OTELExporterAdapterUtils
    {
      public:
        static ExportResult exportInternalSpansReprsViaOTEL(ResourcesMemory &resourcesMemory,
                                                            const std::vector<SerializedReadableSpan> &spans,
                                                            opentelemetry::sdk::trace::SpanExporter *&otelExporterPtr);
    };
} // namespace ottrelite::otel
