#include "ReactNativeOttreliteBackendPlatform.hpp"

#include <ReactNativeOttrelite/JSIUtils.hpp>
#include <ReactNativeOttrelite/OttreliteBackendRegistrar.hpp>

#include "backend/PlatformOttreliteBackend.hpp"

namespace margelo::nitro::ottrelite::backend::platform
{
    ReactNativeOttreliteBackendPlatform::ReactNativeOttreliteBackendPlatform() : HybridObject(TAG)
    {
    }

    void ReactNativeOttreliteBackendPlatform::install()
    {
        ::ottrelite::backend::OttreliteBackendRegistrar::registerBackend(
            std::make_shared<::ottrelite::backend::platform::PlatformOttreliteBackend>());
    }
} // namespace margelo::nitro::ottrelite::backend::platform
