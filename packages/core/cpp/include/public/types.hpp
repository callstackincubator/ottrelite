#pragma once

#include <optional>
#include <string>
#include <unordered_map>

namespace ottrelite
{
    using MaybeEventArgsMap = std::optional<std::unordered_map<std::string, std::string>>;
} // namespace ottrelite
