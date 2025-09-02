#pragma once

#include <string>

namespace ottrelite::backend::structures
{
    struct NonCppStackTraceEntry
    {
      public:
        std::string functionName;
        double line;
        double column;
        std::string file;
    };
} // namespace ottrelite::backend::structures
