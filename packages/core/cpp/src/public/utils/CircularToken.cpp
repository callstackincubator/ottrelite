#include "CircularToken.hpp"

#include <limits>

namespace ottrelite::utils
{
    uint32_t CircularToken::nextToken()
    {
        std::lock_guard<std::mutex> lock(mutex_);

        token_++;

        // prevent overflow
        if (token_ == std::numeric_limits<uint32_t>::max())
        {
            token_ = 1;
        }

        return token_;
    }
} // namespace ottrelite::utils
