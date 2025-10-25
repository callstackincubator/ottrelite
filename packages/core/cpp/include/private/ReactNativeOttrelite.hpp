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

#include "CircularToken.hpp"
#include "HybridReactNativeOttreliteSpec.hpp"
#include "Logger.hpp"
#include "Ottrelite.hpp"
#include "OttreliteBackend.hpp"
#include "constants.hpp"

using namespace facebook;
using namespace ::ottrelite;
using namespace ::ottrelite::backend;

namespace margelo::nitro::ottrelite
{
    class ReactNativeOttrelite : public HybridReactNativeOttreliteSpec
    {
      public:
        /**
         * Constructor for the ReactNativeOttrelite Nitro Module.
         */
        ReactNativeOttrelite();

        ~ReactNativeOttrelite();

        /**
         * \copydoc ::ottrelite::Ottrelite::beginEvent
         */
        void beginEvent(const std::string &eventName,
                        const std::optional<std::vector<StackTraceEntry>> &nonCppStackTrace,
                        const MaybeEventArgsMap &maybeEventArgs) override
        {
            Ottrelite::beginEvent(eventName, nonCppStackTrace, JAVASCRIPT_API_NAME, maybeEventArgs);
        }

        /**
         * \copydoc ::ottrelite::Ottrelite::endEvent
         */
        void endEvent(const MaybeEventArgsMap &maybeEventArgs) override
        {
            Ottrelite::endEvent(maybeEventArgs);
        }

        /**
         * \copydoc ::ottrelite::Ottrelite::beginAsyncEvent
         */
        double beginAsyncEvent(const std::string &eventName,
                               const std::optional<std::vector<StackTraceEntry>> &nonCppStackTrace,
                               const MaybeEventArgsMap &maybeEventArgs) override
        {
            return Ottrelite::beginAsyncEvent(eventName, nonCppStackTrace, JAVASCRIPT_API_NAME, maybeEventArgs);
        }

        /**
         * \copydoc ::ottrelite::Ottrelite::endAsyncEvent
         */
        void endAsyncEvent(const std::string &eventName, double token, const MaybeEventArgsMap &maybeEventArgs) override
        {
            Ottrelite::endAsyncEvent(eventName, token, maybeEventArgs);
        }

        /**
         * \copydoc ::ottrelite::Ottrelite::counterEvent
         */
        void counterEvent(const std::string &eventName, double value) override
        {
            Ottrelite::counterEvent(eventName, value);
        }

        /**
         * Hook that needs to be invoked from JS code on application start; this installs globals required to
         * bind into RN's Systrace.js API.
         *
         * @param runtime The JSI runtime
         * @param thisValue The JSI this value
         * @param args The JSI arguments
         * @param count The number of arguments
         *
         * @return The result of the operation (undefined)
         *
         * @note This method is called from JS code and should not be invoked directly from C++.
         */
        jsi::Value install(jsi::Runtime &runtime, const jsi::Value &thisValue, const jsi::Value *args, size_t count);

        /**
         * \copydoc ::ottrelite::Ottrelite::listInstalledBackends
         */
        std::vector<OttreliteBackendInfo> listInstalledBackends() override
        {
            return Ottrelite::listInstalledBackends();
        }

        void configure(const OttreliteOptions &options) override;

        /**
         * \copydoc ::ottrelite::Ottrelite::setEnabled
         */
        void setEnabled(bool enabled) override;

        /**
         * Inherited method called by Nitro Modules base code that registers hybrid methods interacting directly with
         * JSI.
         */
        void loadHybridMethods() override;

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

        std::pair<bool, MaybeEventArgsMap> validateEventArgsObj(const jsi::Value &args) const;
        void reviveSystraceAPI();
    };
} // namespace margelo::nitro::ottrelite
