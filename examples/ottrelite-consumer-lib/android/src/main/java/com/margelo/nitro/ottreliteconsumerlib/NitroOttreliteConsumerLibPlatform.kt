package com.margelo.nitro.ottreliteconsumerlib

import com.callstack.ottrelite.OttreliteAndroid

import kotlin.math.*
import kotlin.random.Random

class NitroOttreliteConsumerLibPlatform : HybridNitroOttreliteConsumerLibPlatformSpec() {
    private val random = Random.Default

    override fun generateImage(width: Double, height: Double): DoubleArray {
        // FIXME: use new object with syntax of mapOf("width" to width.toString(), "height" to height.toString()) instead of array trick
        OttreliteAndroid.beginEvent("generateImage", arrayOf("width", width.toString(), "height", height.toString()), 4)

        val image = DoubleArray((width * height * 4).toInt())

        val centerX = width / 2.0
        val centerY = height / 2.0
        val maxDist = sqrt(centerX * centerX + centerY * centerY)

        for (y in 0 until height.toInt()) {
            OttreliteAndroid.beginEvent("generateImageRow")

            for (x in 0 until width.toInt()) {
                val i = (y * width.toInt() + x) * 4

                val dx = x - centerX
                val dy = y - centerY
                val dist = sqrt(dx * dx + dy * dy) / maxDist

                // procedural sine wave with noise
                val wave = sin(x * 0.05)
                val noise = random.nextDouble()
                val composite = 0.5 * wave + 0.5 * noise

                // gradient based on distance, centered around the middle of the image
                val gradient = 1.0 - dist

                val red = ((composite + 0.5) * 255.0).coerceIn(0.0, 255.0).roundToInt().toDouble()
                val green = ((1.0 - gradient) * 255.0).coerceIn(0.0, 255.0).roundToInt().toDouble()
                val blue = (gradient * 255.0).coerceIn(0.0, 255.0).roundToInt().toDouble()
                val alpha = ((0.5 + 0.5 * sin(dist * 8.0)) * 255.0).coerceIn(0.0, 255.0).roundToInt().toDouble()

                image[i + 0] = red
                image[i + 1] = green
                image[i + 2] = blue
                image[i + 3] = alpha
            }

            OttreliteAndroid.endEvent()
        }

        // FIXME: use an overload of endSection that takes a map of additional arguments: mapOf("pixels" to image.size.toString())
        OttreliteAndroid.endEvent()

        return image
    }
}
