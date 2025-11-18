package com.callstack.plugin

import com.android.build.api.instrumentation.AsmClassVisitorFactory
import com.android.build.api.instrumentation.ClassContext
import com.android.build.api.instrumentation.ClassData
import com.android.build.api.instrumentation.InstrumentationParameters
import com.callstack.plugin.model.replacementDescriptorList
import org.gradle.api.provider.Property
import org.gradle.api.tasks.Input
import org.objectweb.asm.ClassVisitor
import org.objectweb.asm.MethodVisitor
import org.objectweb.asm.Opcodes

interface ReactInstrumentationParameters : InstrumentationParameters {

    @get:Input
    val targetClassName: Property<String>

    @get:Input
    val timestamp: Property<Long>
}

/**
 * The factory for creating our custom ASM ClassVisitors.
 * This is the entry point for the instrumentation API.
 */
abstract class OttreliteClassVisitorFactory :
    AsmClassVisitorFactory<ReactInstrumentationParameters> {

    override fun createClassVisitor(
        classContext: ClassContext,
        nextClassVisitor: ClassVisitor
    ): ClassVisitor {
        return object : ClassVisitor(Opcodes.ASM9, nextClassVisitor) {

            override fun visitMethod(
                access: Int,
                name: String?,
                descriptor: String?,
                signature: String?,
                exceptions: Array<out String>?
            ): MethodVisitor {
                val mv = super.visitMethod(access, name, descriptor, signature, exceptions)

                val className = classContext.currentClassData.className
                val desiredClassFound = className == parameters.get().targetClassName.get()
                val replacementDescriptor = if (desiredClassFound) {
                    replacementDescriptorList.firstOrNull { it.targetMethodName == name && it.targetMethodDescriptor == descriptor }
                } else null
                val isTargetMethod = desiredClassFound &&
                        replacementDescriptor != null &&
                        (access and Opcodes.ACC_STATIC) != 0

                if (isTargetMethod) {
                    println("Modifying method: $className.$name$descriptor")

                    return replacementDescriptor.methodVisitorType.getMethodVisitor(
                        mv,
                        replacementDescriptor.additionalMethodName, access
                    )
                }
                return mv
            }
        }
    }

    override fun isInstrumentable(classData: ClassData): Boolean {
        return classData.className == parameters.get().targetClassName.get()
    }
}

