#include "ReactNativeOttrelite_BackendTracyOnLoad.hpp"
#include <jni.h>

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *)
{
    return margelo::nitro::ottrelite::backend::tracy::initialize(vm);
}
