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

struct Realtime {
	Antialiasing antialiasing;
};

struct Output {
	General general;
	Realtime realtime;
};

struct Project {
	Output output;
	bool needsContextReconfiguration;
	bool needsPipelineRebuild;
};
} // namespace config
} // namespace kayo