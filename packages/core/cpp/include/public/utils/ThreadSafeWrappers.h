#pragma once

#include <memory>
#include <set>
#include <shared_mutex>

namespace ottrelite::utils
{
    /**
     * Represents a generic class that holds a mutex lock during its lifetime, wrapping a reference to the accessed
     * resource, effectively making access to it thread-safe.
     *
     * @tparam T the type that reference to is held by this wrapper
     * @tparam Lock the type of lock to be used
     *
     * @see ottrelite::utils::ROThreadSafeWrapper
     * @see ottrelite::utils::RWThreadSafeWrapper
     */
    template <typename T, template <typename> class Lock> class GenericThreadSafeWrapper
    {
      public:
        GenericThreadSafeWrapper(const T &ref, std::shared_mutex &mutex) : ref_(ref), lock_(mutex)
        {
        }

        const T &get() const
        {
            return ref_;
        }

      private:
        const T &ref_;
        Lock<std::shared_mutex> lock_;
    };

    /**
     * Read-Only (RO) thread-safe wrapper that holds a mutex lock during its lifetime, wrapping a reference to the
     * accessed resource, effectively making access to it thread-safe.
     *
     * Uses a std::shared_lock under the hood.
     *
     * @tparam T the type that reference to is held by this wrapper
     */
    template <typename T> class ROThreadSafeWrapper : public GenericThreadSafeWrapper<T, std::shared_lock>
    {
      public:
        ROThreadSafeWrapper(const T &ref, std::shared_mutex &mutex)
            : GenericThreadSafeWrapper<T, std::shared_lock>(ref, mutex)
        {
        }
    };

    /**
     * Read-Write (RW) thread-safe wrapper that holds a mutex lock during its lifetime, wrapping a reference to the
     * accessed resource, effectively making access to it thread-safe.
     *
     * Uses a std::unique_lock under the hood.
     *
     * @tparam T the type that reference to is held by this wrapper
     */
    template <typename T> class RWThreadSafeWrapper : public GenericThreadSafeWrapper<T, std::unique_lock>
    {
      public:
        RWThreadSafeWrapper(const T &ref, std::shared_mutex &mutex)
            : GenericThreadSafeWrapper<T, std::unique_lock>(ref, mutex)
        {
        }
    };
} // namespace ottrelite::utils
