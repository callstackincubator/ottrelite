#pragma once

#include <jsi/jsi.h>
#include <memory>
#include <optional>
#include <set>
#include <string>

#include "HybridNitroOttreliteConsumerLibCppSpec.hpp"

using namespace facebook;

namespace margelo::nitro::ottreliteconsumerlib
{
    class NitroOttreliteConsumerLibCpp : public HybridNitroOttreliteConsumerLibCppSpec
    {
      public:
        /**
         * Constructor for the OttreliteConsumerLib Nitro Module.
         */
        NitroOttreliteConsumerLibCpp();

        std::vector<double> generateImage(double width, double height) override;
    };
} // namespace margelo::nitro::ottreliteconsumerlib
