#include "JSIUtils.hpp"

namespace ottrelite::utils
{
    const char *getValueKind(const facebook::jsi::Value &value)
    {
        if (value.isBigInt())
        {
            return "BigInt";
        }
        else if (value.isBool())
        {
            return "Boolean";
        }
        else if (value.isNumber())
        {
            return "Number";
        }
        else if (value.isSymbol())
        {
            return "Symbol";
        }
        else if (value.isObject())
        {
            return "Object";
        }
        else if (value.isString())
        {
            return "String";
        }
        else if (value.isUndefined())
        {
            return "Undefined";
        }
        else if (value.isNull())
        {
            return "Null";
        }
        else
        {
            return "Unknown";
        }
    }
} // namespace ottrelite::utils
