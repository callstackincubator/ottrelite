package com.callstack.plugin

import com.android.build.api.instrumentation.FramesComputationMode
import com.android.build.api.instrumentation.InstrumentationScope
import com.android.build.api.variant.AndroidComponentsExtension
import org.gradle.api.Plugin
import org.gradle.api.Project

class OttreliteTracingPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        val extension = project.extensions.create(
            "ottreliteTracing",
            OttreliteTracingExtension::class.java,
            project
        )

        val androidComponents = project.extensions.getByType(AndroidComponentsExtension::class.java)

        extension.rnInstrumentationVariants.get().let { instrumentedVariantsWhitelist ->
            val description =
                if (instrumentedVariantsWhitelist.isEmpty()) {
                    "all variants"
                } else {
                    "variants: ${instrumentedVariantsWhitelist.joinToString(", ")}"
                }
            project.logger.lifecycle(
                "[OttreliteTracing] Configuration will instrument $description"
            )
        }

        androidComponents.onVariants { variant ->
            val variantName = variant.name
            val shouldInstrument = shouldInstrumentVariant(variantName, extension)

            if (shouldInstrument) {
                project.logger.lifecycle("[OttreliteTracing] Enabling instrumentation for variant '$variantName'")

                variant.instrumentation.transformClassesWith(
                    OttreliteClassVisitorFactory::class.java,
                    InstrumentationScope.ALL
                ) { params ->
                    params.targetClassName.set("com.facebook.systrace.Systrace")
                    params.timestamp.set(System.currentTimeMillis())
                }
                variant.instrumentation.setAsmFramesComputationMode(
                    FramesComputationMode.COMPUTE_FRAMES_FOR_INSTRUMENTED_METHODS
                )
            } else {
                project.logger.lifecycle("[OttreliteTracing] Skipping instrumentation for variant '$variantName'")
            }
        }
    }

    private fun shouldInstrumentVariant(
        variantName: String,
        extension: OttreliteTracingExtension
    ): Boolean {
        val rnInstrumentationVariants = extension.rnInstrumentationVariants.get()

        // if enabled variants are specified, only instrument those
        return if (rnInstrumentationVariants.isNotEmpty()) {
            rnInstrumentationVariants.contains(variantName)
        } else true
    }
}