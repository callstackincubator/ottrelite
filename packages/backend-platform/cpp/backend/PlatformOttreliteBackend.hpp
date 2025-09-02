#pragma once

#include <stack>
#include <string>
#include <type_traits>
#include <unordered_map>

#include <ReactNativeOttrelite/Logger.hpp>
#include <ReactNativeOttrelite/OttreliteBackend.hpp>

#if defined(__ANDROID__)
#include <android/api-level.h>

// ad below: async ATrace_*AsyncSection functions are available on Android API >= 29
#define IS_ANDROID_MIN_API_GTE_29 __ANDROID_MIN_SDK_VERSION__ >= __ANDROID_API_Q__
// ad below: sync ATrace_*Section functions are available on Android API >= 23
#define IS_ANDROID_MIN_API_GTE_23 __ANDROID_MIN_SDK_VERSION__ >= __ANDROID_API_M__
#else
#define IS_ANDROID_MIN_API_GTE_29 false
#define IS_ANDROID_MIN_API_GTE_23 false
#endif

#if defined(__APPLE__)
#include <os/signpost.h>

// ad below: OSSignposter API is available on iOS 12.0+
#define IS_IOS_GTE_12 __IPHONE_OS_VERSION_MAX_ALLOWED >= 120000
#else
#define IS_IOS_GTE_12 false
#endif

namespace ottrelite::backend::platform
{
    class PlatformOttreliteBackend : public OttreliteBackend<IS_ANDROID_MIN_API_GTE_23 || IS_IOS_GTE_12,
                                                             IS_ANDROID_MIN_API_GTE_29 || IS_IOS_GTE_12,
                                                             IS_ANDROID_MIN_API_GTE_29 || IS_IOS_GTE_12>
    {
      public:
        explicit PlatformOttreliteBackend();

#if IS_ANDROID_MIN_API_GTE_23 || IS_IOS_GTE_12
        void beginEvent(const std::string &eventName,
                        const std::optional<std::vector<structures::NonCppStackTraceEntry>> &nonCppStackTrace,
                        const std::string &sourceApiName, const MaybeEventArgsMap &maybeEventArgs) override;

        void endEvent(const MaybeEventArgsMap &maybeEventArgs) override;
#endif

#if IS_ANDROID_MIN_API_GTE_29 || IS_IOS_GTE_12
        void beginAsyncEvent(const std::string &eventName,
                             const std::optional<std::vector<structures::NonCppStackTraceEntry>> &nonCppStackTrace,
                             const std::string &sourceApiName, uint32_t token,
                             const MaybeEventArgsMap &maybeEventArgs) override;

        void endAsyncEvent(const std::string &eventName, uint32_t token,
                           const MaybeEventArgsMap &maybeEventArgs) override;

        void counterEvent(const std::string &eventName, double value) override;
#endif

      private:
        static constexpr auto BACKEND_NAME = "Platform";

        logging::Logger logger_{"PlatformOttreliteBackend"};

#if IS_IOS_GTE_12
        struct SignpostEventInfo
        {
            std::string eventName;
            std::string sourceApiName;
            os_signpost_id_t signpostId;
        };

        os_log_t tracingLog_;
        os_signpost_id_t counter_events_signpost_id_;
        std::unordered_map<uint32_t, SignpostEventInfo> asyncTokenToSignpostEventInfoMap_;
        std::stack<SignpostEventInfo> syncEventStack_;

        /**
         * Serializes metadata into the provided stream.
         * @param stream The stream to serialize metadata into
         * @param maybeEventArgs Optional map of additional event metadata, if available.
         * @return `true` if metadata was present (and thus was appended to the stream), `false` otherwise.
         */
        bool serializeMetadata(std::ostringstream &stream, const MaybeEventArgsMap &maybeEventArgs);

        /**
         * Begins a signpost event with the given source API name and signpost ID, fills in the description from the
         * passed stream's buffer.
         * @param sourceApiName The name of the API registering this event
         * @param signpostId The signpost ID for the event
         * @param descriptionStream The stream containing the event description
         * @return `true` if the source API name was standard, `false` otherwise (in which case the event was traced
         * under the OTHER_API_NAME static placeholder)
         */
        bool signpostBegin(const std::string &sourceApiName, const os_signpost_id_t signpostId,
                           const std::ostringstream &descriptionStream);

        /**
         * Ends a signpost event with the given source API name and signpost ID, fills in the description from the
         * passed stream's buffer.
         * @param sourceApiName The name of the API registering this event
         * @param signpostId The signpost ID for the event
         * @param descriptionStream The stream containing the event description
         */
        void signpostEnd(const std::string &sourceApiName, const os_signpost_id_t signpostId,
                         const std::ostringstream &descriptionStream);
#endif
    };
} // namespace ottrelite::backend::platform
