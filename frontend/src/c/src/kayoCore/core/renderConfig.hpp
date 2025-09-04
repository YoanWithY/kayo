#pragma once
#include "jsMap.hpp"

namespace kayo {
namespace config {

class SwapChain {
  public:
	uint32_t bitDepth;
	uintptr_t bitDepth_ptr() const;
	uint32_t getBitDepthJS() const;
	void setBitDepthJS(uint32_t bit_depth);

	std::string colorSpace;
	uintptr_t colorSpace_ptr() const;
	std::string getColorSpaceJS() const;
	void setColorSpaceJS(std::string color_space);

	std::string toneMappingMode;
	uintptr_t toneMappingMode_ptr() const;
	std::string getToneMappingModeJS() const;
	void setToneMappingModeJS(std::string tone_mapping_mode);
	inline SwapChain() : bitDepth(8), colorSpace("srgb"), toneMappingMode("standard") {}
};

class CustomColorQuantisation {
  public:
	bool useCustomColorQuantisation;
	uintptr_t useCustomColorQuantisation_ptr() const;
	bool getUseCustomColorQuantisationJS() const;
	void setUseCustomColorQuantisationJS(bool use);

	bool useDithering;
	uintptr_t useDithering_ptr() const;
	bool getUseDitheringJS() const;
	void setUseDitheringJS(bool dither);
	constexpr CustomColorQuantisation() : useCustomColorQuantisation(true), useDithering(true) {}
};

class General {
  public:
	SwapChain swapChain;
	CustomColorQuantisation customColorQuantisation;
};

class Antialiasing {
  public:
	uint32_t msaa;
	uintptr_t msaa_ptr() const;
	uint32_t getMSAAJS() const;
	void setMSAAJS(uint32_t m);

	std::string interpolation;
	uintptr_t interpolation_ptr() const;
	std::string getInterpolationJS() const;
	void setInterpolationJS(std::string s);

	constexpr Antialiasing() : msaa(1), interpolation("center") {}
};

class SpecificRenderConfig {
  public:
	std::string rendererName;
	virtual ~SpecificRenderConfig() = default;
};

class Realtime : public SpecificRenderConfig {
  public:
	Antialiasing antialiasing;
	inline Realtime() {}
};

class RenderConfig {
  public:
	SpecificRenderConfig* specificRenderConfig;
	General general;
	inline RenderConfig() : specificRenderConfig(new config::Realtime()) {};
};

} // namespace config
} // namespace kayo
