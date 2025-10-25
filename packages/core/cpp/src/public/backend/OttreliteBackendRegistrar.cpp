#include "OttreliteBackendRegistrar.hpp"

#include <Logger.hpp>

namespace ottrelite::backend
{
    void OttreliteBackendRegistrar::registerBackend(const std::shared_ptr<BaseOttreliteBackend> &backend)
    {
        logger_.debug() << "Registering backend '" << reinterpret_cast<std::uintptr_t>(backend.get()) << "' under name "
                        << backend->getName();

        backends.insert(backend);

        if (auto syncBackend = std::dynamic_pointer_cast<IntermediateOttreliteBackendWithSync<true>>(backend))
        {
            logger_.debug() << "Registering sync-capable backend '" << backend->getName() << "'";
            syncBackends_.insert(syncBackend);
        }

        if (auto asyncBackend = std::dynamic_pointer_cast<IntermediateOttreliteBackendWithAsync<true>>(backend))
        {
            logger_.debug() << "Registering async-capable backend '" << backend->getName() << "'";
            asyncBackends_.insert(asyncBackend);
        }

        if (auto counterBackend = std::dynamic_pointer_cast<IntermediateOttreliteBackendWithCounter<true>>(backend))
        {
            logger_.debug() << "Registering counter-capable backend '" << backend->getName() << "'";
            counterBackends_.insert(counterBackend);
        }

        logger_.debug() << "Currently registered: " << syncBackends_.size() << " sync-capable backend(s), "
                        << asyncBackends_.size() << " async-capable backend(s), " << counterBackends_.size()
                        << " counter-capable backend(s), total: " << backends.size() << " backends";
    }

    void OttreliteBackendRegistrar::unregisterBackend(const std::shared_ptr<BaseOttreliteBackend> &backend)
    {
        logger_.debug() << "Unregistering backend " << backend->getName();

        backends.erase(backend);

        if (auto syncBackend = std::dynamic_pointer_cast<IntermediateOttreliteBackendWithSync<true>>(backend))
        {
            syncBackends_.erase(syncBackend);
        }

        if (auto asyncBackend = std::dynamic_pointer_cast<IntermediateOttreliteBackendWithAsync<true>>(backend))
        {
            asyncBackends_.erase(asyncBackend);
        }

        if (auto counterBackend = std::dynamic_pointer_cast<IntermediateOttreliteBackendWithCounter<true>>(backend))
        {
            counterBackends_.erase(counterBackend);
        }
    }

#pragma mark Static fields
    std::set<std::shared_ptr<BaseOttreliteBackend>, BaseOttreliteBackend::Comparator>
        OttreliteBackendRegistrar::backends;

    std::set<std::shared_ptr<IntermediateOttreliteBackendWithSync<true>>,
             IntermediateOttreliteBackendWithSyncComparator>
        OttreliteBackendRegistrar::syncBackends_;

    std::set<std::shared_ptr<IntermediateOttreliteBackendWithAsync<true>>,
             IntermediateOttreliteBackendWithAsyncComparator>
        OttreliteBackendRegistrar::asyncBackends_;

    std::set<std::shared_ptr<IntermediateOttreliteBackendWithCounter<true>>,
             IntermediateOttreliteBackendWithCounterComparator>
        OttreliteBackendRegistrar::counterBackends_;

    logging::Logger OttreliteBackendRegistrar::logger_{"OttreliteBackendRegistrar"};
} // namespace ottrelite::backend
