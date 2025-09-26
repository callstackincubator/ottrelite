#pragma once

#include <jsi/jsi.h>
#include <memory>
#include <mutex>
#include <optional>
#include <set>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

#include "ExportResult.hpp"
#include "HybridReactNativeOttreliteInteropOTELSpec.hpp"
#include "ReactNativeOttrelite/CircularToken.hpp"
#include "ReactNativeOttrelite/Logger.hpp"
#include "ReactNativeOttrelite/Ottrelite.hpp"
#include "ReactNativeOttrelite/OttreliteBackend.hpp"
#include "ReactNativeOttrelite/constants.hpp"
#include "SerializedReadableSpan.hpp"

using namespace facebook;
using namespace ::ottrelite;
using namespace ::ottrelite::backend;

namespace margelo::nitro::ottrelite::interop::otel
{
    class ReactNativeOttreliteInteropOTEL : public HybridReactNativeOttreliteInteropOTELSpec
    {
      public:
        /**
         * Constructor for the ReactNativeOttreliteInteropOTEL Nitro Module.
         */
        ReactNativeOttreliteInteropOTEL();

        /**
         * Configures the OTEL C++ SDK with the given options.
         * @param options The options to configure the OTEL C++ SDK with
         */
        void configure(const OttreliteInteropOTELOptions &options) override;

        /**
         * Exports a batch of spans to the configured OTEL exporter.
         *
         * @param spans The spans to export
         * @return Result of the export operation: success if all exporters reported success, failure if at least one
         * exporter failed; the error code will be assigned the last failed exporter's error value
         */
        ExportResult exportSpans(const std::vector<SerializedReadableSpan> &spans);

        void installGlobalOTELCPPTracerProvider() override;
        void installGlobalOTELCPPMeterProvider() override;
        void installGlobalOTELCPPLoggerProvider() override;

      private:
        jsi::Runtime *runtimePtr_ = nullptr;

        std::unordered_map<double, double> rnAsyncEventTokenToInternalTokenMapping_;
        std::mutex rnAsyncEventTokenToInternalTokenMappingMutex_;

        // backups of original native trace functions' values
        std::optional<facebook::jsi::Value> nativeTraceBeginSectionOrig_;
        std::optional<facebook::jsi::Value> nativeTraceEndSectionOrig_;
        std::optional<facebook::jsi::Value> nativeTraceBeginAsyncSectionOrig_;
        std::optional<facebook::jsi::Value> nativeTraceEndAsyncSectionOrig_;
        std::optional<facebook::jsi::Value> nativeTraceCounterOrig_;

        static logging::Logger logger_;

        void reviveSystraceAPI();
    };
} // namespace margelo::nitro::ottrelite::interop::otel
