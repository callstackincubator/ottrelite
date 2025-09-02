#include "ReactNativeOttreliteOnLoad.hpp"
#include <android/log.h>
#include <jni.h>
#include <unordered_map>

#include "Ottrelite.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *)
{
    return margelo::nitro::ottrelite::initialize(vm);
}

// Tag for Android logging
#define LOG_TAG "OttreliteJNI"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)

// Convert Java String to C++ std::string
static std::string jstringToCppString(JNIEnv *env, jstring jStr)
{
    if (!jStr)
        return "";
    const char *chars = env->GetStringUTFChars(jStr, nullptr);
    std::string str = chars;
    env->ReleaseStringUTFChars(jStr, chars);
    return str;
}

static ::ottrelite::MaybeEventArgsMap convertJavaMapToCppEventArgs(JNIEnv *env, jobject javaMap)
{
    if (!javaMap)
    {
        return {{}};
    }

    std::unordered_map<std::string, std::string> cppMap; // Assuming MaybeEventArgsMap is optional<EventArgsMap>

    jclass mapClass = env->GetObjectClass(javaMap); // Should be java.util.Map
    jmethodID entrySetMethod = env->GetMethodID(mapClass, "entrySet", "()Ljava/util/Set;");
    jobject entrySet = env->CallObjectMethod(javaMap, entrySetMethod);

    jclass setClass = env->GetObjectClass(entrySet);
    jmethodID iteratorMethod = env->GetMethodID(setClass, "iterator", "()Ljava/util/Iterator;");
    jobject iterator = env->CallObjectMethod(entrySet, iteratorMethod);

    jclass iteratorClass = env->GetObjectClass(iterator);
    jmethodID hasNextMethod = env->GetMethodID(iteratorClass, "hasNext", "()Z");
    jmethodID nextMethod = env->GetMethodID(iteratorClass, "next", "()Ljava/lang/Object;"); // Returns Map.Entry

    jclass entryClass = env->FindClass("java/util/Map$Entry");
    jmethodID getKeyMethod = env->GetMethodID(entryClass, "getKey", "()Ljava/lang/Object;");     // Returns String
    jmethodID getValueMethod = env->GetMethodID(entryClass, "getValue", "()Ljava/lang/Object;"); // Returns Object

    jclass stringClass = env->FindClass("java/lang/String");

    while (env->CallBooleanMethod(iterator, hasNextMethod))
    {
        jobject entry = env->CallObjectMethod(iterator, nextMethod);
        jstring jKey = (jstring)env->CallObjectMethod(entry, getKeyMethod);
        jobject jValue = env->CallObjectMethod(entry, getValueMethod);

        std::string cppKey = jstringToCppString(env, jKey);

        if (env->IsInstanceOf(jValue, stringClass))
        {
            cppMap[cppKey] = jstringToCppString(env, (jstring)jValue);
        }
        else
        {
            LOGW("Unsupported value type in EventArgsMap for key: %s", cppKey.c_str());
        }

        if (jKey)
            env->DeleteLocalRef(jKey);
        if (jValue)
            env->DeleteLocalRef(jValue);
        env->DeleteLocalRef(entry);
    }

    env->DeleteLocalRef(stringClass);
    env->DeleteLocalRef(entryClass);
    env->DeleteLocalRef(iteratorClass);
    env->DeleteLocalRef(iterator);
    env->DeleteLocalRef(setClass);
    env->DeleteLocalRef(entrySet);
    env->DeleteLocalRef(mapClass);

    if (cppMap.empty())
        return {{}};
    return {cppMap};
}

extern "C"
{
    JNIEXPORT void JNICALL Java_com_callstack_ottrelite_OttreliteBridge_nativeBeginEvent(
        JNIEnv *env, jclass /* clazz */, jstring eventName,
        jobject eventArgsMap // java.util.Map<String, Object>
    )
    {
        try
        {
            std::string cppEventName = jstringToCppString(env, eventName);
            ::ottrelite::MaybeEventArgsMap cppEventArgs = convertJavaMapToCppEventArgs(env, eventArgsMap);

            // TODO: support stack trace in future
            ::ottrelite::Ottrelite::beginEvent(cppEventName, {{}}, JAVA_API_NAME, cppEventArgs);
        }
        catch (const std::exception &e)
        {
            LOGE("Exception in nativeBeginEvent: %s", e.what());
            env->ThrowNew(env->FindClass("java/lang/RuntimeException"), e.what());
        }
    }

    JNIEXPORT void JNICALL Java_com_callstack_ottrelite_OttreliteBridge_nativeEndEvent(JNIEnv *env, jclass /* clazz */,
                                                                                       jobject eventArgsMap)
    {
        try
        {
            ::ottrelite::MaybeEventArgsMap cppEventArgs = convertJavaMapToCppEventArgs(env, eventArgsMap);
            ::ottrelite::Ottrelite::endEvent(cppEventArgs);
        }
        catch (const std::exception &e)
        {
            LOGE("Exception in nativeEndEvent: %s", e.what());
            env->ThrowNew(env->FindClass("java/lang/RuntimeException"), e.what());
        }
    }

    JNIEXPORT jdouble JNICALL Java_com_callstack_ottrelite_OttreliteBridge_nativeBeginAsyncEventWithStackTrace(
        JNIEnv *env, jclass /* clazz */, jstring eventName, [[maybe_unused]] jobjectArray javaStackTrace,
        jobject eventArgsMap)
    {
        try
        {
            std::string cppEventName = jstringToCppString(env, eventName);
            ::ottrelite::MaybeEventArgsMap cppEventArgs = convertJavaMapToCppEventArgs(env, eventArgsMap);

            // TODO: support stack trace in future
            return ::ottrelite::Ottrelite::beginAsyncEvent(cppEventName, {{}}, JAVA_API_NAME, cppEventArgs);
        }
        catch (const std::exception &e)
        {
            LOGE("Exception in nativeBeginAsyncEventWithStackTrace: %s", e.what());
            env->ThrowNew(env->FindClass("java/lang/RuntimeException"), e.what());
            return -1.0; // Indicate error
        }
    }

    JNIEXPORT jdouble JNICALL Java_com_callstack_ottrelite_OttreliteBridge_nativeBeginAsyncEvent(
        JNIEnv *env, jclass /* clazz */, jstring eventName,
        jobject eventArgsMap // java.util.Map<String, Object>
    )
    {
        try
        {
            std::string cppEventName = jstringToCppString(env, eventName);
            ::ottrelite::MaybeEventArgsMap cppEventArgs = convertJavaMapToCppEventArgs(env, eventArgsMap);

            // TODO: support stack trace in future
            return ::ottrelite::Ottrelite::beginAsyncEvent(cppEventName, {{}}, JAVA_API_NAME, cppEventArgs);
        }
        catch (const std::exception &e)
        {
            LOGE("Exception in nativeBeginAsyncEvent: %s", e.what());
            env->ThrowNew(env->FindClass("java/lang/RuntimeException"), e.what());
            return -1.0; // Indicate error
        }
    }

    JNIEXPORT void JNICALL Java_com_callstack_ottrelite_OttreliteBridge_nativeEndAsyncEvent(
        JNIEnv *env, jclass /* clazz */, jstring eventName, jdouble token,
        jobject eventArgsMap // java.util.Map<String, Object>
    )
    {
        try
        {
            std::string cppEventName = jstringToCppString(env, eventName);
            ::ottrelite::MaybeEventArgsMap cppEventArgs = convertJavaMapToCppEventArgs(env, eventArgsMap);

            ::ottrelite::Ottrelite::endAsyncEvent(cppEventName, static_cast<double>(token), cppEventArgs);
        }
        catch (const std::exception &e)
        {
            LOGE("Exception in nativeEndAsyncEvent: %s", e.what());
            env->ThrowNew(env->FindClass("java/lang/RuntimeException"), e.what());
        }
    }

    JNIEXPORT void JNICALL Java_com_callstack_ottrelite_OttreliteBridge_nativeCounterEvent(JNIEnv *env,
                                                                                           jclass /* clazz */,
                                                                                           jstring eventName,
                                                                                           jdouble value)
    {
        try
        {
            std::string cppEventName = jstringToCppString(env, eventName);
            ::ottrelite::Ottrelite::counterEvent(cppEventName, static_cast<double>(value));
        }
        catch (const std::exception &e)
        {
            LOGE("Exception in nativeCounterEvent: %s", e.what());
            env->ThrowNew(env->FindClass("java/lang/RuntimeException"), e.what());
        }
    }
} // extern "C"
