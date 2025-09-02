#pragma once

#include <memory>
#include <set>
#include <string>

#include "Logger.hpp"
#include "OttreliteBackend.hpp"

namespace ottrelite::backend
{
    class OttreliteBackendRegistrar
    {
      public:
        /**
         * Registers the given backend with the OttreliteBackendRegistrar.
         *
         * @param backend The backend to register
         *
         * @note The backend will be registered with the OttreliteBackendRegistrar and will be invoked for all events
         * that it supports.
         */
        static void registerBackend(const std::shared_ptr<BaseOttreliteBackend> &backend);

        /**
         * Unregisters the given backend from the OttreliteBackendRegistrar.
         *
         * @param backend The backend to unregister
         */
        static void unregisterBackend(const std::shared_ptr<BaseOttreliteBackend> &backend);

        static std::set<std::shared_ptr<BaseOttreliteBackend>, BaseOttreliteBackend::Comparator> &getBackends()
        {
            return backends;
        }

        static std::set<std::shared_ptr<IntermediateOttreliteBackendWithSync<true>>,
                        IntermediateOttreliteBackendWithSyncComparator> &
        getSyncBackends()
        {
            return syncBackends_;
        }

        static std::set<std::shared_ptr<IntermediateOttreliteBackendWithAsync<true>>,
                        IntermediateOttreliteBackendWithAsyncComparator> &
        getAsyncBackends()
        {
            return asyncBackends_;
        }

        static std::set<std::shared_ptr<IntermediateOttreliteBackendWithCounter<true>>,
                        IntermediateOttreliteBackendWithCounterComparator> &
        getCounterBackends()
        {
            return counterBackends_;
        }

      private:
        /**
         * Stores all registered backends.
         */
        static std::set<std::shared_ptr<BaseOttreliteBackend>, BaseOttreliteBackend::Comparator> backends;

        /**
         * Stores all registered backends that support synchronous events.
         */
        static std::set<std::shared_ptr<IntermediateOttreliteBackendWithSync<true>>,
                        IntermediateOttreliteBackendWithSyncComparator>
            syncBackends_;

        /**
         * Stores all registered backends that support asynchronous events.
         */
        static std::set<std::shared_ptr<IntermediateOttreliteBackendWithAsync<true>>,
                        IntermediateOttreliteBackendWithAsyncComparator>
            asyncBackends_;

        /**
         * Stores all registered backends that support counter events.
         */
        static std::set<std::shared_ptr<IntermediateOttreliteBackendWithCounter<true>>,
                        IntermediateOttreliteBackendWithCounterComparator>
            counterBackends_;

        static logging::Logger logger_;
    };
} // namespace ottrelite::backend
