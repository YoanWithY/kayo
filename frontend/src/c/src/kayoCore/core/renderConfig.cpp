#include "renderConfig.hpp"
#include "jsViewControlled.hpp"
#include <emscripten/bind.h>

uintptr_t kayo::config::SwapChain::bitDepth_ptr() const {
	return reinterpret_cast<uintptr_t>(&this->bitDepth);
}
uint32_t kayo::config::SwapChain::getBitDepthJS() const {
	return this->bitDepth;
}
void kayo::config::SwapChain::setBitDepthJS(uint32_t bit_depth) {
	this->bitDepth = bit_depth;
	dispatchToJS(&this->bitDepth);
}

uintptr_t kayo::config::SwapChain::colorSpace_ptr() const {
	return reinterpret_cast<uintptr_t>(&this->colorSpace);
}
std::string kayo::config::SwapChain::getColorSpaceJS() const {
	return this->colorSpace;
}
void kayo::config::SwapChain::setColorSpaceJS(std::string color_space) {
	this->colorSpace = color_space;
	dispatchToJS(&this->colorSpace);
}

uintptr_t kayo::config::SwapChain::toneMappingMode_ptr() const {
	return reinterpret_cast<uintptr_t>(&this->toneMappingMode);
}
std::string kayo::config::SwapChain::getToneMappingModeJS() const {
	return this->toneMappingMode;
}
void kayo::config::SwapChain::setToneMappingModeJS(std::string tone_mapping_mode) {
	this->toneMappingMode = tone_mapping_mode;
	dispatchToJS(&this->toneMappingMode);
}

uintptr_t kayo::config::Antialiasing::msaa_ptr() const {
	return reinterpret_cast<uintptr_t>(&this->msaa);
}
uint32_t kayo::config::Antialiasing::getMSAAJS() const {
	return this->msaa;
}
void kayo::config::Antialiasing::setMSAAJS(uint32_t m) {
	this->msaa = m;
	dispatchToJS(&this->msaa);
}

uintptr_t kayo::config::Antialiasing::interpolation_ptr() const {
	return reinterpret_cast<uintptr_t>(&this->interpolation);
}
std::string kayo::config::Antialiasing::getInterpolationJS() const {
	return this->interpolation;
}
void kayo::config::Antialiasing::setInterpolationJS(std::string s) {
	this->interpolation = s;
	dispatchToJS(&this->interpolation);
}

uintptr_t kayo::config::CustomColorQuantisation::useCustomColorQuantisation_ptr() const {
	return reinterpret_cast<uintptr_t>(&this->useCustomColorQuantisation);
}
bool kayo::config::CustomColorQuantisation::getUseCustomColorQuantisationJS() const {
	return this->useCustomColorQuantisation;
}
void kayo::config::CustomColorQuantisation::setUseCustomColorQuantisationJS(bool m) {
	this->useCustomColorQuantisation = m;
	dispatchToJS(&this->useCustomColorQuantisation);
}

uintptr_t kayo::config::CustomColorQuantisation::useDithering_ptr() const {
	return reinterpret_cast<uintptr_t>(&this->useDithering);
}
bool kayo::config::CustomColorQuantisation::getUseDitheringJS() const {
	return this->useDithering;
}
void kayo::config::CustomColorQuantisation::setUseDitheringJS(bool m) {
	this->useDithering = m;
	dispatchToJS(&this->useDithering);
}

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoStateWASM) {
	class_<kayo::config::SwapChain>("SwapChainConfig")
		.property("bitDepth", &kayo::config::SwapChain::getBitDepthJS, &kayo::config::SwapChain::setBitDepthJS)
		.property("bitDepth_ptr", &kayo::config::SwapChain::bitDepth_ptr)
		.property("colorSpace", &kayo::config::SwapChain::getColorSpaceJS, &kayo::config::SwapChain::setColorSpaceJS)
		.property("colorSpace_ptr", &kayo::config::SwapChain::colorSpace_ptr)
		.property("toneMappingMode", &kayo::config::SwapChain::getToneMappingModeJS, &kayo::config::SwapChain::setToneMappingModeJS)
		.property("toneMappingMode_ptr", &kayo::config::SwapChain::toneMappingMode_ptr);
	class_<kayo::config::Antialiasing>("AntialiasingConfig")
		.property("msaa", &kayo::config::Antialiasing::getMSAAJS, &kayo::config::Antialiasing::setMSAAJS)
		.property("msaa_ptr", &kayo::config::Antialiasing::msaa_ptr)
		.property("interpolation", &kayo::config::Antialiasing::getInterpolationJS, &kayo::config::Antialiasing::setInterpolationJS)
		.property("interpolation_ptr", &kayo::config::Antialiasing::interpolation_ptr);
	class_<kayo::config::CustomColorQuantisation>("CustomColorQuantisationConfig")
		.property("useCustomColorQuantisation", &kayo::config::CustomColorQuantisation::getUseCustomColorQuantisationJS, &kayo::config::CustomColorQuantisation::setUseCustomColorQuantisationJS)
		.property("useCustomColorQuantisation_ptr", &kayo::config::CustomColorQuantisation::useCustomColorQuantisation_ptr)
		.property("useDithering", &kayo::config::CustomColorQuantisation::getUseDitheringJS, &kayo::config::CustomColorQuantisation::setUseDitheringJS)
		.property("useDithering_ptr", &kayo::config::CustomColorQuantisation::useDithering_ptr);
	class_<kayo::config::General>("GeneralConfig")
		.property("swapChain", &kayo::config::General::swapChain, return_value_policy::reference())
		.property("customColorQuantisation", &kayo::config::General::customColorQuantisation, return_value_policy::reference());
	class_<kayo::config::SpecificRenderConfig>("SpecificRendererConfig")
		.property("rendererName", &kayo::config::SpecificRenderConfig::rendererName);
	class_<kayo::config::Realtime, base<kayo::config::SpecificRenderConfig>>("RealtimeConfig")
		.property("antialiasing", &kayo::config::Realtime::antialiasing, return_value_policy::reference());
	class_<kayo::config::RenderConfig>("RenderConfig")
		.property("specificRenderConfig", &kayo::config::RenderConfig::specificRenderConfig, return_value_policy::reference())
		.property("name", &kayo::config::RenderConfig::configName)
		.property("general", &kayo::config::RenderConfig::general, return_value_policy::reference());
}