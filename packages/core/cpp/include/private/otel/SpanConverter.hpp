#pragma once

#include <chrono>
#include <iostream>
#include <memory>
#include <string>
#include <variant>
#include <vector>

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

#include "opentelemetry/nostd/span.h"
#include "opentelemetry/nostd/string_view.h"

namespace ottrelite::otel
{
    using ResourcesMemory = std::vector<opentelemetry::sdk::resource::Resource>;

    /**
     * Helper class to convert SerializedReadableSpan to OpenTelemetry SpanData
     */
    class SpanConverter
    {
      public:
        /**
         * Converts a SerializedReadableSpan to an OpenTelemetry SpanData
         *
         * @param serializedSpan The input SerializedReadableSpan
         * @param resourcesMemory The memory pool for resources
         * @return A pointer to the created SpanData
         */
        static opentelemetry::sdk::trace::Recordable *convertSpan(
            const margelo::nitro::ottrelite::SerializedReadableSpan &serializedSpan, ResourcesMemory &resourcesMemory);

        /**
         * Converts a vector of spans to a vector of recordables
         * @param spans The input vector of SerializedReadableSpan
         * @param resourcesMemory The memory pool for resources
         * @return A vector of unique_ptr to Recordable
         */
        static std::vector<std::unique_ptr<opentelemetry::sdk::trace::Recordable>> convertSpans(
            const std::vector<margelo::nitro::ottrelite::SerializedReadableSpan> &spans,
            ResourcesMemory &resourcesMemory);

      private:
        /**
         * Converts an hrtime tuple (seconds, nanoseconds) to std::chrono::nanoseconds.
         * @param hrtime The hrtime tuple where first element is seconds and second is nanoseconds
         * @return std::chrono::nanoseconds representing the total time
         */
        static std::chrono::nanoseconds convertHrtimeToNanoseconds(const std::tuple<double, double> &hrtime)
        {
            return std::chrono::nanoseconds(static_cast<long long>(std::get<0>(hrtime) * 1e9 + std::get<1>(hrtime)));
        }

        /**
         * Converts a hex string SpanId to OpenTelemetry SpanId.
         * @param hexSpanId The hex string representation of the span ID (16 hex chars = 8 bytes)
         * @return OpenTelemetry SpanId object
         */
        static opentelemetry::trace::SpanId convertSpanId(const std::string &hexSpanId);

        /**
         * Converts a span kind from the Ottrelite format to the OpenTelemetry format.
         * @param kind The input span kind in Ottrelite format
         * @return The corresponding span kind in OpenTelemetry format
         */
        static opentelemetry::trace::SpanKind convertSpanKind(margelo::nitro::ottrelite::SpanKind kind);

        /**
         * Converts a span status code from the Ottrelite format to the OpenTelemetry format.
         * @param statusCode The input span status code in Ottrelite format
         * @return The corresponding span status code in OpenTelemetry format
         */
        static opentelemetry::trace::StatusCode convertSpanStatusCode(
            margelo::nitro::ottrelite::SpanStatusCode statusCode);

        /**
         * Converts a Resource from the Ottrelite format to the OpenTelemetry format.
         * @param nitroResource The input resource in Ottrelite format
         * @return The corresponding resource in OpenTelemetry format
         */
        static opentelemetry::sdk::resource::Resource convertResource(
            const margelo::nitro::ottrelite::NitroFixedResource &nitroResource);

        /**
         * Converts and sets an attribute on the span data using proper OpenTelemetry types.
         * @param recordable The span data to modify
         * @param key The attribute key
         * @param value The attribute value
         */
        static void convertAndSetAttribute(opentelemetry::sdk::trace::Recordable &recordable, const std::string &key,
                                           const std::variant<std::string, double, bool, std::vector<std::string>,
                                                              std::vector<double>, std::vector<bool>> &value);

        /**
         * Converts a serialized span context to an OpenTelemetry span context.
         * @param serializedContext The serialized span context to convert
         * @return The corresponding OpenTelemetry span context
         */
        static opentelemetry::trace::SpanContext convertSpanContext(
            const margelo::nitro::ottrelite::SpanContextWithSerializedTraceState &serializedContext);

        /**
         * Convert and add an event to SpanData
         * @param recordable The SpanData to which the event will be added
         * @param event The event information to be added
         */
        static void convertAndAddEvent(opentelemetry::sdk::trace::Recordable &recordable,
                                       const margelo::nitro::ottrelite::NitroFixedTimedEvent &event);

        /**
         * Convert and add a link to SpanData
         * @param recordable The SpanData to which the link will be added
         * @param link The link information to be added
         */
        static void convertAndAddLink(opentelemetry::sdk::trace::Recordable &recordable,
                                      const margelo::nitro::ottrelite::NitroFixedLink &link);

        /**
         * Convert variant attribute to OpenTelemetry AttributeValue (comprehensive approach)
         * @param value The input variant value
         * @return The corresponding OpenTelemetry AttributeValue
         */
        static opentelemetry::common::AttributeValue convertVariantToAttributeValue(
            const std::variant<std::string, double, bool, std::vector<std::string>, std::vector<double>,
                               std::vector<bool>> &value);
    };
}; // namespace ottrelite::otel
