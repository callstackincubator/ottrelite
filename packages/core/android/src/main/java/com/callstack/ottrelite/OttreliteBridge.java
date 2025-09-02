package com.callstack.ottrelite;

import java.util.Map;

public class OttreliteBridge {

    static {
        System.loadLibrary("ReactNativeOttrelite");
    }

//    /**
//     * @param javaStackTrace Array of objects. Can be null.
//     * @param eventArgsMap Map of event arguments. Can be null.
//     */
//    public static native void nativeBeginEventWithStackTrace(
//            String eventName,
//            Object[] javaStackTrace,
//            String sourceApiName,
//            Map<String, Object> eventArgsMap);

    /**
     * Simplified version that uses CPP_API_NAME and no stack trace.
     * @param eventArgsMap Map of event arguments. Can be null.
     */
    public static native void nativeBeginEvent(
            String eventName,
            Map<String, Object> eventArgsMap);

    /**
     * @param eventArgsMap Map of event arguments. Can be null.
     */
    public static native void nativeEndEvent(Map<String, Object> eventArgsMap);

//    /**
//     * @param javaStackTrace Array of objects. Can be null.
//     * @param eventArgsMap Map of event arguments. Can be null.
//     * @return Token for the async event.
//     */
//    public static native double nativeBeginAsyncEventWithStackTrace(
//            String eventName,
//            Object[] javaStackTrace,
//            String sourceApiName,
//            Map<String, Object> eventArgsMap);

    /**
     * Simplified async version.
     * @param eventArgsMap Map of event arguments. Can be null.
     * @return Token for the async event.
     */
    public static native double nativeBeginAsyncEvent(
            String eventName,
            Map<String, Object> eventArgsMap);

    /**
     * @param eventArgsMap Map of event arguments. Can be null.
     */
    public static native void nativeEndAsyncEvent(
            String eventName,
            double token,
            Map<String, Object> eventArgsMap);


    public static native void nativeCounterEvent(String eventName, double value);
}