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
			project.needsContextReconfiguration = true;
			project.needsPipelineRebuild = true;
		}
	}
};

class Transparency {
  public:
	JSVCString transparentBackground;
	Transparency(const JSVCString& transparentBackground);
	constexpr void mirrorToConfig(kayo::config::Project& project, kayo::config::Transparancy& transparency) {
		bool old_transparentBackground = transparency.transparentBackground;
		transparency.transparentBackground = this->transparentBackground.value == "true";
		if (old_transparentBackground != transparency.transparentBackground) {
			project.needsContextReconfiguration = true;
		}
	}
};

class General {
  public:
	SwapChain swapChain;
	Transparency transparency;
	General(const SwapChain& swapChain, const Transparency& transparency);
	constexpr void mirrorToConfig(kayo::config::Project& project, kayo::config::General& general) {
		this->swapChain.mirrorToConfig(project, general.swapChain);
		this->transparency.mirrorToConfig(project, general.transparency);
	}
};

class Antialiasing {
  public:
	JSVCNumber msaa;
	JSVCString interpolation;
	Antialiasing(const JSVCNumber& msaa, const JSVCString& interpolation);
	constexpr void mirrorToConfig(kayo::config::Project& project, kayo::config::Antialiasing& antialiasing) {
		int32_t old_msaa = antialiasing.msaa;
		antialiasing.msaa = static_cast<int32_t>(this->msaa.value);
		if (old_msaa != antialiasing.msaa) {
			project.needsPipelineRebuild = true;
		}
	}
};

class Realtime {
  public:
	Antialiasing antialiasing;
	Realtime(const Antialiasing& antialiasing);
	constexpr void mirrorToConfig(kayo::config::Project& project, kayo::config::Realtime& realtime) {
		this->antialiasing.mirrorToConfig(project, realtime.antialiasing);
	}
};

class Output {
  public:
	General general;
	Realtime realtime;
	Output(const General& general, const Realtime& realtime);
	constexpr void mirrorToConfig(kayo::config::Project& project, kayo::config::Output& output) {
		this->general.mirrorToConfig(project, output.general);
		this->realtime.mirrorToConfig(project, output.realtime);
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