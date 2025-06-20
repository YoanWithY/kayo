#include "renderConfig.hpp"
#include <emscripten/bind.h>

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoConfigWASM) {
	class_<kayo::config::SwapChain>("SwapChainConfig")
		.property("bitDepth", &kayo::config::SwapChain::bitDepth)
		.property("colorSpace", &kayo::config::SwapChain::colorSpace)
		.property("toneMappingMode", &kayo::config::SwapChain::toneMappingMode);
	class_<kayo::config::Transparancy>("TransparencyConfig")
		.property("transparentBackground", &kayo::config::Transparancy::transparentBackground);
	class_<kayo::config::Antialiasing>("AntialiasingConfig")
		.property("msaa", &kayo::config::Antialiasing::msaa)
		.property("interpolation", &kayo::config::Antialiasing::interpolation);
	class_<kayo::config::General>("GeneralConfig")
		.property("swapChain", &kayo::config::General::swapChain, return_value_policy::reference())
		.property("transparency", &kayo::config::General::transparency, return_value_policy::reference());
	class_<kayo::config::SpecificRenderer>("SpecificRendererConfig");
	class_<kayo::config::Realtime, base<kayo::config::SpecificRenderer>>("RealtimeConfig")
		.property("antialiasing", &kayo::config::Realtime::antialiasing, return_value_policy::reference());
	class_<kayo::config::RenderConfig>("RenderConfig")
		.property("needsContextReconfiguration", &kayo::config::RenderConfig::needsContextReconfiguration)
		.property("needsPipelineRebuild", &kayo::config::RenderConfig::needsPipelineRebuild)
		.property("general", &kayo::config::RenderConfig::general, return_value_policy::reference())
		.property("specificRenderer", &kayo::config::RenderConfig::specificRenderer, allow_raw_pointers());
}