import org.jetbrains.kotlin.gradle.internal.backend.common.serialization.metadata.DynamicTypeDeserializer.id

plugins {
    `java-gradle-plugin`
    `kotlin-dsl`
    `maven-publish`
    id("com.gradle.plugin-publish") version "2.0.0"
}

version = "0.1.0"
group = "com.callstack"

repositories {
    google()
    mavenCentral()
}

dependencies {
    implementation("com.android.tools.build:gradle:8.11.2")
    implementation("org.ow2.asm:asm:9.8")
    implementation("org.ow2.asm:asm-commons:9.8")
}

gradlePlugin {
    website = "https://oss.callstack.com/ottrelite/"
    vcsUrl = "https://github.com/callstackincubator/ottrelite"
    plugins {
        create("ottrelite") {
            id = "com.callstack.ottrelite"
            displayName = "Ottrelite Android Plugin for React Native"
            description = "Plugin for injecting @ottrelite/core logic into React Native's Android Systrace API"
            tags = listOf("testing", "tracing", "react-native", "performance")
            implementationClass = "com.callstack.plugin.OttreliteTracingPlugin"
        }
    }
}
