#pragma once

#include <stddef.h>

namespace ottrelite::utils
{
    /**
     * Thread-safe container for bool arrays to work around std::vector<bool> specialization
     */
    class BoolArrayContainer
    {
      private:
        bool *data_;
        size_t size_;

      public:
        BoolArrayContainer() : data_(nullptr), size_(0)
        {
        }

        explicit BoolArrayContainer(size_t size) : size_(size)
        {
            data_ = size > 0 ? new bool[size] : nullptr;
        }

        ~BoolArrayContainer()
        {
            delete[] data_;
        }

        // delete copy constructor and assignment operator to prevent double deletion
        BoolArrayContainer(const BoolArrayContainer &) = delete;
        BoolArrayContainer &operator=(const BoolArrayContainer &) = delete;

        // move constructor and assignment operator
        BoolArrayContainer(BoolArrayContainer &&other) noexcept : data_(other.data_), size_(other.size_)
        {
            other.data_ = nullptr;
            other.size_ = 0;
        }

        BoolArrayContainer &operator=(BoolArrayContainer &&other) noexcept;

        void resize(size_t new_size);

        bool *data()
        {
            return data_;
        }

        const bool *data() const
        {
            return data_;
        }

        size_t size() const
        {
            return size_;
        }

        bool &operator[](size_t index)
        {
            return data_[index];
        }

        const bool &operator[](size_t index) const
        {
            return data_[index];
        }
    };
} // namespace ottrelite::utils
