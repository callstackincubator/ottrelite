#include "Logger.hpp"

#include <streambuf>
#include <string>

namespace ottrelite::logging
{
#if __ANDROID__
    static constexpr auto DEBUG_PREFIX = "";
    static constexpr auto INFO_PREFIX = "";
    static constexpr auto WARN_PREFIX = "";
    static constexpr auto ERROR_PREFIX = "";
#elif __APPLE__
    static constexpr auto DEBUG_PREFIX = "[DEBUG] ";
    static constexpr auto INFO_PREFIX = "[INFO] ";
    static constexpr auto WARN_PREFIX = "[WARN] ";
    static constexpr auto ERROR_PREFIX = "[ERROR] ";
#endif

    Logger::Logger(const char *loggerName)
        : loggerName_(strdup(loggerName)),
#if __ANDROID__
          debugStream_{ANDROID_LOG_DEBUG, loggerName_}, infoStream_{ANDROID_LOG_INFO, loggerName_},
          warnStream_{ANDROID_LOG_WARN, loggerName_}, errorStream_{ANDROID_LOG_ERROR, loggerName_}
#elif __APPLE__
          debugStream_{OS_LOG_TYPE_DEBUG, loggerName_}, infoStream_{OS_LOG_TYPE_INFO, loggerName_},
          warnStream_{OS_LOG_TYPE_INFO, loggerName_}, errorStream_{OS_LOG_TYPE_ERROR, loggerName_}
#endif
    {
    }

    Logger::~Logger()
    {
        free((void *)loggerName_);
    }

    AutoflushStreamWrapper Logger::_log(LogLevel level, const char *message)
    {
        switch (level)
        {
        default:
        case LogLevel::L_DEBUG:
            return AutoflushStreamWrapper{debugStream_ << DEBUG_PREFIX << message};

        case LogLevel::INFO:
            return AutoflushStreamWrapper{infoStream_ << INFO_PREFIX << message};

        case LogLevel::WARN:
            return AutoflushStreamWrapper{warnStream_ << WARN_PREFIX << message};

        case LogLevel::ERROR:
            return AutoflushStreamWrapper{errorStream_ << ERROR_PREFIX << message};
        }
    }

    AutoflushStreamWrapper Logger::debug()
    {
#if OTTRELITE_DEBUG_LOGS
        return debug("");
#else
        return AutoflushStreamWrapper{noopStream_};
#endif
    }

    AutoflushStreamWrapper Logger::debug(const char *message)
    {
#if OTTRELITE_DEBUG_LOGS
        return _log(LogLevel::L_DEBUG, message);
#else
        return AutoflushStreamWrapper{noopStream_};
#endif
    }

    AutoflushStreamWrapper Logger::info()
    {
        return info("");
    }

    AutoflushStreamWrapper Logger::info(const char *message)
    {
        return _log(LogLevel::INFO, message);
    }

    AutoflushStreamWrapper Logger::warn()
    {
        return warn("");
    }

    AutoflushStreamWrapper Logger::warn(const char *message)
    {
        return _log(LogLevel::WARN, message);
    }

    AutoflushStreamWrapper Logger::error()
    {
        return error("");
    }

    AutoflushStreamWrapper Logger::error(const char *message)
    {
        return _log(LogLevel::ERROR, message);
    }
} // namespace ottrelite::logging
