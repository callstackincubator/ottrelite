plugins {
    `kotlin-dsl`
}

repositories {
    google()
    mavenCentral()
}

dependencies {
    implementation("com.android.tools.build:gradle:8.11.1")
    implementation("org.ow2.asm:asm:9.8")
    implementation("org.ow2.asm:asm-commons:9.8")
}

gradlePlugin {
    plugins {
        create("ottrelite") {
            id = "com.callstack.ottrelite"
            implementationClass = "com.callstack.plugin.OttreliteTracingPlugin"
        }
    }
}