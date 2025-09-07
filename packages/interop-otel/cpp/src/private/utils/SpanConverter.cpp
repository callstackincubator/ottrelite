#include "SpanConverter.hpp"

#include <chrono>
#include <iostream>
#include <memory>
#include <string>
#include <variant>
#include <vector>

#include "BoolArrayContainer.hpp"
#include "InstrumentationScopeStore.hpp"

#include "SerializedReadableSpan.hpp"
#include "SpanKind.hpp"
#include "SpanStatus.hpp"

#include "opentelemetry/common/attribute_value.h"
#include "opentelemetry/common/timestamp.h"

#include "opentelemetry/sdk/resource/resource.h"
#include "opentelemetry/sdk/trace/span_data.h"

#include "opentelemetry/trace/span_context.h"
#include "opentelemetry/trace/span_id.h"
#include "opentelemetry/trace/trace_flags.h"
#include "opentelemetry/trace/trace_id.h"
#include "opentelemetry/trace/trace_state.h"

#include "opentelemetry/nostd/span.h"
#include "opentelemetry/nostd/string_view.h"

#include "opentelemetry/semconv/telemetry_attributes.h"

#include "opentelemetry/exporters/otlp/otlp_recordable.h"

namespace ottrelite::interop::otel
{
    opentelemetry::sdk::trace::Recordable *SpanConverter::convertSpan(
        const margelo::nitro::ottrelite::interop::otel::SerializedReadableSpan &serializedSpan,
        ResourcesMemory &resourcesMemory)
    {
        auto recordable = new opentelemetry::exporter::otlp::OtlpRecordable();

        // attributes
        for (const auto &[key, value] : serializedSpan.attributes)
        {
            convertAndSetAttribute(*recordable, key, value);
        }

        // duration
        if (serializedSpan.duration.has_value())
        {
            const auto &duration = serializedSpan.duration.value();
            recordable->SetDuration(convertHrtimeToNanoseconds(duration));
        }

        // events
        for (const auto &event : serializedSpan.events)
        {
            convertAndAddEvent(*recordable, event);
        }

        // spanContext & parentSpanContext
        const opentelemetry::trace::SpanId parentSpanId =
            serializedSpan.parentSpanContext.has_value()
                ? convertSpanId(serializedSpan.parentSpanContext.value().spanId)
                : opentelemetry::trace::SpanId{};
        recordable->SetIdentity(convertSpanContext(serializedSpan.spanContext), parentSpanId);

        // instrumentationScope
        const auto &instrumentationScope = InstrumentationScopeStore::getOrCreate(
            serializedSpan.instrumentationScope.name, serializedSpan.instrumentationScope.version.value_or(""),
            serializedSpan.instrumentationScope.schemaUrl.value_or(""));
        recordable->SetInstrumentationScope(instrumentationScope);

        // kind
        recordable->SetSpanKind(convertSpanKind(serializedSpan.kind));

        // links
        for (const auto &link : serializedSpan.links)
        {
            convertAndAddLink(*recordable, link);
        }

        // name
        recordable->SetName(serializedSpan.name);

        // startTime
        recordable->SetStartTime(
            opentelemetry::common::SystemTimestamp{convertHrtimeToNanoseconds(serializedSpan.startTime)});

        // endTime
        recordable->span().set_end_time_unix_nano(convertHrtimeToNanoseconds(serializedSpan.endTime).count());

        // droppedEventsCount
        if (serializedSpan.droppedEventsCount.has_value())
        {
            recordable->span().set_dropped_events_count(
                static_cast<uint32_t>(serializedSpan.droppedEventsCount.value()));
        }

        // droppedAttributesCount
        if (serializedSpan.droppedAttributesCount.has_value())
        {
            recordable->span().set_dropped_attributes_count(
                static_cast<uint32_t>(serializedSpan.droppedAttributesCount.value()));
        }

        // droppedLinksCount
        if (serializedSpan.droppedLinksCount.has_value())
        {
            recordable->span().set_dropped_links_count(static_cast<uint32_t>(serializedSpan.droppedLinksCount.value()));
        }

        // status
        recordable->SetStatus(convertSpanStatusCode(serializedSpan.status.code),
                              serializedSpan.status.message.value_or(""));

        // resource
        auto &res = resourcesMemory.emplace_back(convertResource(serializedSpan.resource));
        recordable->SetResource(res);

        return recordable;
    }

    std::vector<std::unique_ptr<opentelemetry::sdk::trace::Recordable>> SpanConverter::convertSpans(
        const std::vector<margelo::nitro::ottrelite::interop::otel::SerializedReadableSpan> &spans,
        ResourcesMemory &resourcesMemory)
    {
        std::vector<std::unique_ptr<opentelemetry::sdk::trace::Recordable>> recordables;
        recordables.reserve(spans.size());

        for (const auto &span : spans)
        {
            recordables.emplace_back(convertSpan(span, resourcesMemory));
        }

        return recordables;
    }

    opentelemetry::trace::SpanId SpanConverter::convertSpanId(const std::string &hexSpanId)
    {
        auto spanId = opentelemetry::trace::SpanId{};

        // parse hex string to SpanId (16 hex chars = 8 bytes)
        if (hexSpanId.length() == 16)
        {
            uint8_t spanBytes[8] = {0};
            // convert hex string to bytes
            for (size_t i = 0; i < 8; ++i)
            {
                std::string byteStr = hexSpanId.substr(i * 2, 2);
                spanBytes[i] = static_cast<uint8_t>(std::stoul(byteStr, nullptr, 16));
            }
            spanId = opentelemetry::trace::SpanId{spanBytes};
        }

        return spanId;
    }

    opentelemetry::trace::SpanKind SpanConverter::convertSpanKind(
        margelo::nitro::ottrelite::interop::otel::SpanKind kind)
    {
        switch (kind)
        {
        case margelo::nitro::ottrelite::interop::otel::SpanKind::INTERNAL:
            return opentelemetry::trace::SpanKind::kInternal;

        case margelo::nitro::ottrelite::interop::otel::SpanKind::SERVER:
            return opentelemetry::trace::SpanKind::kServer;

        case margelo::nitro::ottrelite::interop::otel::SpanKind::CLIENT:
            return opentelemetry::trace::SpanKind::kClient;

        case margelo::nitro::ottrelite::interop::otel::SpanKind::PRODUCER:
            return opentelemetry::trace::SpanKind::kProducer;

        case margelo::nitro::ottrelite::interop::otel::SpanKind::CONSUMER:
            return opentelemetry::trace::SpanKind::kConsumer;

        default:
            return opentelemetry::trace::SpanKind::kInternal;
        }
    }

    opentelemetry::trace::StatusCode SpanConverter::convertSpanStatusCode(
        margelo::nitro::ottrelite::interop::otel::SpanStatusCode statusCode)
    {
        switch (statusCode)
        {
        case margelo::nitro::ottrelite::interop::otel::SpanStatusCode::OK:
            return opentelemetry::trace::StatusCode::kOk;

        case margelo::nitro::ottrelite::interop::otel::SpanStatusCode::ERROR:
            return opentelemetry::trace::StatusCode::kError;

        default:
        case margelo::nitro::ottrelite::interop::otel::SpanStatusCode::UNSET:
            return opentelemetry::trace::StatusCode::kUnset;
        }
    }

    opentelemetry::sdk::resource::Resource SpanConverter::convertResource(
        const margelo::nitro::ottrelite::interop::otel::NitroFixedResource &nitroResource)
    {
        // if needed, await async attributes
        if (nitroResource.waitForAsyncAttributes.has_value())
        {
            nitroResource.waitForAsyncAttributes.value()();
        }

        // map attributes
        auto attributes = opentelemetry::sdk::common::AttributeMap{};

        if (nitroResource.attributes.has_value())
        {
            for (const auto &[key, value] : nitroResource.attributes.value())
            {
                auto attributeValue = convertVariantToAttributeValue(value);
                attributes.SetAttribute(key, attributeValue);
            }
        }

        auto resource = opentelemetry::sdk::resource::Resource::Create(attributes);
        auto &finalAttributesRW =
            const_cast<opentelemetry::sdk::resource::ResourceAttributes &>(resource.GetAttributes());
        if (nitroResource.attributes.has_value())
        {
            auto &nitroAttributes = nitroResource.attributes.value();
            auto it = nitroAttributes.find(opentelemetry::semconv::telemetry::kTelemetrySdkLanguage);
            if (it != nitroAttributes.end())
            {
                finalAttributesRW.SetAttribute(opentelemetry::semconv::telemetry::kTelemetrySdkLanguage,
                                               convertVariantToAttributeValue(it->second));
            }

            if (nitroAttributes.find(opentelemetry::semconv::telemetry::kTelemetrySdkName) != nitroAttributes.end())
            {
                finalAttributesRW.SetAttribute(opentelemetry::semconv::telemetry::kTelemetrySdkName, "ottrelite");
            }

            if (nitroAttributes.find(opentelemetry::semconv::telemetry::kTelemetrySdkVersion) != nitroAttributes.end())
            {
                finalAttributesRW.SetAttribute(opentelemetry::semconv::telemetry::kTelemetrySdkVersion,
                                               OTTRELITE_INTEROP_OTEL_VERSION);
            }
        }

        return resource;
    }

    void SpanConverter::convertAndSetAttribute(opentelemetry::sdk::trace::Recordable &recordable,
                                               const std::string &key,
                                               const std::variant<std::string, double, bool, std::vector<std::string>,
                                                                  std::vector<double>, std::vector<bool>> &value)
    {
        auto attributeValue = convertVariantToAttributeValue(value);
        recordable.SetAttribute(key, attributeValue);
    }

    opentelemetry::trace::SpanContext SpanConverter::convertSpanContext(
        const margelo::nitro::ottrelite::interop::otel::SpanContextWithSerializedTraceState &serializedContext)
    {
        // convert string hex IDs to binary format
        auto traceId = opentelemetry::trace::TraceId{};
        auto spanId = convertSpanId(serializedContext.spanId);

        // parse hex string to TraceId (32 hex chars = 16 bytes)
        if (serializedContext.traceId.length() == 32)
        {
            uint8_t traceBytes[16] = {0};
            // convert hex string to bytes
            for (size_t i = 0; i < 16; ++i)
            {
                std::string byteStr = serializedContext.traceId.substr(i * 2, 2);
                traceBytes[i] = static_cast<uint8_t>(std::stoul(byteStr, nullptr, 16));
            }
            traceId = opentelemetry::trace::TraceId{traceBytes};
        }

        auto traceFlags = opentelemetry::trace::TraceFlags{static_cast<uint8_t>(serializedContext.traceFlags)};
        bool isRemote = serializedContext.isRemote.value_or(false);

        return opentelemetry::trace::SpanContext{
            traceId, spanId, traceFlags, isRemote,
            serializedContext.traceState.has_value()
                ? opentelemetry::trace::TraceState::FromHeader(serializedContext.traceState.value())
                : opentelemetry::trace::TraceState::GetDefault()};
    }

    void SpanConverter::convertAndAddEvent(opentelemetry::sdk::trace::Recordable &recordable,
                                           const margelo::nitro::ottrelite::interop::otel::NitroFixedTimedEvent &event)
    {
        // convert time tuple (seconds, nanoseconds) to SystemTimestamp
        const auto &timeValue = event.time;
        auto timestamp = opentelemetry::common::SystemTimestamp{
            std::chrono::duration_cast<std::chrono::system_clock::duration>(convertHrtimeToNanoseconds(timeValue))};

        if (event.attributes.has_value())
        {
            // create attributes map with proper OpenTelemetry types
            std::vector<std::pair<opentelemetry::nostd::string_view, opentelemetry::common::AttributeValue>> kvPairs;
            for (const auto &[key, value] : event.attributes.value())
            {
                auto attributeValue = convertVariantToAttributeValue(value);
                kvPairs.emplace_back(opentelemetry::nostd::string_view{key}, attributeValue);
            }

            auto attributes = opentelemetry::common::KeyValueIterableView<
                std::vector<std::pair<opentelemetry::nostd::string_view, opentelemetry::common::AttributeValue>>>{
                kvPairs};
            recordable.AddEvent(opentelemetry::nostd::string_view{event.name}, timestamp, attributes);
        }
        else
        {
            // no attributes
            recordable.AddEvent(opentelemetry::nostd::string_view{event.name}, timestamp,
                                opentelemetry::sdk::GetEmptyAttributes());
        }
    }

    void SpanConverter::convertAndAddLink(opentelemetry::sdk::trace::Recordable &recordable,
                                          const margelo::nitro::ottrelite::interop::otel::NitroFixedLink &link)
    {
        auto spanContext = convertSpanContext(link.context);

        if (link.attributes.has_value())
        {
            // create attributes map with proper OpenTelemetry types
            std::vector<std::pair<opentelemetry::nostd::string_view, opentelemetry::common::AttributeValue>> kvPairs;
            for (const auto &[key, value] : link.attributes.value())
            {
                auto attributeValue = convertVariantToAttributeValue(value);
                kvPairs.emplace_back(opentelemetry::nostd::string_view{key}, attributeValue);
            }

            auto attributes = opentelemetry::common::KeyValueIterableView<
                std::vector<std::pair<opentelemetry::nostd::string_view, opentelemetry::common::AttributeValue>>>{
                kvPairs};
            recordable.AddLink(spanContext, attributes);
        }
        else
        {
            // no attributes
            recordable.AddLink(spanContext, opentelemetry::sdk::GetEmptyAttributes());
        }
    }

    opentelemetry::common::AttributeValue SpanConverter::convertVariantToAttributeValue(
        const std::variant<std::string, double, bool, std::vector<std::string>, std::vector<double>, std::vector<bool>>
            &value)
    {
        return std::visit(
            [](const auto &v) -> opentelemetry::common::AttributeValue {
                using T = std::decay_t<decltype(v)>;
                if constexpr (std::is_same_v<T, std::string>)
                {
                    // Convert to nostd::string_view as required by OpenTelemetry
                    return opentelemetry::nostd::string_view{v};
                }
                else if constexpr (std::is_same_v<T, double>)
                {
                    // double is directly supported
                    return v;
                }
                else if constexpr (std::is_same_v<T, bool>)
                {
                    // bool is directly supported
                    return v;
                }
                else if constexpr (std::is_same_v<T, std::vector<std::string>>)
                {
                    // convert to nostd::span<const nostd::string_view> for OpenTelemetry
                    std::vector<opentelemetry::nostd::string_view> stringViews;
                    stringViews.clear();
                    stringViews.reserve(v.size());
                    for (const auto &str : v)
                    {
                        stringViews.emplace_back(opentelemetry::nostd::string_view{str});
                    }
                    return opentelemetry::nostd::span<const opentelemetry::nostd::string_view>{stringViews.data(),
                                                                                               stringViews.size()};
                }
                else if constexpr (std::is_same_v<T, std::vector<double>>)
                {
                    // convert to nostd::span<const double> for OpenTelemetry
                    std::vector<double> doubleVector;
                    doubleVector = v;
                    return opentelemetry::nostd::span<const double>{doubleVector.data(), doubleVector.size()};
                }
                else if constexpr (std::is_same_v<T, std::vector<bool>>)
                {
                    // since std::vector<bool> has special implementation, storing the memory in continuous memory
                    // convert to a regular vector first, then create nostd::span
                    utils::BoolArrayContainer boolContainer;
                    boolContainer.resize(v.size());
                    for (size_t i = 0; i < v.size(); ++i)
                    {
                        boolContainer[i] = v[i];
                    }
                    return opentelemetry::nostd::span<const bool>{boolContainer.data(), boolContainer.size()};
                }
                else
                {
                    // fallback to empty string for unknown types
                    std::cout << "[ReactNativeOttreliteInteropOTELExporterOTLP::convertVariantToAttributeValue] "
                                 "Unknown variant "
                                 "type received: "
                              << typeid(value).name() << std::endl;

                    return opentelemetry::nostd::string_view{""};
                }
            },
            value);
    }
}; // namespace ottrelite::interop::otel
