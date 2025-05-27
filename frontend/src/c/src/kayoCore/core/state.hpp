#pragma once
#include "config.hpp"
#include "jsViewControlled.hpp"

namespace kayo {
namespace state {

class SwapChain {
  public:
	JSVCNumber bitDepth;
	JSVCString colorSpace;
	JSVCString toneMappingMode;
	SwapChain(
		const JSVCNumber& bitDepth,
		const JSVCString& colorSpace,
		const JSVCString toneMappingMode);
	constexpr void mirrorToConfig(kayo::config::Project& project, kayo::config::SwapChain& swapChain) {
		int32_t old_bitDepth = swapChain.bitDepth;
		swapChain.bitDepth = static_cast<int32_t>(this->bitDepth.value);
		if (old_bitDepth != swapChain.bitDepth) {
			project.needsContextReconfiguration = true;
			project.needsPipelineRebuild = true;
		}

		std::string old_colorSpace = swapChain.colorSpace;
		swapChain.colorSpace = this->colorSpace.value;
		if (old_colorSpace != swapChain.colorSpace) {
			project.needsContextReconfiguration = true;
			project.needsPipelineRebuild = true;
		}

		std::string old_toneMappingMode = swapChain.toneMappingMode;
		swapChain.toneMappingMode = this->toneMappingMode.value;
		if (old_toneMappingMode != swapChain.toneMappingMode) {
			project.needsPipelineRebuild = true;
		}
	}
};

class Antialiasing {
  public:
	JSVCNumber msaa;
	Antialiasing(const JSVCNumber& msaa);
	constexpr void mirrorToConfig(kayo::config::Project& project, kayo::config::Antialiasing& antialiasing) {
		int32_t old_msaa = antialiasing.msaa;
		antialiasing.msaa = static_cast<int32_t>(this->msaa.value);
		if (old_msaa != antialiasing.msaa) {
			project.needsPipelineRebuild = true;
		}
	}
};

class Output {
  public:
	SwapChain swapChain;
	Antialiasing antialiasing;
	Output(const SwapChain& swapChain, const Antialiasing& antialiasing);
	constexpr void mirrorToConfig(kayo::config::Project& project, kayo::config::Output& output) {
		this->swapChain.mirrorToConfig(project, output.swapChain);
		this->antialiasing.mirrorToConfig(project, output.antialiasing);
	}
};

class Project {
  public:
	Output output;
	Project();
	Project(const Output& output);
	constexpr void mirrorToConfig(kayo::config::Project& project) {
		project.needsContextReconfiguration = false;
		project.needsPipelineRebuild = false;
		this->output.mirrorToConfig(project, project.output);
	}
};
} // namespace state
} // namespace kayo