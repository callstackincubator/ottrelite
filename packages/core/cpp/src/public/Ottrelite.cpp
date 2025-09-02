#include "Ottrelite.hpp"

#include <algorithm>
#include <memory>
#include <ranges>

#include "OttreliteBackendRegistrar.hpp"
#include "OttreliteOTELInterop.hpp"

namespace ottrelite
{
    using namespace backend;

    void Ottrelite::beginEvent(const std::string &eventName,
                               const std::optional<std::vector<StackTraceEntry>> &nonCppStackTrace,
                               const std::string &sourceApiName, const MaybeEventArgsMap &maybeEventArgs)
    {
        const auto &syncBackends = OttreliteBackendRegistrar::getSyncBackends();

        logger_.debug() << "beginEvent(" << eventName << ") from API '" << sourceApiName << "' "
                        << (nonCppStackTrace.has_value() ? "with" : "without") << " non-CPP stack trace - invoking for "
                        << syncBackends.size() << " backends";

        for (auto &backend : syncBackends)
        {
            backend->beginEvent(eventName,
                                nonCppStackTrace.has_value()
                                    ? std::make_optional(convertJSStackTraceToExternalRepr(nonCppStackTrace.value()))
                                    : std::nullopt,
                                sourceApiName, maybeEventArgs);
        }
    }

    void Ottrelite::endEvent(const MaybeEventArgsMap &maybeEventArgs)
    {
        const auto &syncBackends = OttreliteBackendRegistrar::getSyncBackends();

        logger_.debug() << "endEvent() - invoking for " << syncBackends.size() << " backends";

        for (auto &backend : syncBackends)
        {
            backend->endEvent(maybeEventArgs);
        }
    }

    double Ottrelite::beginAsyncEvent(const std::string &eventName,
                                      const std::optional<std::vector<StackTraceEntry>> &nonCppStackTrace,
                                      const std::string &sourceApiName, const MaybeEventArgsMap &maybeEventArgs)
    {
        const auto token = uniqueTokenGenerator_.nextToken();

        const auto &asyncBackends = OttreliteBackendRegistrar::getAsyncBackends();

        logger_.debug() << "beginAsyncEvent(" << eventName << ") from API '" << sourceApiName << "' "
                        << (nonCppStackTrace.has_value() ? "with" : "without") << " non-CPP stack trace - invoking for "
                        << asyncBackends.size() << " backends, generated token: " << token;

        for (auto &backend : asyncBackends)
        {
            backend->beginAsyncEvent(
                eventName,
                nonCppStackTrace.has_value()
                    ? std::make_optional(convertJSStackTraceToExternalRepr(nonCppStackTrace.value()))
                    : std::nullopt,
                sourceApiName, token, maybeEventArgs);
        }

        return token;
    }

    void Ottrelite::endAsyncEvent(const std::string &eventName, double _token, const MaybeEventArgsMap &maybeEventArgs)
    {
        const auto tokenAsInt = static_cast<int32_t>(_token);
        const auto &asyncBackends = OttreliteBackendRegistrar::getAsyncBackends();

        logger_.debug() << "endAsyncEvent(" << eventName << ") - invoking for " << asyncBackends.size() << " backends";

        for (auto &backend : asyncBackends)
        {
            backend->endAsyncEvent(eventName, tokenAsInt, maybeEventArgs);
        }
    }

    std::vector<OttreliteBackendInfo> Ottrelite::listInstalledBackends()
    {
        auto result =
            OttreliteBackendRegistrar::getBackends() |
            std::views::transform([](const std::shared_ptr<BaseOttreliteBackend> &backend) {
                return OttreliteBackendInfo{
                    backend->getName(),
                    std::dynamic_pointer_cast<IntermediateOttreliteBackendWithSync<true>>(backend) != nullptr,
                    std::dynamic_pointer_cast<IntermediateOttreliteBackendWithAsync<true>>(backend) != nullptr,
                    std::dynamic_pointer_cast<IntermediateOttreliteBackendWithCounter<true>>(backend) != nullptr,
                };
            });

        return {result.begin(), result.end()};
    }

    void Ottrelite::counterEvent(const std::string &eventName, double value)
    {
        const auto &counterBackends = OttreliteBackendRegistrar::getCounterBackends();

        logger_.debug() << "counterEvent(" << eventName << ") with value " << value << " - invoking for "
                        << counterBackends.size() << " backends";

        for (auto &backend : counterBackends)
        {
            backend->counterEvent(eventName, value);
        }
    }

    std::vector<structures::NonCppStackTraceEntry> Ottrelite::convertJSStackTraceToExternalRepr(
        const std::vector<StackTraceEntry> &stackTrace)
    {
        auto result =
            stackTrace | std::views::transform([](const StackTraceEntry &entry) {
                return structures::NonCppStackTraceEntry{entry.functionName, entry.line, entry.column, entry.file};
            });

        return {result.begin(), result.end()};
    }

    ExportResult Ottrelite::exportSpans(const std::vector<SerializedReadableSpan> &spans)
    {
        return otel::OttreliteOTELInterop::exportSpans(spans);
    }

    logging::Logger Ottrelite::logger_{"Ottrelite"};
    utils::CircularToken Ottrelite::uniqueTokenGenerator_;
} // namespace ottrelite
