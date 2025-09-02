#include "ReactNativeOttrelite_BackendPlatformOnLoad.hpp"
#include <jni.h>

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *)
{
    return margelo::nitro::ottrelite::backend::platform::initialize(vm);
}
