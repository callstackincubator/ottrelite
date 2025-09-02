#include "LogcatBuffer.hpp"

namespace ottrelite::logging::streams
{
    int LogcatBuffer::sync()
    {
        flush();
        return 0;
    }

    int LogcatBuffer::overflow(int c)
    {
        if (c == '\n')
        {
            flush();
        }
        else
        {
            buffer_ += static_cast<char>(c);
        }
        return c;
    }

    void LogcatBuffer::flush()
    {
        if (!buffer_.empty())
        {
#if __ANDROID__
            __android_log_print(priority_, tag_, "%s", buffer_.c_str());
#elif __APPLE__
            os_log_with_type(OS_LOG_DEFAULT, priority_, "%{public}s", buffer_.c_str());
#endif

            buffer_.clear();
        }
    }
} // namespace ottrelite::logging::streams
