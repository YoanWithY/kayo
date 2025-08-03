#pragma once
#include <cstdint>
#include <string>

namespace kayo {
namespace config {

struct SwapChain {
	int32_t bitDepth;
	std::string colorSpace;
	std::string toneMappingMode;
};

struct CustomColorQuantisation {
	bool useCustomColorQuantisation;
	bool useDithering;
	constexpr bool getUseCustomColorQuantsation() const {
		return this->useCustomColorQuantisation;
	}

	constexpr bool getUseDithering() const {
		return this->useDithering;
	}
};

struct General {
	SwapChain swapChain;
	CustomColorQuantisation customColorQuantisation;
};

struct Antialiasing {
	int32_t msaa;
	std::string interpolation;
};

struct SpecificRenderer {
	virtual ~SpecificRenderer() {}
};

struct Realtime : public SpecificRenderer {
	Antialiasing antialiasing;
};

struct Integral : public SpecificRenderer {};

struct RenderConfig {
	bool needsContextReconfiguration;
	bool needsPipelineRebuild;
	General general;
	SpecificRenderer* specificRenderer;
	inline RenderConfig() : specificRenderer(new config::Realtime) {}
};

} // namespace config
} // namespace kayo