#include "renderState.hpp"
#include <emscripten/bind.h>

namespace kayo {
namespace state {

void state::Realtime::applyToConfig(config::RenderConfig& config, config::SpecificRenderer* renderer) {
	config::Realtime* realtime = dynamic_cast<config::Realtime*>(renderer);
	this->antialiasing.applyToConfig(config, realtime->antialiasing);
}

} // namespace state
} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoStateWASM) {
	class_<kayo::state::SwapChain>("SwapChainState")
		.property("bitDepth", &kayo::state::SwapChain::bitDepth, return_value_policy::reference())
		.property("colorSpace", &kayo::state::SwapChain::colorSpace, return_value_policy::reference())
		.property("toneMappingMode", &kayo::state::SwapChain::toneMappingMode, return_value_policy::reference());
	class_<kayo::state::Antialiasing>("AntialiasingState")
		.property("msaa", &kayo::state::Antialiasing::msaa, return_value_policy::reference())
		.property("interpolation", &kayo::state::Antialiasing::interpolation, return_value_policy::reference());
	class_<kayo::state::Transparency>("TransparencyState")
		.property("transparentBackground", &kayo::state::Transparency::transparentBackground, return_value_policy::reference());
	class_<kayo::state::General>("GeneralState")
		.property("swapChain", &kayo::state::General::swapChain, return_value_policy::reference())
		.property("transparency", &kayo::state::General::transparency, return_value_policy::reference());
	class_<kayo::state::SpecificRenderer>("SpecificRendererState")
		.property("rendererName", &kayo::state::SpecificRenderer::rendererName);
	class_<kayo::state::Realtime, base<kayo::state::SpecificRenderer>>("RealtimeState")
		.property("antialiasing", &kayo::state::Realtime::antialiasing, return_value_policy::reference());
	class_<kayo::state::RenderState>("RenderState")
		.property("config", &kayo::state::RenderState::config, return_value_policy::reference())
		.property("specificRenderer", &kayo::state::RenderState::specificRenderer, return_value_policy::reference())
		.function("applyToConfig", &kayo::state::RenderState::applyToConfig)
		.property("general", &kayo::state::RenderState::general, return_value_policy::reference());
}