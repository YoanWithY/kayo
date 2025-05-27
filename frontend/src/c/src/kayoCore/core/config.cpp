#include "config.hpp"
#include <emscripten/bind.h>

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoConfigWASM) {
	class_<kayo::config::SwapChain>("SwapChainConfig")
		.property("bitDepth", &kayo::config::SwapChain::bitDepth)
		.property("colorSpace", &kayo::config::SwapChain::colorSpace)
		.property("toneMapping", &kayo::config::SwapChain::toneMappingMode);
	class_<kayo::config::Antialiasing>("AntialiasingConfig")
		.property("msaa", &kayo::config::Antialiasing::msaa);
	class_<kayo::config::Output>("OutputConfig")
		.property("swapChain", &kayo::config::Output::swapChain, return_value_policy::reference())
		.property("antialiasing", &kayo::config::Output::antialiasing, return_value_policy::reference());
	class_<kayo::config::Project>("ProjectConfig")
		.property("output", &kayo::config::Project::output, return_value_policy::reference())
		.property("needsContextReconfiguration", &kayo::config::Project::needsContextReconfiguration)
		.property("needsPipelineRebuild", &kayo::config::Project::needsPipelineRebuild);
}