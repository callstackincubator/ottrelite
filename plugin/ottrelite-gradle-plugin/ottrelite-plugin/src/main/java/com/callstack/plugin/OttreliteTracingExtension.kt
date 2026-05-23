package com.callstack.plugin

import org.gradle.api.Project
import org.gradle.api.provider.SetProperty

open class OttreliteTracingExtension(project: Project) {
    /**
     * Set of variant names where tracing should be enabled.
     * If empty, tracing will be applied to all variants.
     *
     * Example usage in build.gradle:
     * ```
     * ottreliteTracing {
     *     rnInstrumentationVariants = ["debug", "profiling"]
     * }
     * ```
     */
    val rnInstrumentationVariants: SetProperty<String> =
        project.objects.setProperty(String::class.java)
            .convention(emptySet())
}