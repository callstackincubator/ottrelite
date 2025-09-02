#pragma once

#include <memory>
#include <optional>
#include <string>
#include <type_traits>
#include <unordered_map>
#include <vector>

#include "NonCppStackTraceEntry.hpp"
#include "types.hpp"

namespace ottrelite::backend
{
    using MaybeEventArgsMap = ::ottrelite::MaybeEventArgsMap;

    class BaseOttreliteBackend
    {
      public:
        /**
         * Comparator for shared_ptr<BaseOttreliteBackend> objects
         */
        struct Comparator
        {
            /**
             * Strict weak ordering comparison operator
             * @param lhs the left hand side instance
             * @param rhs the right hand side instance
             * @return true if lhs < rhs, false otherwise
             */
            bool operator()(const std::shared_ptr<BaseOttreliteBackend> &lhs,
                            const std::shared_ptr<BaseOttreliteBackend> &rhs) const
            {
                return strcmp(lhs->getName(), rhs->getName()) < 0;
            }
        };

        explicit BaseOttreliteBackend(const char *name) : name(name) {};

        BaseOttreliteBackend() = delete;

        virtual ~BaseOttreliteBackend() = default;

        // disable copy semantics
        BaseOttreliteBackend(const BaseOttreliteBackend &) = delete;

        BaseOttreliteBackend &operator=(const BaseOttreliteBackend &) = delete;

        // disable move semantics
        BaseOttreliteBackend(BaseOttreliteBackend &&) = delete;

        BaseOttreliteBackend &operator=(BaseOttreliteBackend &&) = delete;

        const char *getName()
        {
            return name;
        }

      private:
        const char *name;

        template <bool supportsSyncEvents, bool supportsAsyncEvents, bool supportsCounterEvents>
        friend class OttreliteBackend;
    };

    /* Conditional sync support intermediate class - start */

    template <bool supportsSyncEvents> class IntermediateOttreliteBackendWithSync
    {
      private:
        IntermediateOttreliteBackendWithSync() = default;

        virtual ~IntermediateOttreliteBackendWithSync() = default;

        template <bool _supportsSyncEvents, bool _supportsAsyncEvents> friend class OttreliteBackend;
    };

    template <> class IntermediateOttreliteBackendWithSync<true>
    {
      public:
        virtual void beginEvent(const std::string &eventName,
                                const std::optional<std::vector<structures::NonCppStackTraceEntry>> &nonCppStackTrace,
                                const std::string &sourceApiName, const MaybeEventArgsMap &maybeEventArgs) = 0;

        virtual void endEvent(const MaybeEventArgsMap &maybeEventArgs) = 0;
    };

    template <> class IntermediateOttreliteBackendWithSync<false>
    {
    };

    /**
     * Comparator for shared_ptr<IntermediateOttreliteBackendWithSync<*>> objects
     */
    struct IntermediateOttreliteBackendWithSyncComparator
    {
        /**
         * Strict weak ordering comparison operator
         * @param lhs the left hand side instance
         * @param rhs the right hand side instance
         * @return true if lhs < rhs, false otherwise
         */
        template <bool lhsSupportsSyncEvents, bool rhsSupportsSyncEvents>
        bool operator()(const std::shared_ptr<IntermediateOttreliteBackendWithSync<lhsSupportsSyncEvents>> &lhs,
                        const std::shared_ptr<IntermediateOttreliteBackendWithSync<rhsSupportsSyncEvents>> &rhs) const
        {
            static BaseOttreliteBackend::Comparator cmp;
            return cmp(std::dynamic_pointer_cast<BaseOttreliteBackend>(lhs),
                       std::dynamic_pointer_cast<BaseOttreliteBackend>(rhs));
        }
    };

    /* Conditional sync support intermediate class - end */

    /* Conditional async support intermediate class - start */

    template <bool supportsAsyncEvents> class IntermediateOttreliteBackendWithAsync
    {
      private:
        IntermediateOttreliteBackendWithAsync() = default;

        virtual ~IntermediateOttreliteBackendWithAsync() = default;

        template <bool _supportsSyncEvents, bool _supportsAsyncEvents> friend class OttreliteBackend;
    };

    template <> class IntermediateOttreliteBackendWithAsync<true>
    {
      public:
        virtual void beginAsyncEvent(
            const std::string &eventName,
            const std::optional<std::vector<structures::NonCppStackTraceEntry>> &nonCppStackTrace,
            const std::string &sourceApiName, uint32_t token, const MaybeEventArgsMap &maybeEventArgs) = 0;

        virtual void endAsyncEvent(const std::string &eventName, uint32_t token,
                                   const MaybeEventArgsMap &maybeEventArgs) = 0;
    };

    template <> class IntermediateOttreliteBackendWithAsync<false>
    {
    };

    /**
     * Comparator for shared_ptr<IntermediateOttreliteBackendWithAsync<*>> objects
     */
    struct IntermediateOttreliteBackendWithAsyncComparator
    {
        /**
         * Strict weak ordering comparison operator
         * @param lhs the left hand side instance
         * @param rhs the right hand side instance
         * @return true if lhs < rhs, false otherwise
         */
        template <bool lhsSupportsAsyncEvents, bool rhsSupportsAsyncEvents>
        bool operator()(const std::shared_ptr<IntermediateOttreliteBackendWithAsync<lhsSupportsAsyncEvents>> &lhs,
                        const std::shared_ptr<IntermediateOttreliteBackendWithAsync<rhsSupportsAsyncEvents>> &rhs) const
        {
            static BaseOttreliteBackend::Comparator cmp;
            return cmp(std::dynamic_pointer_cast<BaseOttreliteBackend>(lhs),
                       std::dynamic_pointer_cast<BaseOttreliteBackend>(rhs));
        }
    };

    /* Conditional async support intermediate class - end */

    /* Conditional counter support intermediate class - start */

    template <bool supportsCounterEvents> class IntermediateOttreliteBackendWithCounter
    {
      private:
        IntermediateOttreliteBackendWithCounter() = default;

        virtual ~IntermediateOttreliteBackendWithCounter() = default;

        template <bool _supportsSyncEvents, bool _supportsCounterEvents> friend class OttreliteBackend;
    };

    template <> class IntermediateOttreliteBackendWithCounter<true>
    {
      public:
        virtual void counterEvent(const std::string &eventName, double token) = 0;
    };

    template <> class IntermediateOttreliteBackendWithCounter<false>
    {
    };

    /**
     * Comparator for shared_ptr<IntermediateOttreliteBackendWithCounter<*>> objects
     */
    struct IntermediateOttreliteBackendWithCounterComparator
    {
        /**
         * Strict weak ordering comparison operator
         * @param lhs the left hand side instance
         * @param rhs the right hand side instance
         * @return true if lhs < rhs, false otherwise
         */
        template <bool lhsSupportsCounterEvents, bool rhsSupportsCounterEvents>
        bool operator()(
            const std::shared_ptr<IntermediateOttreliteBackendWithCounter<lhsSupportsCounterEvents>> &lhs,
            const std::shared_ptr<IntermediateOttreliteBackendWithCounter<rhsSupportsCounterEvents>> &rhs) const
        {
            static BaseOttreliteBackend::Comparator cmp;
            return cmp(std::dynamic_pointer_cast<BaseOttreliteBackend>(lhs),
                       std::dynamic_pointer_cast<BaseOttreliteBackend>(rhs));
        }
    };

    /* Conditional counter support intermediate class - end */

    /* Exposed class  */
    template <bool supportsSyncEvents, bool supportsAsyncEvents, bool supportsCounterEvents>
    class OttreliteBackend : public BaseOttreliteBackend,
                             public IntermediateOttreliteBackendWithSync<supportsSyncEvents>,
                             public IntermediateOttreliteBackendWithAsync<supportsAsyncEvents>,
                             public IntermediateOttreliteBackendWithCounter<supportsCounterEvents>
    {
      public:
        explicit OttreliteBackend(const char *name) : BaseOttreliteBackend(name) {};

        virtual ~OttreliteBackend() = default;
    };

    // not to break the One Definition Rule (ODR), explicitly extern all the class templates here
    extern template class ::ottrelite::backend::OttreliteBackend<true, false, true>;
    extern template class ::ottrelite::backend::OttreliteBackend<true, false, false>;
    extern template class ::ottrelite::backend::OttreliteBackend<false, true, true>;
    extern template class ::ottrelite::backend::OttreliteBackend<false, true, false>;
    extern template class ::ottrelite::backend::OttreliteBackend<true, true, true>;
    extern template class ::ottrelite::backend::OttreliteBackend<true, true, false>;
    extern template class ::ottrelite::backend::OttreliteBackend<false, false, true>;
    extern template class ::ottrelite::backend::OttreliteBackend<false, false, false>;

    extern template class IntermediateOttreliteBackendWithSync<true>;
    extern template class IntermediateOttreliteBackendWithSync<false>;

    extern template class IntermediateOttreliteBackendWithAsync<true>;
    extern template class IntermediateOttreliteBackendWithAsync<false>;

    extern template class IntermediateOttreliteBackendWithCounter<true>;
    extern template class IntermediateOttreliteBackendWithCounter<false>;
} // namespace ottrelite::backend
