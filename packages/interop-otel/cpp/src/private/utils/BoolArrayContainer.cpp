#include "BoolArrayContainer.hpp"

namespace ottrelite::interop::otel::utils
{
    BoolArrayContainer &BoolArrayContainer::operator=(BoolArrayContainer &&other) noexcept
    {
        if (this != &other)
        {
            delete[] data_;
            data_ = other.data_;
            size_ = other.size_;
            other.data_ = nullptr;
            other.size_ = 0;
        }
        return *this;
    }

    void BoolArrayContainer::resize(size_t new_size)
    {
        if (new_size != size_)
        {
            delete[] data_;
            size_ = new_size;
            data_ = new_size > 0 ? new bool[new_size] : nullptr;
        }
    }
} // namespace ottrelite::interop::otel::utils
