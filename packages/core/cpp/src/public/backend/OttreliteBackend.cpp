#include "OttreliteBackend.hpp"

namespace ottrelite::backend
{
    template class ottrelite::backend::OttreliteBackend<true, false, true>;
    template class ottrelite::backend::OttreliteBackend<true, false, false>;
    template class ottrelite::backend::OttreliteBackend<false, true, true>;
    template class ottrelite::backend::OttreliteBackend<false, true, false>;
    template class ottrelite::backend::OttreliteBackend<true, true, true>;
    template class ottrelite::backend::OttreliteBackend<true, true, false>;
    template class ottrelite::backend::OttreliteBackend<false, false, true>;
    template class ottrelite::backend::OttreliteBackend<false, false, false>;

    template class IntermediateOttreliteBackendWithSync<true>;
    template class IntermediateOttreliteBackendWithSync<false>;

    template class IntermediateOttreliteBackendWithAsync<true>;
    template class IntermediateOttreliteBackendWithAsync<false>;

    template class IntermediateOttreliteBackendWithCounter<true>;
    template class IntermediateOttreliteBackendWithCounter<false>;
} // namespace ottrelite::backend
