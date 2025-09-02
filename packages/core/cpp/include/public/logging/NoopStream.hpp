#pragma once

#include "NoopBuffer.hpp"

#include <ostream>

namespace ottrelite::logging::streams
{
    class NoopStream : public std::ostream
    {
      public:
        NoopStream() : std::ostream(&nullBuffer)
        {
        }

      private:
        NoopBuffer nullBuffer;
    };
} // namespace ottrelite::logging::streams
