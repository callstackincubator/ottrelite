#pragma once

#include <ostream>
#include <string>

#include "AutoflushStreamWrapper.hpp"
#include "LogLevel.hpp"
#include "LogcatStream.hpp"
#include "NoopStream.hpp"

namespace ottrelite::logging
{
    class Logger
    {

      public:
        explicit Logger(const char *loggerName);

        ~Logger();

        AutoflushStreamWrapper _log(LogLevel level, const char *message);

        AutoflushStreamWrapper debug();
        AutoflushStreamWrapper debug(const char *message);

        AutoflushStreamWrapper info();
        AutoflushStreamWrapper info(const char *message);

        AutoflushStreamWrapper warn();
        AutoflushStreamWrapper warn(const char *message);

        AutoflushStreamWrapper error();
        AutoflushStreamWrapper error(const char *message);

      private:
        const char *loggerName_;

        streams::LogcatStream debugStream_;
        streams::LogcatStream infoStream_;
        streams::LogcatStream warnStream_;
        streams::LogcatStream errorStream_;

        streams::NoopStream noopStream_;
    };
} // namespace ottrelite::logging
