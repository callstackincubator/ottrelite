#include "ReactNativeOttrelite.hpp"

#include <ranges>
#include <vector>

#include "JSIUtils.hpp"
#include "Logger.hpp"
#include "OttreliteBackendRegistrar.hpp"
#include "OttreliteOTELInterop.hpp"

using namespace ::ottrelite;
using namespace ::ottrelite::backend;

namespace margelo::nitro::ottrelite
{
    ReactNativeOttrelite::ReactNativeOttrelite() : HybridObject(TAG)
    {
    }

    ReactNativeOttrelite::~ReactNativeOttrelite()
    {
        // if installed, restore the original functions since the registered functions will just become dangling in a
        // while, potentially causing errors if called
        if (runtimePtr_ != nullptr)
        {
            if (nativeTraceBeginSectionOrig_.has_value())
            {
                runtimePtr_->global().setProperty(*runtimePtr_, "nativeTraceBeginSection",
                                                  nativeTraceBeginSectionOrig_.value());
            }

            if (nativeTraceEndSectionOrig_.has_value())
            {
                runtimePtr_->global().setProperty(*runtimePtr_, "nativeTraceEndSection",
                                                  nativeTraceEndSectionOrig_.value());
            }

            if (nativeTraceBeginAsyncSectionOrig_.has_value())
            {
                runtimePtr_->global().setProperty(*runtimePtr_, "nativeTraceBeginAsyncSection",
                                                  nativeTraceBeginAsyncSectionOrig_.value());
            }

            if (nativeTraceEndAsyncSectionOrig_.has_value())
            {
                runtimePtr_->global().setProperty(*runtimePtr_, "nativeTraceEndAsyncSection",
                                                  nativeTraceEndAsyncSectionOrig_.value());
            }

            if (nativeTraceCounterOrig_.has_value())
            {
                runtimePtr_->global().setProperty(*runtimePtr_, "nativeTraceCounter", nativeTraceCounterOrig_.value());
            }
        }
    }

    void ReactNativeOttrelite::loadHybridMethods()
    {
        HybridReactNativeOttreliteSpec::loadHybridMethods();

        registerHybrids(this, [](Prototype &prototype) {
            prototype.registerRawHybridMethod("install", 0, &ReactNativeOttrelite::install);
        });
    }

    jsi::Value ReactNativeOttrelite::install(jsi::Runtime &runtime, [[maybe_unused]] const jsi::Value &thisValue,
                                             [[maybe_unused]] const jsi::Value *args, [[maybe_unused]] size_t count)
    {
        runtimePtr_ = &runtime;

        logger_.info() << "📃 RN Ottrelite v" << OTTRELITE_CORE_VERSION << " 📃";

        return jsi::Value::undefined();
    }

    void ReactNativeOttrelite::configure(const OttreliteOptions &options)
    {
        if (options.reviveSystraceAPI)
        {
            reviveSystraceAPI();
        }

        if (options.cppTraceBatchSpanProcessorOptions.has_value())
        {
            const auto &traceBatchSpanProcessorOptions = options.cppTraceBatchSpanProcessorOptions.value();

            if (traceBatchSpanProcessorOptions.maxBatchSize.has_value())
            {
                ::ottrelite::otel::OttreliteOTELInterop::otelBatchSpanProcessorOptions_.max_export_batch_size =
                    traceBatchSpanProcessorOptions.maxBatchSize.value();
            }

            if (traceBatchSpanProcessorOptions.maxQueueSize.has_value())
            {
                ::ottrelite::otel::OttreliteOTELInterop::otelBatchSpanProcessorOptions_.max_queue_size =
                    traceBatchSpanProcessorOptions.maxQueueSize.value();
            }

            if (traceBatchSpanProcessorOptions.scheduleDelayMs.has_value())
            {
                ::ottrelite::otel::OttreliteOTELInterop::otelBatchSpanProcessorOptions_.schedule_delay_millis =
                    std::chrono::milliseconds(
                        static_cast<uint32_t>(traceBatchSpanProcessorOptions.scheduleDelayMs.value()));
            }
        }

        if (options.cppMetricReaderOptions.has_value())
        {
            const auto &cppMetricReaderOptions = options.cppMetricReaderOptions.value();

            if (cppMetricReaderOptions.exportIntervalMillis.has_value())
            {
                ::ottrelite::otel::OttreliteOTELInterop::otelMetricReaderOptions_.export_interval_millis =
                    std::chrono::milliseconds(
                        static_cast<uint32_t>(cppMetricReaderOptions.exportIntervalMillis.value()));
            }

            if (cppMetricReaderOptions.exportTimeoutMillis.has_value())
            {
                ::ottrelite::otel::OttreliteOTELInterop::otelMetricReaderOptions_.export_timeout_millis =
                    std::chrono::milliseconds(
                        static_cast<uint32_t>(cppMetricReaderOptions.exportTimeoutMillis.value()));
            }
        }

        if (options.cppBatchLogRecordProcessorOptions.has_value())
        {
            const auto &batchLogRecordProcessorOptions = options.cppBatchLogRecordProcessorOptions.value();

            if (batchLogRecordProcessorOptions.maxBatchSize.has_value())
            {
                ::ottrelite::otel::OttreliteOTELInterop::otelBatchLogRecordProcessorOptions_.max_export_batch_size =
                    batchLogRecordProcessorOptions.maxBatchSize.value();
            }

            if (batchLogRecordProcessorOptions.maxQueueSize.has_value())
            {
                ::ottrelite::otel::OttreliteOTELInterop::otelBatchLogRecordProcessorOptions_.max_queue_size =
                    batchLogRecordProcessorOptions.maxQueueSize.value();
            }

            if (batchLogRecordProcessorOptions.exportIntervalMillis.has_value())
            {
                ::ottrelite::otel::OttreliteOTELInterop::otelBatchLogRecordProcessorOptions_.schedule_delay_millis =
                    std::chrono::milliseconds(
                        static_cast<uint32_t>(batchLogRecordProcessorOptions.exportIntervalMillis.value()));
            }
        }
    }

    void ReactNativeOttrelite::installGlobalOTELCPPTracerProvider()
    {
        ::ottrelite::otel::OttreliteOTELInterop::installGlobalOTELTracerProvider();
    }

    void ReactNativeOttrelite::installGlobalOTELCPPMeterProvider()
    {
        ::ottrelite::otel::OttreliteOTELInterop::installGlobalOTELMeterProvider();
    }

    void ReactNativeOttrelite::installGlobalOTELCPPLoggerProvider()
    {
        ::ottrelite::otel::OttreliteOTELInterop::installGlobalOTELLoggerProvider();
    }

    void ReactNativeOttrelite::reviveSystraceAPI()
    {
        logger_.debug("reviveSystraceAPI() - setting tracing globals");

        try
        {
            // enable tracing in react-native/Libraries/Performance/Systrace.js
            runtimePtr_->global().setProperty(*runtimePtr_, "__RCTProfileIsProfiling", true);
        }
        catch (...)
        {
            // this may fail on Android if the Gradle plugin sets a proper Kotlin flag, which is propagated
            // to CPP and already sets the above flag as readonly, causing an error here; however, this is still fine
            // and we can just continue
        }

        nativeTraceBeginSectionOrig_ = runtimePtr_->global().getProperty(*runtimePtr_, "nativeTraceBeginSection");
        nativeTraceEndSectionOrig_ = runtimePtr_->global().getProperty(*runtimePtr_, "nativeTraceEndSection");
        nativeTraceBeginAsyncSectionOrig_ =
            runtimePtr_->global().getProperty(*runtimePtr_, "nativeTraceBeginAsyncSection");
        nativeTraceEndAsyncSectionOrig_ = runtimePtr_->global().getProperty(*runtimePtr_, "nativeTraceEndAsyncSection");
        nativeTraceCounterOrig_ = runtimePtr_->global().getProperty(*runtimePtr_, "nativeTraceCounter");

        // register the global tracing callback to integrate with Systrace.js API
        runtimePtr_->global().setProperty(
            *runtimePtr_, "nativeTraceBeginSection",
            jsi::Function::createFromHostFunction(
                *runtimePtr_, jsi::PropNameID::forAscii(*runtimePtr_, "nativeTraceBeginSection"), 3,
                [this](jsi::Runtime &runtime, const jsi::Value &, const jsi::Value *args, size_t count) -> jsi::Value {
                    // args is of shape: [TRACE_TAG, eventName, additionalArgs]
                    // TRACE_TAG should be TRACE_TAG_REACT_APPS (integer) and is unused as
                    // well
                    if (count == 3)
                    {
                        const auto [additionalArgsValid, maybeAdditionalArgsMap] = validateEventArgsObj(args[2]);

                        if (args[1].isString() && additionalArgsValid)
                        {
                            ::ottrelite::Ottrelite::beginEvent(args[1].getString(runtime).utf8(runtime), std::nullopt,
                                                               JAVASCRIPT_API_NAME, maybeAdditionalArgsMap);
                        }
                        else
                        {
                            logger_.warn()
                                << "nativeTraceBeginSection: invalid arguments passed, received " << count
                                << " arguments with args[1] being ValueKind of " << utils::getValueKind(args[1])
                                << " and args[2] being ValueKind of " << utils::getValueKind(args[2]);
                        }
                    }
                    else
                    {
                        logger_.warn() << "nativeTraceBeginSection: expected 3 arguments, received " << count;
                    }

                    return jsi::Value::undefined();
                }));

        runtimePtr_->global().setProperty(
            *runtimePtr_, "nativeTraceEndSection",
            jsi::Function::createFromHostFunction(
                *runtimePtr_, jsi::PropNameID::forAscii(*runtimePtr_, "nativeTraceEndSection"), 2,
                [this]([[maybe_unused]] jsi::Runtime &runtime, [[maybe_unused]] const jsi::Value &,
                       [[maybe_unused]] const jsi::Value *args, [[maybe_unused]] size_t count) -> jsi::Value {
                    // args is of shape: [TRACE_TAG, additionalArgs]
                    // TRACE_TAG should be TRACE_TAG_REACT_APPS (integer) and is unused as
                    // well
                    if (count == 2)
                    {
                        const auto [additionalArgsValid, maybeAdditionalArgsMap] = validateEventArgsObj(args[1]);

                        if (additionalArgsValid)
                        {
                            ::ottrelite::Ottrelite::endEvent(maybeAdditionalArgsMap);
                        }
                        else
                        {
                            logger_.warn() << "nativeTraceEndSection: invalid arguments passed, received " << count
                                           << " arguments";
                        }
                    }
                    else
                    {
                        logger_.warn() << "nativeTraceEndSection: expected 2 arguments, received " << count;
                    }

                    return jsi::Value::undefined();
                }));

        // register the global tracing callback to integrate with Systrace.js API
        runtimePtr_->global().setProperty(
            *runtimePtr_, "nativeTraceBeginAsyncSection",
            jsi::Function::createFromHostFunction(
                *runtimePtr_, jsi::PropNameID::forAscii(*runtimePtr_, "nativeTraceBeginAsyncSection"), 4,
                [this](jsi::Runtime &runtime, const jsi::Value &, const jsi::Value *args, size_t count) -> jsi::Value {
                    // args is of shape: [TRACE_TAG, eventName, externalToken, additionalArgs]
                    // TRACE_TAG should be TRACE_TAG_REACT_APPS (integer) and is unused
                    // as well; externalToken is a Systrace.js-managed token that needs to be mapped to an internal
                    // token that is generated by Ottrelite
                    if (count == 4)
                    {
                        const auto [additionalArgsValid, maybeAdditionalArgsMap] = validateEventArgsObj(args[3]);

                        if (args[1].isString() && args[2].isNumber() && additionalArgsValid)
                        {
                            const auto externalToken = args[2].getNumber();
                            const auto internalToken = ::ottrelite::Ottrelite::beginAsyncEvent(
                                args[1].getString(runtime).utf8(runtime), std::nullopt, JAVASCRIPT_API_NAME,
                                maybeAdditionalArgsMap);

                            {
                                std::lock_guard<std::mutex> lock(rnAsyncEventTokenToInternalTokenMappingMutex_);

                                rnAsyncEventTokenToInternalTokenMapping_[externalToken] = internalToken;
                            }
                        }
                        else
                        {
                            logger_.warn()
                                << "nativeTraceBeginAsyncSection: invalid arguments passed, received " << count
                                << " arguments with args[1] being ValueKind of " << utils::getValueKind(args[1])
                                << " and args[2] being ValueKind of " << utils::getValueKind(args[2])
                                << " and args[3] being ValueKind of " << utils::getValueKind(args[3]);
                        }
                    }
                    else
                    {
                        logger_.warn() << "nativeTraceBeginAsyncSection: expected 4 arguments, received " << count;
                    }

                    return jsi::Value::undefined();
                }));

        runtimePtr_->global().setProperty(
            *runtimePtr_, "nativeTraceEndAsyncSection",
            jsi::Function::createFromHostFunction(
                *runtimePtr_, jsi::PropNameID::forAscii(*runtimePtr_, "nativeTraceEndAsyncSection"), 4,
                [this]([[maybe_unused]] jsi::Runtime &runtime, [[maybe_unused]] const jsi::Value &,
                       [[maybe_unused]] const jsi::Value *args, [[maybe_unused]] size_t count) -> jsi::Value {
                    // args is of shape: [TRACE_TAG, eventName, externalToken, additionalArgs]
                    // TRACE_TAG should be TRACE_TAG_REACT_APPS (integer) and is unused
                    // as well; externalToken is a Systrace.js-managed token that needs to be mapped to an internal
                    // token that is generated by Ottrelite
                    if (count == 4)
                    {
                        const auto [additionalArgsValid, maybeAdditionalArgsMap] = validateEventArgsObj(args[3]);

                        if (args[1].isString() && args[2].isNumber() && additionalArgsValid)
                        {
                            double internalToken;

                            {
                                std::lock_guard<std::mutex> lock(rnAsyncEventTokenToInternalTokenMappingMutex_);

                                const auto tokenMappingIt =
                                    rnAsyncEventTokenToInternalTokenMapping_.find(args[2].getNumber());
                                internalToken = tokenMappingIt->second;
                                rnAsyncEventTokenToInternalTokenMapping_.erase(tokenMappingIt);
                            }

                            ::ottrelite::Ottrelite::endAsyncEvent(args[1].getString(runtime).utf8(runtime),
                                                                  internalToken, maybeAdditionalArgsMap);
                        }
                        else
                        {
                            logger_.warn()
                                << "nativeTraceEndAsyncSection: invalid arguments passed, received " << count
                                << " arguments with args[1] being ValueKind of " << utils::getValueKind(args[1])
                                << " and args[2] being ValueKind of " << utils::getValueKind(args[2])
                                << " and args[3] being ValueKind of " << utils::getValueKind(args[3]);
                        }
                    }
                    else
                    {
                        logger_.warn() << "nativeTraceEndAsyncSection: expected 4 arguments, received " << count;
                    }

                    return jsi::Value::undefined();
                }));

        runtimePtr_->global().setProperty(
            *runtimePtr_, "nativeTraceCounter",
            jsi::Function::createFromHostFunction(
                *runtimePtr_, jsi::PropNameID::forAscii(*runtimePtr_, "nativeTraceCounter"), 3,
                [](jsi::Runtime &runtime, const jsi::Value &, const jsi::Value *args, size_t count) -> jsi::Value {
                    // args is of shape: [TRACE_TAG, eventName, value]; the token is discarded,
                    // Ottrelite has its own token system; TRACE_TAG should be
                    // TRACE_TAG_REACT_APPS (integer) and is unused as well
                    if (count == 3 && args[1].isString() && args[2].isNumber())
                    {
                        ::ottrelite::Ottrelite::counterEvent(args[1].getString(runtime).utf8(runtime),
                                                             args[2].getNumber());
                    }
                    else
                    {
                        logger_.warn() << "nativeTraceCounter: invalid arguments passed, received " << count
                                       << " arguments with args[1] being ValueKind of " << utils::getValueKind(args[1])
                                       << " and args[2] being ValueKind of " << utils::getValueKind(args[2]);
                    }

                    return jsi::Value::undefined();
                }));
    }

    std::pair<bool, MaybeEventArgsMap> ReactNativeOttrelite::validateEventArgsObj(const jsi::Value &args) const
    {
        const auto isValidType = args.isObject() || args.isNull() || args.isUndefined();

        if (!isValidType)
        {
            return {false, std::nullopt};
        }

        if (args.isObject())
        {
            const auto jsObject = args.asObject(*runtimePtr_);
            std::unordered_map<std::string, std::string> argsMap;

            const auto propertyNames = jsObject.getPropertyNames(*runtimePtr_);
            for (size_t i = 0; i < propertyNames.length(*runtimePtr_); ++i)
            {
                jsi::Value propertyName = propertyNames.getValueAtIndex(*runtimePtr_, i);

                if (!propertyName.isString())
                {
                    logger_.warn() << "validateEventArgsObj: key no. " << i << " is not a string, skipping";
                    continue;
                }

                const auto propertyNameString = propertyName.asString(*runtimePtr_);
                const auto propertyNameUtf8 = propertyNameString.utf8(*runtimePtr_);

                const auto value = jsObject.getProperty(*runtimePtr_, propertyNameString);
                if (!value.isString())
                {
                    logger_.warn() << "validateEventArgsObj: value for key '" << propertyNameUtf8
                                   << "' is not a string, skipping";
                    continue;
                }

                argsMap[propertyNameUtf8] = value.asString(*runtimePtr_).utf8(*runtimePtr_);
            }

            return {true, argsMap};
        }

        return {true, std::nullopt};
    }

    logging::Logger ReactNativeOttrelite::logger_{"ReactNativeOttrelite"};
} // namespace margelo::nitro::ottrelite
