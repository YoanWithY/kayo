#include "jsViewControlled.hpp"
#include "emscripten/bind.h"

namespace kayo {

static uint32_t static_counter = 0;
uint32_t allocViewControlledID() {
	return static_counter++;
}

} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoWASMJSVC) {
	class_<kayo::JSVCNumber>("KayoJSVCNumber")
		.function("getValue", &kayo::JSVCNumber::getValueJS)
		.function("setValue", &kayo::JSVCNumber::setValueJS);
}
