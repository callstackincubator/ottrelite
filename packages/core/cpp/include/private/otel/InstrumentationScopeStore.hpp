#pragma once

#include <stddef.h>
#include <string>
#include <tuple>
#include <unordered_map>

#include "opentelemetry/sdk/instrumentationscope/instrumentation_scope.h"

namespace ottrelite::otel
{
    using ScopeKey = std::tuple<std::string, std::string, std::string>;

    /**
     * Hash function for tuple keys; needed to store the tuple in an unordered_map in InstrumentationScopeStore
     */
    struct TupleHash
    {
        std::size_t operator()(const std::tuple<std::string, std::string, std::string> &t) const;
    };

    /**
     * Singleton store for InstrumentationScope instances to avoid duplicates
     */
    class InstrumentationScopeStore
    {
      public:
        /**
         * Retrieves or creates an InstrumentationScope for the given parameters.
         */
        static const opentelemetry::sdk::instrumentationscope::InstrumentationScope &getOrCreate(
            const std::string &name, const std::string &version = "", const std::string &schemaUrl = "");

      private:
        static std::unordered_map<
            ScopeKey, std::unique_ptr<opentelemetry::sdk::instrumentationscope::InstrumentationScope>, TupleHash>
            scopes_;
    };
} // namespace ottrelite::otel
