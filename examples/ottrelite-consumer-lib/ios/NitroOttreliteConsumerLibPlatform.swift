extension Comparable {
    func clamped(to range: ClosedRange<Self>) -> Self {
        return min(max(self, range.lowerBound), range.upperBound)
    }
}

class NitroOttreliteConsumerLibPlatform:
    HybridNitroOttreliteConsumerLibPlatformSpec
{
    func generateImage(width: Double, height: Double) throws -> [Double] {
//        Ottrelite.beginEvent(
//            "generateImage",
//            args: ["width", width.description, "height", height.description],
//            argsLength: 4
//        )

        let imageSize = Int(width * height * 4)
        var image = [Double](repeating: 0.0, count: imageSize)

        let centerX = width / 2.0
        let centerY = height / 2.0
        let maxDist = sqrt(centerX * centerX + centerY * centerY)

        for y in 0..<Int(height) {
//            Ottrelite.beginEvent("generateImageRow")

            for x in 0..<Int(width) {
                let i = (y * Int(width) + x) * 4

                let dx = Double(x) - centerX
                let dy = Double(y) - centerY
                let dist = sqrt(dx * dx + dy * dy) / maxDist

                // procedural sine wave with noise
                let wave = sin(Double(x) * 0.05)
                let noise = Double.random(in: 0...1)
                let composite = 0.5 * wave + 0.5 * noise

                // gradient based on distance, centered around the middle of the image
                let gradient = 1.0 - dist

                let red = ((composite + 0.5) * 255.0).clamped(to: 0.0...255.0)
                    .rounded()
                let green = ((1.0 - gradient) * 255.0).clamped(to: 0.0...255.0)
                    .rounded()
                let blue = (gradient * 255.0).clamped(to: 0.0...255.0).rounded()
                let alpha = ((0.5 + 0.5 * sin(dist * 8.0)) * 255.0).clamped(
                    to: 0.0...255.0
                ).rounded()

                image[i + 0] = red
                image[i + 1] = green
                image[i + 2] = blue
                image[i + 3] = alpha
            }
        }

        return image
    }
}
