package com.callstack.ottrelite

object OttreliteAndroid {
    @JvmStatic
    fun beginAsyncEvent(eventName: String, cookie: Int) {
        OttreliteBridge.nativeBeginAsyncEvent(eventName, emptyMap())
    }

    @JvmStatic
    fun endAsyncEvent(eventName: String, cookie: Int) {
        OttreliteBridge.nativeEndAsyncEvent(eventName, cookie.toDouble(), emptyMap())
    }

    @JvmStatic
    fun beginEvent(sectionName: String) {
        OttreliteBridge.nativeBeginEvent(sectionName, emptyMap())
    }

    @JvmStatic
    fun beginEvent(sectionName: String, args: Array<String>, argsLength: Int) {
        val argsMap = mutableMapOf<String, Any>()
        for (i in 0 until argsLength step 2) {
            if (i + 1 < argsLength) {
                argsMap[args[i]] = args[i + 1]
            } else {
                argsMap[args[i]] = ""
            }
        }

        OttreliteBridge.nativeBeginEvent(sectionName, argsMap)
    }

    @JvmStatic
    fun endEvent() {
        OttreliteBridge.nativeEndEvent(emptyMap())
    }

    @JvmStatic
    fun traceCounter(counterName: String, counterValue: Int) {
        OttreliteBridge.nativeCounterEvent(counterName, counterValue.toDouble())
    }
}
