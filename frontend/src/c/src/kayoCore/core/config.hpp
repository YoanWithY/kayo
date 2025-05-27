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

struct Antialiasing {
	int32_t msaa;
};

struct Output {
	SwapChain swapChain;
	Antialiasing antialiasing;
};

struct Project {
	Output output;
	bool needsContextReconfiguration;
	bool needsPipelineRebuild;
};
} // namespace config
} // namespace kayo