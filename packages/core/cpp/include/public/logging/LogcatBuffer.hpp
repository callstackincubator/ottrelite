#pragma once

#if __ANDROID__
#include <android/log.h>
#elif __APPLE__
#include <os/log.h>
#endif

#include <ostream>
#include <streambuf>

namespace ottrelite::logging::streams
{
    class LogcatBuffer : public std::streambuf
    {
      public:
#if __ANDROID__
        explicit LogcatBuffer(android_LogPriority priority, const char *tag) : tag_(tag), priority_(priority)
        {
        }
#else
        explicit LogcatBuffer(os_log_type_t priority, const char *tag) : tag_(tag), priority_(priority)
        {
        }
#endif

      protected:
        int sync() override;

        int overflow(int c) override;

      private:
        void flush();

        const char *tag_;
        std::string buffer_;

#if __ANDROID__
        android_LogPriority priority_;
#elif __APPLE__
        os_log_type_t priority_;
#endif
    };
} // namespace ottrelite::logging::streams
