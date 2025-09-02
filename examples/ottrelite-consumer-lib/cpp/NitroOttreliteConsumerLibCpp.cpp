#include "NitroOttreliteConsumerLibCpp.hpp"

#include <cmath>
#include <cstdint>
#include <random>
#include <vector>

#include <ReactNativeOttrelite/Ottrelite.hpp>

namespace margelo::nitro::ottreliteconsumerlib
{
    using namespace ::ottrelite;

    NitroOttreliteConsumerLibCpp::NitroOttreliteConsumerLibCpp() : HybridObject(TAG)
    {
    }

    std::vector<double> NitroOttreliteConsumerLibCpp::generateImage(double width, double height)
    {
        Ottrelite::beginEvent("generateImage",
                              {{{"width", std::to_string(width)}, {"height", std::to_string(height)}}});

        static std::random_device rndDev;
        static std::mt19937 generator(rndDev());
        static std::uniform_real_distribution<float> distribution(0.0f, 1.0f);

        std::vector<double> image(static_cast<size_t>(width) * static_cast<size_t>(height) * 4);

        double centerX = width / 2.0L;
        double centerY = height / 2.0L;
        double maxDist = std::sqrt(centerX * centerX + centerY * centerY);

        for (int y = 0; y < height; ++y)
        {
            Ottrelite::beginEvent("generateImageRow");

            for (int x = 0; x < width; ++x)
            {
                int i = (y * static_cast<int>(width) + x) * 4;

                double dx = x - centerX;
                double dy = y - centerY;
                double dist = std::sqrt(dx * dx + dy * dy) / maxDist;

                // procedural sine wave with noise
                double wave = std::sin(x * 0.05L);
                double noise = distribution(generator);
                double composite = 0.5L * wave + 0.5L * noise;

                // gradient based on distance, centered around the middle of the image
                double gradient = 1.0L - dist;

                auto red = std::round(std::clamp((composite + 0.5L) * 255.0L, 0.0L, 255.0L));
                auto green = std::round(std::clamp((1.0L - gradient) * 255.0L, 0.0L, 255.0L));
                auto blue = std::round(std::clamp(gradient * 255.0L, 0.0L, 255.0L));
                auto alpha = std::round(std::clamp((0.5L + 0.5L * std::sin(dist * 8.0L)) * 255.0L, 0.0L, 255.0L));

                image[i + 0] = red;
                image[i + 1] = green;
                image[i + 2] = blue;
                image[i + 3] = alpha;
            }

            Ottrelite::endEvent();
        }

        Ottrelite::endEvent({{{"pixels", std::to_string(image.size())}}});

        return image;
    }
} // namespace margelo::nitro::ottreliteconsumerlib
