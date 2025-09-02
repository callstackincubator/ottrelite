#pragma once

#include <iostream>
#include <sstream>

namespace ottrelite::logging
{
    /**
     * A wrapper for an std::ostream that will flush it upon destruction (RAII)
     */
    class AutoflushStreamWrapper
    {
      public:
        explicit AutoflushStreamWrapper(std::ostream &os) : stream_(os)
        {
        }

        ~AutoflushStreamWrapper()
        {
            stream_ << std::flush;
        }

        template <typename T> AutoflushStreamWrapper &operator<<(const T &val)
        {
            stream_ << val;
            return *this;
        }

      private:
        std::ostream &stream_;
    };
} // namespace ottrelite::logging
