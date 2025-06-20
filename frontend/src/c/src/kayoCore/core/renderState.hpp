#pragma once
#include "jsMap.hpp"
#include "jsViewControlled.hpp"
#include "renderConfig.hpp"

namespace kayo {
namespace state {

class SwapChain {
  public:
	JSVCNumber bitDepth;
	JSVCString colorSpace;
	JSVCString toneMappingMode;
	inline SwapChain() : bitDepth(JSVCNumber(8)), colorSpace(JSVCString("srgb")), toneMappingMode(JSVCString("standard")) {}
	inline void applyToConfig(kayo::config::RenderConfig& output, kayo::config::SwapChain& swapChain) {
		int32_t old_bitDepth = swapChain.bitDepth;
		swapChain.bitDepth = static_cast<int32_t>(this->bitDepth.value);
		if (old_bitDepth != swapChain.bitDepth) {
			output.needsContextReconfiguration = true;
			output.needsPipelineRebuild = true;
		}

		std::string old_colorSpace = swapChain.colorSpace;
		swapChain.colorSpace = this->colorSpace.value;
		if (old_colorSpace != swapChain.colorSpace) {
			output.needsContextReconfiguration = true;
			output.needsPipelineRebuild = true;
		}

		std::string old_toneMappingMode = swapChain.toneMappingMode;
		swapChain.toneMappingMode = this->toneMappingMode.value;
		if (old_toneMappingMode != swapChain.toneMappingMode) {
			output.needsContextReconfiguration = true;
			output.needsPipelineRebuild = true;
		}
	}
};

class Transparency {
  public:
	JSVCString transparentBackground;
	inline Transparency() : transparentBackground(JSVCString("false")) {}
	constexpr void applyToConfig(kayo::config::RenderConfig& output, kayo::config::Transparancy& transparency) {
		bool old_transparentBackground = transparency.transparentBackground;
		transparency.transparentBackground = this->transparentBackground.value == "true";
		if (old_transparentBackground != transparency.transparentBackground) {
			output.needsContextReconfiguration = true;
		}
	}
};

class General {
  public:
	SwapChain swapChain;
	Transparency transparency;
	inline General() {};
	constexpr void applyToConfig(kayo::config::RenderConfig& config, kayo::config::General& general) {
		this->swapChain.applyToConfig(config, general.swapChain);
		this->transparency.applyToConfig(config, general.transparency);
	}
};

class Antialiasing {
  public:
	JSVCNumber msaa;
	JSVCString interpolation;
	inline Antialiasing() : msaa(JSVCNumber(1)), interpolation(JSVCString("center")) {}
	constexpr void applyToConfig(kayo::config::RenderConfig& output, kayo::config::Antialiasing& antialiasing) {
		int32_t old_msaa = antialiasing.msaa;
		antialiasing.msaa = static_cast<int32_t>(this->msaa.value);
		if (old_msaa != antialiasing.msaa) {
			output.needsPipelineRebuild = true;
		}
	}
};

class SpecificRenderer {
  public:
	std::string rendererName;
	virtual void applyToConfig(config::RenderConfig& config, config::SpecificRenderer* renderer) = 0;
	virtual ~SpecificRenderer() = default;
};

class Realtime : public SpecificRenderer {
  public:
	Antialiasing antialiasing;
	inline Realtime() {}
	void applyToConfig(config::RenderConfig& config, config::SpecificRenderer* renderer) override;
};

class RenderState {
  public:
	SpecificRenderer* specificRenderer;
	General general;
	config::RenderConfig config;
	inline RenderState() : specificRenderer(new state::Realtime()) { this->applyToConfig(); };
	constexpr void applyToConfig() {
		this->config.needsContextReconfiguration = false;
		this->config.needsPipelineRebuild = false;
		this->general.applyToConfig(config, this->config.general);
		this->specificRenderer->applyToConfig(config, this->config.specificRenderer);
	}
};

} // namespace state
} // namespace kayo
