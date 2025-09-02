#pragma once

#include <jsi/jsi.h>
#include <memory>
#include <optional>
#include <set>
#include <string>

#include "HybridReactNativeOttreliteBackendTracySpec.hpp"
#include "backend/TracyOttreliteBackend.hpp"

using namespace facebook;

namespace margelo::nitro::ottrelite::backend::tracy
{
    class ReactNativeOttreliteBackendTracy : public HybridReactNativeOttreliteBackendTracySpec
    {
      public:
        /**
         * Constructor for the ReactNativeOttrelite Tracy Wrapper Backend Nitro Module.
         */
        ReactNativeOttreliteBackendTracy();

        /**
         * Installs the Tracy wrapper backend.
         */
        void install() override;
    };
} // namespace margelo::nitro::ottrelite::backend::tracy
