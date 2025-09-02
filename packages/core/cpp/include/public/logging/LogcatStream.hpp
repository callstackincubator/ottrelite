#pragma once

#include <ostream>

#include "LogcatBuffer.hpp"

namespace ottrelite::logging::streams
{
    class LogcatStream : public std::ostream
    {
      public:
#if __ANDROID__
        LogcatStream(android_LogPriority priority, const char *tag) : std::ostream(&buffer_), buffer_(priority, tag)
        {
        }
#else
        LogcatStream(os_log_type_t priority, const char *tag) : std::ostream(&buffer_), buffer_(priority, tag)
        {
        }
#endif

      private:
        LogcatBuffer buffer_;
    };
} // namespace ottrelite::logging::streams
