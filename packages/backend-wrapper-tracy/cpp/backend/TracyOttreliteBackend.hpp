#pragma once

#include <mutex>
#include <stack>
#include <string>
#include <thread>
#include <type_traits>
#include <unordered_map>
#include <unordered_set>

#include <tracy/Tracy.hpp>

#include <ReactNativeOttrelite/Logger.hpp>
#include <ReactNativeOttrelite/NonCppStackTraceEntry.hpp>
#include <ReactNativeOttrelite/OttreliteBackend.hpp>

namespace tracy
{
#include <tracy/TracyC.h>
}

namespace ottrelite::backend::tracy
{
    class TracyOttreliteBackend : public OttreliteBackend<true, false, true>
    {
      public:
        explicit TracyOttreliteBackend();

        void beginEvent(const std::string &eventName,
                        const std::optional<std::vector<structures::NonCppStackTraceEntry>> &nonCppStackTrace,
                        const std::string &sourceApiName, const MaybeEventArgsMap &maybeEventArgs) override;

        void endEvent(const MaybeEventArgsMap &maybeEventArgs) override;

        void counterEvent(const std::string &eventName, double value) override;

      private:
        static constexpr auto BACKEND_NAME = "Tracy";

        logging::Logger logger_{"TracyOttreliteBackend"};

        std::unordered_map<std::thread::id, std::stack<::tracy::TracyCZoneCtx>> threadIdToSyncApiZones_;
        std::mutex threadIdToSyncApiZonesMutex_;

        std::unordered_set<std::string> persistPlotNameMapping_;

        static ::tracy::TracyCZoneCtx allocateTracyCZoneCtx(
            const std::string &eventName,
            const std::optional<std::vector<structures::NonCppStackTraceEntry>> &nonCppStackTrace,
            const MaybeEventArgsMap &maybeEventArgs, const std::string &sourceApiName);

        static void maybeAppendZoneMetadata(std::ostringstream &zoneTextStream, const MaybeEventArgsMap &maybeEventArgs,
                                            const std::string &metadataPhase);
    };
} // namespace ottrelite::backend::tracy
