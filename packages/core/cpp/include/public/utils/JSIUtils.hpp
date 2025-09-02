#pragma once

#include <jsi/jsi.h>

namespace ottrelite::utils
{
    const char *getValueKind(const facebook::jsi::Value &value);
} // namespace ottrelite::utils
