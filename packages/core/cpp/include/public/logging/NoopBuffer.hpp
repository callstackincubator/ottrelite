#pragma once

#include <streambuf>

namespace ottrelite::logging::streams
{
    class NoopBuffer : public std::streambuf
    {
      protected:
        int overflow(int c) override
        {
            return c;
        }
    };
} // namespace ottrelite::logging::streams
