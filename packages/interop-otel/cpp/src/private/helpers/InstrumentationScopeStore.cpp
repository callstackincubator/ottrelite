#include "InstrumentationScopeStore.hpp"

#include <utility>

namespace ottrelite::interop::otel
{
    std::size_t TupleHash::operator()(const std::tuple<std::string, std::string, std::string> &t) const
    {
        auto h1 = std::hash<std::string>{}(std::get<0>(t));
        auto h2 = std::hash<std::string>{}(std::get<1>(t));
        auto h3 = std::hash<std::string>{}(std::get<2>(t));
        return h1 ^ (h2 << 1) ^ (h3 << 2);
    }

    const opentelemetry::sdk::instrumentationscope::InstrumentationScope &InstrumentationScopeStore::getOrCreate(
        const std::string &name, const std::string &version, const std::string &schemaUrl)
    {
        // create a key for lookup
        ScopeKey key = std::make_tuple(name, version, schemaUrl);

        // check if we already have this scope & return it, if cache hit
        auto it = scopes_.find(key);
        if (it != scopes_.end())
        {
            return *it->second;
        }

        // create new scope
        auto scope =
            opentelemetry::sdk::instrumentationscope::InstrumentationScope::Create(name, version, schemaUrl, {});

        // store and return reference
        const auto &scopeRef = *scope;
        scopes_[key] = std::move(scope);
        return scopeRef;
    }

    std::unordered_map<ScopeKey, std::unique_ptr<opentelemetry::sdk::instrumentationscope::InstrumentationScope>,
                       TupleHash>
        InstrumentationScopeStore::scopes_;
} // namespace ottrelite::interop::otel
