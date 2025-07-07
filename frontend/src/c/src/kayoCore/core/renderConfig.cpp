#include "renderConfig.hpp"
#include <emscripten/bind.h>

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoConfigWASM) {
	class_<kayo::config::SwapChain>("SwapChainConfig")
		.property("bitDepth", &kayo::config::SwapChain::bitDepth)
		.property("colorSpace", &kayo::config::SwapChain::colorSpace)
		.property("toneMappingMode", &kayo::config::SwapChain::toneMappingMode);
	class_<kayo::config::CustomColorQuantisation>("CustomColorQuantisationConfig")
		.property("useCustomColorQuantisation", &kayo::config::CustomColorQuantisation::getUseCustomColorQuantsation)
		.property("useDithering", &kayo::config::CustomColorQuantisation::getUseDithering);
	class_<kayo::config::Antialiasing>("AntialiasingConfig")
		.property("msaa", &kayo::config::Antialiasing::msaa)
		.property("interpolation", &kayo::config::Antialiasing::interpolation);
	class_<kayo::config::General>("GeneralConfig")
		.property("swapChain", &kayo::config::General::swapChain, return_value_policy::reference())
		.property("customColorQuantisation", &kayo::config::General::customColorQuantisation, return_value_policy::reference());
	class_<kayo::config::SpecificRenderer>("SpecificRendererConfig");
	class_<kayo::config::Realtime, base<kayo::config::SpecificRenderer>>("RealtimeConfig")
		.property("antialiasing", &kayo::config::Realtime::antialiasing, return_value_policy::reference());
	class_<kayo::config::RenderConfig>("RenderConfig")
		.property("needsContextReconfiguration", &kayo::config::RenderConfig::needsContextReconfiguration)
		.property("general", &kayo::config::RenderConfig::general, return_value_policy::reference())
		.property("specificRenderer", &kayo::config::RenderConfig::specificRenderer, allow_raw_pointers());
}