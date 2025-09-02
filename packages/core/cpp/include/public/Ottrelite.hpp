#pragma once

#include <optional>
#include <string>
#include <vector>

#include "CircularToken.hpp"
#include "ExportResult.hpp"
#include "HybridReactNativeOttreliteSpec.hpp"
#include "Logger.hpp"
#include "NonCppStackTraceEntry.hpp"
#include "SerializedReadableSpan.hpp"
#include "constants.hpp"
#include "types.hpp"

using namespace margelo::nitro::ottrelite;

namespace ottrelite
{
    class Ottrelite
    {
      public:
        /**
         * Begins tracing a new event using the synchronous API.
         * Needs to have a matching invocation of endEvent() to close the event.
         *
         * @param eventName The name of the event to begin
         * @param nonCppStackTrace The JavaScript stack trace at the point of the event start, if available.
         * @param sourceApiName The name of the API registering this event (e.g., "JavaScript", "C++", etc.)
         * @param maybeEventArgs Optional map of additional event metadata, if available.
         */
        static void beginEvent(const std::string &eventName,
                               const std::optional<std::vector<StackTraceEntry>> &nonCppStackTrace,
                               const std::string &sourceApiName,
                               const MaybeEventArgsMap &maybeEventArgs = std::nullopt);

        /**
         * Begins tracing a new event using the synchronous C++ API.
         * Needs to have a matching invocation of endEvent() to close the event.
         *
         * @param eventName The name of the event to begin
         * @param maybeEventArgs Optional map of additional event metadata, if available.
         */
        static void beginEvent(const std::string &eventName, const MaybeEventArgsMap &maybeEventArgs = std::nullopt)
        {
            return beginEvent(eventName, std::nullopt, CPP_API_NAME, maybeEventArgs);
        }

        /**
         * Ends tracing a previously started event in a given frame using the synchronous API.
         *
         * @param maybeEventArgs Optional map of additional event metadata, if available.
         */
        static void endEvent(const MaybeEventArgsMap &maybeEventArgs = std::nullopt);

        /**
         * Begins tracing a new event using the asynchronous API
         * (allowing multiple events with the same name simultaneously).
         *
         * @param eventName The name of the event to begin
         * @param nonCppStackTrace The JavaScript stack trace at the point of the event start, if available
         * @param sourceApiName The name of the API registering this event (e.g., "JavaScript", "C++", etc.)
         * @param maybeEventArgs Optional map of additional event metadata, if available.
         *
         * @return Token assigned to this trace entry, required to end this event
         */
        static double beginAsyncEvent(const std::string &eventName,
                                      const std::optional<std::vector<StackTraceEntry>> &nonCppStackTrace,
                                      const std::string &sourceApiName,
                                      const MaybeEventArgsMap &maybeEventArgs = std::nullopt);

        /**
         * Begins tracing a new event using the asynchronous C++ API
         * (allowing multiple events with the same name simultaneously).
         *
         * @param eventName The name of the event to begin
         * @param maybeEventArgs Optional map of additional event metadata, if available.
         *
         * @return Token assigned to this trace entry, required to end this event
         */
        static double beginAsyncEvent(const std::string &eventName,
                                      const MaybeEventArgsMap &maybeEventArgs = std::nullopt)
        {
            return beginAsyncEvent(eventName, std::nullopt, CPP_API_NAME, maybeEventArgs);
        }

        /**
         * Ends tracing a previously started event in a given frame using the asynchronous API.
         *
         * @param eventName The name of the event to begin
         * @param token Token returned by beginAsyncEvent
         * @param maybeEventArgs Optional map of additional event metadata, if available.
         */
        static void endAsyncEvent(const std::string &eventName, double token,
                                  const MaybeEventArgsMap &maybeEventArgs = std::nullopt);

        /**
         * Registers a counter event with a given value.
         *
         * @param eventName The name of the event
         * @param value The numerical value of the counter event
         */
        static void counterEvent(const std::string &eventName, double value);

        /**
         * Returns detailed information about the currently-installed backends.
         *
         * @return List of details of installed backends
         */
        static std::vector<OttreliteBackendInfo> listInstalledBackends();

        /**
         * Exports a batch of spans to the configured OTEL exporter.
         *
         * @param spans The spans to export
         * @return Result of the export operation: success if all exporters reported success, failure if at least one
         * exporter failed; the error code will be assigned the last failed exporter's error value
         */
        ExportResult exportSpans(const std::vector<SerializedReadableSpan> &spans);

      protected:
        /**
         * Converts a JavaScript stack trace to "external" (CPP-API) representation.
         *
         * @param stackTrace The JS stack trace DTO to convert
         * @return The converted stack trace in the "external" (CPP-API) representation
         */
        static std::vector<backend::structures::NonCppStackTraceEntry> convertJSStackTraceToExternalRepr(
            const std::vector<StackTraceEntry> &stackTrace);

        static logging::Logger logger_;
        static utils::CircularToken uniqueTokenGenerator_;
    };
} // namespace ottrelite
