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

struct Transparancy {
	bool transparentBackground;
};

struct General {
	SwapChain swapChain;
	Transparancy transparency;
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