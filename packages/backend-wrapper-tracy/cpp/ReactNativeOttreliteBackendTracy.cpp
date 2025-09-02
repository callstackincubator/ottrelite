#include "ReactNativeOttreliteBackendTracy.hpp"

#include <ReactNativeOttrelite/OttreliteBackendRegistrar.hpp>

#include "backend/TracyOttreliteBackend.hpp"

namespace margelo::nitro::ottrelite::backend::tracy
{
    ReactNativeOttreliteBackendTracy::ReactNativeOttreliteBackendTracy() : HybridObject(TAG)
    {
    }

    void ReactNativeOttreliteBackendTracy::install()
    {
        ::ottrelite::backend::OttreliteBackendRegistrar::registerBackend(
            std::make_shared<::ottrelite::backend::tracy::TracyOttreliteBackend>());
    }
} // namespace margelo::nitro::ottrelite::backend::tracy
