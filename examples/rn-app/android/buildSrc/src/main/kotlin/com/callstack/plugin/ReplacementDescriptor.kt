package com.callstack.plugin

import org.objectweb.asm.MethodVisitor
import org.objectweb.asm.Opcodes

data class ReplacementDescriptor(
    val targetMethodName: String,
    val targetMethodDescriptor: String,
    val additionalMethodName: String?,
    val methodVisitorType: MethodVisitorType
)

enum class MethodVisitorType {
    BOOLEAN, LONG, LONG_STRING_INT, LONG_STRING;

    fun getMethodVisitor(
        mv: MethodVisitor,
        additionalMethodName: String?,
        originalMethodAccess: Int
    ): MethodVisitor {
        return when (this) {
            BOOLEAN -> booleanTrueMethodVisitor(mv)
            LONG -> longMethodVisitor(
                mv = mv,
                additionalMethodName = additionalMethodName.orEmpty(),
                originalMethodAccess = originalMethodAccess
            )

            LONG_STRING_INT -> longStringIntMethodVisitor(
                mv = mv,
                additionalMethodName = additionalMethodName.orEmpty(),
                originalMethodAccess = originalMethodAccess
            )

            LONG_STRING -> longStringMethodVisitor(
                mv = mv,
                additionalMethodName = additionalMethodName.orEmpty(),
                originalMethodAccess = originalMethodAccess
            )
        }
    }
}

private fun booleanTrueMethodVisitor(mv: MethodVisitor) =
    object : MethodVisitor(Opcodes.ASM9, mv) {
        override fun visitCode() {
            visitInsn(Opcodes.ICONST_1)
            visitInsn(Opcodes.IRETURN)
        }
    }

private fun longMethodVisitor(
    mv: MethodVisitor,
    additionalMethodName: String,
    originalMethodAccess: Int
) =
    object : MethodVisitor(Opcodes.ASM9, mv) {
        override fun visitInsn(opcode: Int) {
            if (opcode >= Opcodes.IRETURN && opcode <= Opcodes.RETURN || opcode == Opcodes.ATHROW) {

                val isStatic = (originalMethodAccess and Opcodes.ACC_STATIC) != 0

                mv.visitMethodInsn(
                    Opcodes.INVOKESTATIC,
                    "com/callstack/ottrelite/OttreliteAndroid",
                    additionalMethodName,
                    "()V",
                    false
                )
            }
            mv.visitInsn(Opcodes.RETURN)
        }
    }

private fun longStringMethodVisitor(
    mv: MethodVisitor,
    additionalMethodName: String,
    originalMethodAccess: Int
) =
    object : MethodVisitor(Opcodes.ASM9, mv) {
        override fun visitInsn(opcode: Int) {
            if (opcode >= Opcodes.IRETURN && opcode <= Opcodes.RETURN || opcode == Opcodes.ATHROW) {

                val isStatic = (originalMethodAccess and Opcodes.ACC_STATIC) != 0
                var localVariableSlot = if (isStatic) 0 else 1

                localVariableSlot += 2

                mv.visitVarInsn(
                    Opcodes.ALOAD,
                    localVariableSlot
                )

                mv.visitMethodInsn(
                    Opcodes.INVOKESTATIC,
                    "com/callstack/ottrelite/OttreliteAndroid",
                    additionalMethodName,
                    "(Ljava/lang/String;)V",
                    false
                )
            }
            mv.visitInsn(Opcodes.RETURN)
        }
    }

private fun longStringIntMethodVisitor(
    mv: MethodVisitor,
    additionalMethodName: String,
    originalMethodAccess: Int
) =
    object : MethodVisitor(Opcodes.ASM9, mv) {
        override fun visitInsn(opcode: Int) {
            if (opcode >= Opcodes.IRETURN && opcode <= Opcodes.RETURN || opcode == Opcodes.ATHROW) {

                val isStatic = (originalMethodAccess and Opcodes.ACC_STATIC) != 0
                var localVariableSlot = if (isStatic) 0 else 1

                localVariableSlot += 2

                mv.visitVarInsn(
                    Opcodes.ALOAD,
                    localVariableSlot
                )
                localVariableSlot += 1

                mv.visitVarInsn(Opcodes.ILOAD, localVariableSlot)

                mv.visitMethodInsn(
                    Opcodes.INVOKESTATIC,
                    "com/callstack/ottrelite/OttreliteAndroid",
                    additionalMethodName,
                    "(Ljava/lang/String;I)V",
                    false
                )
            }
            mv.visitInsn(Opcodes.RETURN)
        }
    }
