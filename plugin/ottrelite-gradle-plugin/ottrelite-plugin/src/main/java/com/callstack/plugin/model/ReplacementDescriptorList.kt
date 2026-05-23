package com.callstack.plugin.model

val replacementDescriptorList = buildList {
    add(
        ReplacementDescriptor(
            targetMethodName = "isTracing",
            targetMethodDescriptor = "(J)Z",
            additionalMethodName = null,
            methodVisitorType = MethodVisitorType.BOOLEAN
        )
    )
    add(
        ReplacementDescriptor(
            targetMethodName = "endSection",
            targetMethodDescriptor = "(J)V",
            additionalMethodName = "endEvent",
            methodVisitorType = MethodVisitorType.LONG
        )
    )
    add(
        ReplacementDescriptor(
            targetMethodName = "beginSection",
            targetMethodDescriptor = "(JLjava/lang/String;)V",
            additionalMethodName = "beginEvent",
            methodVisitorType = MethodVisitorType.LONG_STRING
        )
    )
    add(
        ReplacementDescriptor(
            targetMethodName = "beginAsyncSection",
            targetMethodDescriptor = "(JLjava/lang/String;I)V",
            additionalMethodName = "beginAsyncEvent",
            methodVisitorType = MethodVisitorType.LONG_STRING_INT
        )
    )
    add(
        ReplacementDescriptor(
            targetMethodName = "endAsyncSection",
            targetMethodDescriptor = "(JLjava/lang/String;I)V",
            additionalMethodName = "endAsyncEvent",
            methodVisitorType = MethodVisitorType.LONG_STRING_INT
        )
    )
    add(
        ReplacementDescriptor(
            targetMethodName = "traceCounter",
            targetMethodDescriptor = "(JLjava/lang/String;I)V",
            additionalMethodName = "counterEvent",
            methodVisitorType = MethodVisitorType.LONG_STRING_INT
        )
    )
}