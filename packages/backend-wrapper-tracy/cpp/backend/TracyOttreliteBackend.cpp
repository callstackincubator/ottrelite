#include "TracyOttreliteBackend.hpp"

// pthread_getname_np is available on Android API >= 26
#if defined(__ANDROID__) && __ANDROID_API__ >= __ANDROID_API_O__
#define ANDROID_HAS_PTHREAD_GETNAME_NP 1
#else
#define ANDROID_HAS_PTHREAD_GETNAME_NP 0
#endif

// if pthread_getname_np and we are on Android, fall back to using prctl(PR_GET_NAME)
#if !ANDROID_HAS_PTHREAD_GETNAME_NP && defined(__ANDROID__)
#include <array>
#include <linux/prctl.h>
#include <sys/prctl.h>
#endif
#include <pthread.h>
#include <sstream>
#include <thread>

#include "ReactNativeOttrelite/constants.hpp"

using namespace ottrelite;

namespace ottrelite::backend::tracy
{
    TracyOttreliteBackend::TracyOttreliteBackend() : OttreliteBackend(BACKEND_NAME)
    {
        std::optional<std::string> threadName;

#if ANDROID_HAS_PTHREAD_GETNAME_NP || defined(__APPLE__)
        char name[128];
        pthread_t thread = pthread_self();
        int result = pthread_getname_np(thread, name, sizeof(name));
        threadName = result == 0 ? std::make_optional(std::string(name)) : std::nullopt;
#elif defined(__ANDROID__)
        std::array<char, 16> name{};
        threadName = prctl(PR_GET_NAME, name.data(), 0, 0, 0) == -1 ? std::nullopt
                                                                    : std::make_optional(std::string(name.data()));
#else
        threadName = std::nullopt;
#endif

        if (threadName.has_value())
        {
            ::tracy::SetThreadName(threadName.value().c_str());
        }
    }

    void TracyOttreliteBackend::beginEvent(
        const std::string &eventName,
        const std::optional<std::vector<structures::NonCppStackTraceEntry>> &nonCppStackTrace,
        const std::string &sourceApiName, const MaybeEventArgsMap &maybeEventArgs)
    {
        std::thread::id thisThreadId = std::this_thread::get_id();

        auto tracyCZoneCtx = allocateTracyCZoneCtx(eventName, nonCppStackTrace, maybeEventArgs, sourceApiName);

        {
            std::lock_guard<std::mutex> lock(threadIdToSyncApiZonesMutex_);

            auto maybeIt = threadIdToSyncApiZones_.find(thisThreadId);
            if (maybeIt == threadIdToSyncApiZones_.end())
            {
                maybeIt = threadIdToSyncApiZones_.insert({thisThreadId, {}}).first;
            }

            maybeIt->second.push(tracyCZoneCtx);
        }

        logger_.debug() << "beginEvent(" << eventName << ")";
    }

    void TracyOttreliteBackend::endEvent(const MaybeEventArgsMap &maybeEventArgs)
    {
        std::thread::id thisThreadId = std::this_thread::get_id();

        ::tracy::TracyCZoneCtx tracyCZoneCtx;

        {
            std::lock_guard<std::mutex> lock(threadIdToSyncApiZonesMutex_);

            auto &stack = threadIdToSyncApiZones_[thisThreadId];

            if (stack.empty())
            {
                logger_.error("endEvent() called without a matching beginEvent() for thread ")
                    << std::hash<std::thread::id>()(thisThreadId);
                return;
            }

            tracyCZoneCtx = stack.top();
            stack.pop();

            if (stack.empty())
            {
                threadIdToSyncApiZones_.erase(thisThreadId);
            }
        }

        // append additional metadata to the zone text, if applicable
        if (maybeEventArgs.has_value())
        {
            std::ostringstream zoneTextStream;

            maybeAppendZoneMetadata(zoneTextStream, maybeEventArgs, "end");

            const auto zoneText = zoneTextStream.str();
            ::tracy::___tracy_emit_zone_text(tracyCZoneCtx, zoneText.c_str(), static_cast<uint32_t>(zoneText.length()));
        }

        ::tracy::___tracy_emit_zone_end(tracyCZoneCtx);

        logger_.debug("endEvent()");
    }

    void TracyOttreliteBackend::counterEvent(const std::string &eventName, double value)
    {
        auto iter = persistPlotNameMapping_.insert(eventName.c_str()).first;

        ::tracy::Profiler::PlotData(iter->c_str(), value);
    }

    ::tracy::TracyCZoneCtx TracyOttreliteBackend::allocateTracyCZoneCtx(
        const std::string &eventName,
        const std::optional<std::vector<structures::NonCppStackTraceEntry>> &nonCppStackTrace,
        const MaybeEventArgsMap &maybeEventArgs, const std::string &sourceApiName)
    {
        uint32_t line = TracyLine;
        std::string file = TracyFile;
        std::string function = TracyFunction;

        const auto hasNonCppStackTrace = nonCppStackTrace.has_value();

        if (hasNonCppStackTrace && !nonCppStackTrace->empty())
        {
            const auto &topEntry = nonCppStackTrace->front();
            line = static_cast<uint32_t>(topEntry.line);
            file = topEntry.file;
            function = topEntry.functionName;
        }

        auto allocatedSourceLocation =
            ::tracy::___tracy_alloc_srcloc_name(line, file.c_str(), file.length(), function.c_str(), function.length(),
                                                eventName.c_str(), eventName.length(), 0);
        auto tracyCZoneCtx =
            ::tracy::___tracy_emit_zone_begin_alloc_callstack(allocatedSourceLocation, TRACY_CALLSTACK, true);

        unsigned int color;
        if (sourceApiName == JAVASCRIPT_API_NAME)
        {
            // yellow for JavaScript
            color = 0xFFFFD800;
        }
        else if (sourceApiName == CPP_API_NAME)
        {
            // blue for C++
            color = 0xFF0000FF;
        }
        else if (sourceApiName == JAVA_API_NAME)
        {
            // red for Java
            color = 0xFFBC544B;
        }
        else if (sourceApiName == SWIFT_API_NAME)
        {
            // orange for Swift
            color = 0xFFED7013;
        }
        else
        {
            // purple for other APIs
            color = 0xFF9866C5;
        }
        ::tracy::___tracy_emit_zone_color(tracyCZoneCtx, color);

        std::ostringstream zoneTextStream;

        zoneTextStream << (hasNonCppStackTrace ? sourceApiName : "C++") << " API trace\n";

        maybeAppendZoneMetadata(zoneTextStream, maybeEventArgs, "start");

        if (hasNonCppStackTrace)
        {
            if (!nonCppStackTrace->empty())
            {
                zoneTextStream << "\nStack trace:\n";

                bool isNth = false;
                for (const auto &entry : nonCppStackTrace.value())
                {
                    if (isNth)
                    {
                        zoneTextStream << "\n";
                    }
                    else
                    {
                        isNth = true;
                    }

                    zoneTextStream << "\t" << entry.functionName << " at " << entry.file << ":" << entry.line << ":"
                                   << entry.column;
                }
            }
        }

        const auto zoneText = zoneTextStream.str();
        ::tracy::___tracy_emit_zone_text(tracyCZoneCtx, zoneText.c_str(), static_cast<uint32_t>(zoneText.length()));

        return tracyCZoneCtx;
    }

    void TracyOttreliteBackend::maybeAppendZoneMetadata(std::ostringstream &outputStream,
                                                        const MaybeEventArgsMap &maybeEventArgs,
                                                        const std::string &metadataPhase)
    {
        if (maybeEventArgs.has_value())
        {
            outputStream << "\nEvent " << metadataPhase << " metadata:\n";

            for (const auto &[key, value] : maybeEventArgs.value())
            {
                outputStream << "\t" << key << ": " << value << "\n";
            }
        }
    }
} // namespace ottrelite::backend::tracy
