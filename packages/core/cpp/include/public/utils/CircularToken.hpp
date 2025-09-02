#pragma once

#include <mutex>

namespace ottrelite::utils
{
    class CircularToken
    {
      public:
        CircularToken() = default;

        /**
         * Overflow-safe, thread-safe method to obtain a next token
         * @return The next value of the token
         */
        uint32_t nextToken();

      private:
        uint32_t token_{0};

        std::mutex mutex_;
    };
} // namespace ottrelite::utils
