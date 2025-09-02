#include "PlatformOttreliteBackend.hpp"

#include <iostream>
#include <sstream>

#include <ReactNativeOttrelite/constants.hpp>

#if defined(__ANDROID__)
#include <android/trace.h>
#endif

#if defined(__APPLE__)
// ad below: see explanation inside signpostBegin
#define OTHER_API_NAME "Other API"
#endif

using namespace ottrelite;

namespace ottrelite::backend::platform
{
    PlatformOttreliteBackend::PlatformOttreliteBackend()
        : OttreliteBackend(BACKEND_NAME)
#if IS_IOS_GTE_12
          ,
          tracingLog_(OS_LOG_DEFAULT), counter_events_signpost_id_(os_signpost_id_generate(tracingLog_))
#endif
    {
        constexpr auto usedAPI = IS_IOS_GTE_12 ? "OSSignpost" : "ATrace";
        logger_.info("Ottrelite Backend Platform is using the ") << usedAPI << " API";
    }

#if IS_ANDROID_MIN_API_GTE_23
    void PlatformOttreliteBackend::beginEvent(
        const std::string &eventName,
        [[maybe_unused]] const std::optional<std::vector<structures::NonCppStackTraceEntry>> &nonCppStackTrace,
        [[maybe_unused]] const std::string &sourceApiName, [[maybe_unused]] const MaybeEventArgsMap &maybeEventArgs)
    {
        ATrace_beginSection(eventName.c_str());

        logger_.debug() << "beginEvent(" << eventName << ")";
    }

    void PlatformOttreliteBackend::endEvent([[maybe_unused]] const MaybeEventArgsMap &maybeEventArgs)
    {
        ATrace_endSection();

        logger_.debug("endEvent()");
    }
#endif

#if IS_ANDROID_MIN_API_GTE_29
    void PlatformOttreliteBackend::beginAsyncEvent(
        const std::string &eventName,
        [[maybe_unused]] const std::optional<std::vector<structures::NonCppStackTraceEntry>> &nonCppStackTrace,
        [[maybe_unused]] const std::string &sourceApiName, uint32_t token,
        [[maybe_unused]] const MaybeEventArgsMap &maybeEventArgs)
    {
        ATrace_beginAsyncSection(eventName.c_str(), static_cast<int32_t>(token));
    }

    void PlatformOttreliteBackend::endAsyncEvent(const std::string &eventName, uint32_t token,
                                                 [[maybe_unused]] const MaybeEventArgsMap &maybeEventArgs)
    {
        ATrace_endAsyncSection(eventName.c_str(), static_cast<int32_t>(token));
    }

    void PlatformOttreliteBackend::counterEvent(const std::string &eventName, double value)
    {
        ATrace_setCounter(eventName.c_str(), static_cast<int64_t>(value));
    }
#endif

#if IS_IOS_GTE_12
    void PlatformOttreliteBackend::beginEvent(
        const std::string &eventName,
        [[maybe_unused]] const std::optional<std::vector<structures::NonCppStackTraceEntry>> &nonCppStackTrace,
        const std::string &sourceApiName, [[maybe_unused]] const MaybeEventArgsMap &maybeEventArgs)
    {
        os_signpost_id_t signpostId = os_signpost_id_generate(tracingLog_);

        std::ostringstream descriptionStream(eventName, std::ios_base::ate);
        serializeMetadata(descriptionStream, maybeEventArgs);

        // due to Signpost API static allocation requirements explained in signpostBegin, the source API name may be
        // replaced with static placeholder OTHER_API_NAME in case it is non-standard
        bool passedSourceApiNameWasStandard = signpostBegin(sourceApiName, signpostId, descriptionStream);

        // push event info onto stack
        syncEventStack_.push({eventName, passedSourceApiNameWasStandard ? sourceApiName : OTHER_API_NAME, signpostId});

        logger_.debug() << "beginEvent(" << eventName << ") - stack size: " << syncEventStack_.size();
    }

    void PlatformOttreliteBackend::endEvent(const MaybeEventArgsMap &maybeEventArgs)
    {
        if (syncEventStack_.empty())
        {
            logger_.error("endEvent() called but no event is active");
            return;
        }

        const auto eventInfo = std::move(syncEventStack_.top());
        syncEventStack_.pop();

        std::ostringstream descriptionStream;
        serializeMetadata(descriptionStream, maybeEventArgs);

        // if there is no metadata, describe the end event by its name for Instruments not to show a '-'
        if (!maybeEventArgs.has_value())
        {
            descriptionStream << eventInfo.eventName;
        }

        signpostEnd(eventInfo.sourceApiName, eventInfo.signpostId, descriptionStream);

        logger_.debug() << "endEvent(" << eventInfo.eventName << ") - stack size: " << syncEventStack_.size();
    }

    void PlatformOttreliteBackend::beginAsyncEvent(
        const std::string &eventName,
        [[maybe_unused]] const std::optional<std::vector<structures::NonCppStackTraceEntry>> &nonCppStackTrace,
        const std::string &sourceApiName, uint32_t token, const MaybeEventArgsMap &maybeEventArgs)
    {
        os_signpost_id_t signpostId =
            os_signpost_id_make_with_pointer(tracingLog_, reinterpret_cast<void *>(static_cast<uintptr_t>(token)));

        std::ostringstream descriptionStream(eventName, std::ios_base::ate);
        serializeMetadata(descriptionStream, maybeEventArgs);

        // due to Signpost API static allocation requirements explained in signpostBegin, the source API name may be
        // replaced with static placeholder OTHER_API_NAME in case it is non-standard
        bool passedSourceApiNameWasStandard = signpostBegin(sourceApiName, signpostId, descriptionStream);

        asyncTokenToSignpostEventInfoMap_[token] = {
            eventName, passedSourceApiNameWasStandard ? sourceApiName : OTHER_API_NAME, signpostId};
    }

    void PlatformOttreliteBackend::endAsyncEvent(const std::string &eventName, uint32_t token,
                                                 const MaybeEventArgsMap &maybeEventArgs)
    {
        auto maybeIt = asyncTokenToSignpostEventInfoMap_.find(token);
        if (maybeIt != asyncTokenToSignpostEventInfoMap_.end())
        {
            auto &eventInfo = maybeIt->second;

            std::ostringstream descriptionStream;
            bool hadMetadata = serializeMetadata(descriptionStream, maybeEventArgs);

            if (!hadMetadata)
            {
                descriptionStream << eventInfo.eventName;
            }

            signpostEnd(eventInfo.sourceApiName, eventInfo.signpostId, descriptionStream);
            asyncTokenToSignpostEventInfoMap_.erase(maybeIt);
        }
    }

    void PlatformOttreliteBackend::counterEvent(const std::string &eventName, double value)
    {
        const auto signpostId = os_signpost_id_generate(tracingLog_);
        os_signpost_interval_begin(tracingLog_, signpostId, "Counters", "%{public}s", eventName.c_str());
        os_signpost_interval_end(tracingLog_, signpostId, "Counters", "%{public}f", value);
    }

    bool PlatformOttreliteBackend::serializeMetadata(std::ostringstream &stream,
                                                     const MaybeEventArgsMap &maybeEventArgs)
    {
        if (!maybeEventArgs.has_value())
            return false;

        const auto argsSize = maybeEventArgs.value().size();

        if (maybeEventArgs.has_value() && argsSize > 0)
        {
            stream << "Metadata: ";

            size_t i = 0;
            for (const auto &[key, value] : maybeEventArgs.value())
            {
                stream << key << "=" << value << "";

                i++;

                if (i != argsSize)
                {
                    stream << "; ";
                }
            }

            return true;
        }

        return false;
    }

    bool PlatformOttreliteBackend::signpostBegin(const std::string &sourceApiName, const os_signpost_id_t signpostId,
                                                 const std::ostringstream &descriptionStream)
    {
        // ad below: os_signpost_interval_begin has a constraint that the name of the event must be constant at compile
        // time to be statically allocated therefore, static labels need to be assigned in proper code locations; for
        // non-standard API names, the literal "Other API" is used

        if (sourceApiName == JAVASCRIPT_API_NAME)
        {
            os_signpost_interval_begin(tracingLog_, signpostId, JAVASCRIPT_API_NAME, "%{public}s",
                                       descriptionStream.str().c_str());
        }
        else if (sourceApiName == CPP_API_NAME)
        {
            os_signpost_interval_begin(tracingLog_, signpostId, CPP_API_NAME, "%{public}s",
                                       descriptionStream.str().c_str());
        }
        else if (sourceApiName == JAVA_API_NAME)
        {
            os_signpost_interval_begin(tracingLog_, signpostId, JAVA_API_NAME, "%{public}s",
                                       descriptionStream.str().c_str());
        }
        else if (sourceApiName == SWIFT_API_NAME)
        {
            // note: Swift calls are indistinguishable from C++ calls due to interoperability being used to access
            // Ottrelite's API
            os_signpost_interval_begin(tracingLog_, signpostId, SWIFT_API_NAME, "%{public}s",
                                       descriptionStream.str().c_str());
        }
        else
        {
            os_signpost_interval_begin(tracingLog_, signpostId, OTHER_API_NAME, "%{public}s",
                                       descriptionStream.str().c_str());
            return false;
        }

        return true;
    }

    void PlatformOttreliteBackend::signpostEnd(const std::string &sourceApiName, const os_signpost_id_t signpostId,
                                               const std::ostringstream &descriptionStream)
    {
        // for explanation regarding the below, refer to PlatformOttreliteBackend::signpostBegin

        if (sourceApiName == JAVASCRIPT_API_NAME)
        {
            os_signpost_interval_end(tracingLog_, signpostId, JAVASCRIPT_API_NAME, "%{public}s",
                                     descriptionStream.str().c_str());
        }
        else if (sourceApiName == CPP_API_NAME)
        {
            os_signpost_interval_end(tracingLog_, signpostId, CPP_API_NAME, "%{public}s",
                                     descriptionStream.str().c_str());
        }
        else if (sourceApiName == JAVA_API_NAME)
        {
            os_signpost_interval_end(tracingLog_, signpostId, JAVA_API_NAME, "%{public}s",
                                     descriptionStream.str().c_str());
        }
        else if (sourceApiName == SWIFT_API_NAME)
        {
            // note: Swift calls are indistinguishable from C++ calls due to interoperability being used to access
            // Ottrelite's API
            os_signpost_interval_end(tracingLog_, signpostId, SWIFT_API_NAME, "%{public}s",
                                     descriptionStream.str().c_str());
        }
        else
        {
            os_signpost_interval_end(tracingLog_, signpostId, OTHER_API_NAME, "%{public}s",
                                     descriptionStream.str().c_str());
        }
    }
#endif
} // namespace ottrelite::backend::platform
