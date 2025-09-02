#pragma once

#include <jsi/jsi.h>
#include <memory>
#include <optional>
#include <set>
#include <string>

#include "HybridReactNativeOttreliteBackendPlatformSpec.hpp"
#include "backend/PlatformOttreliteBackend.hpp"

using namespace facebook;

namespace margelo::nitro::ottrelite::backend::platform
{
    class ReactNativeOttreliteBackendPlatform : public HybridReactNativeOttreliteBackendPlatformSpec
    {
      public:
        /**
         * Constructor for the ReactNativeOttrelite ATrace Backend Nitro Module.
         */
        ReactNativeOttreliteBackendPlatform();

        /**
         * Installs the ATrace backend.
         */
        void install() override;
    };
} // namespace margelo::nitro::ottrelite::backend::platform
