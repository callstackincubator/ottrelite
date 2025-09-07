#include "ReactNativeOttreliteInteropOTELOnLoad.hpp"

#include <jni.h>

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *)
{
    return margelo::nitro::ottrelite::interop::otel::initialize(vm);
}
