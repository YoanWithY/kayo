#include "state.hpp"
#include <emscripten/bind.h>

namespace kayo {
namespace state {
SwapChain::SwapChain(
	const JSVCNumber& bitDepth,
	const JSVCString& colorSpace,
	const JSVCString toneMappingMode) : bitDepth(bitDepth), colorSpace(colorSpace), toneMappingMode(toneMappingMode) {}
Transparency::Transparency(const JSVCString& transparentBackground) : transparentBackground(transparentBackground) {}
Antialiasing::Antialiasing(const JSVCNumber& msaa, const JSVCString& interpolation) : msaa(msaa), interpolation(interpolation) {}
General::General(const SwapChain& swapChain, const Transparency& transparency) : swapChain(swapChain), transparency(transparency) {}
Realtime::Realtime(const Antialiasing& antialiasing) : antialiasing(antialiasing) {}
Output::Output(const General& general, const Realtime& realtime) : general(general), realtime(realtime) {};
Project::Project(const Output& output) : output(output) {}
Project::Project() : output(
						 Output(
							 General(
								 SwapChain(JSVCNumber(8), JSVCString("srgb"), JSVCString("standard")),
								 Transparency(JSVCString("false"))),
							 Realtime(
								 Antialiasing(JSVCNumber(1), JSVCString("center"))))) {}
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
	class_<kayo::state::Realtime>("RealtimeState")
		.property("antialiasing", &kayo::state::Realtime::antialiasing, return_value_policy::reference());
	class_<kayo::state::Output>("OutpuState")
		.property("general", &kayo::state::Output::general, return_value_policy::reference())
		.property("realtime", &kayo::state::Output::realtime, return_value_policy::reference());
	class_<kayo::state::Project>("ProjectState")
		.property("output", &kayo::state::Project::output, return_value_policy::reference());
}