#include "state.hpp"
#include <emscripten/bind.h>

namespace kayo {
namespace state {
SwapChain::SwapChain(
	const JSVCNumber& bitDepth,
	const JSVCString& colorSpace,
	const JSVCString toneMappingMode) : bitDepth(bitDepth), colorSpace(colorSpace), toneMappingMode(toneMappingMode) {}

Antialiasing::Antialiasing(const JSVCNumber& msaa) : msaa(msaa) {}

Output::Output(const SwapChain& swapChain, const Antialiasing& antialiasing) : swapChain(swapChain), antialiasing(antialiasing) {};
Project::Project(const Output& output) : output(output) {}
Project::Project() : output(
						 Output(
							 SwapChain(JSVCNumber(8), JSVCString("srgb"), JSVCString("standard")),
							 Antialiasing(JSVCNumber(1)))) {}
} // namespace state
} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoStateWASM) {
	class_<kayo::state::SwapChain>("SwapChainState")
		.property("bitDepth", &kayo::state::SwapChain::bitDepth, return_value_policy::reference())
		.property("colorSpace", &kayo::state::SwapChain::colorSpace, return_value_policy::reference())
		.property("toneMappingMode", &kayo::state::SwapChain::toneMappingMode, return_value_policy::reference());
	class_<kayo::state::Antialiasing>("AntialiasingState")
		.property("msaa", &kayo::state::Antialiasing::msaa, return_value_policy::reference());
	class_<kayo::state::Output>("OutpuState")
		.property("swapChain", &kayo::state::Output::swapChain, return_value_policy::reference())
		.property("antialiasing", &kayo::state::Output::antialiasing, return_value_policy::reference());
	class_<kayo::state::Project>("ProjectState")
		.property("output", &kayo::state::Project::output, return_value_policy::reference());
}