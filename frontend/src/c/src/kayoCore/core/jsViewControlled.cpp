#include "jsViewControlled.hpp"
#include "emscripten/bind.h"
#include <emscripten/em_asm.h>

namespace kayo {
static uint32_t static_counter = 0;
uint32_t allocViewControlledID() {
	return static_counter++;
}

} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoWASMJSVC) {
	class_<kayo::JSVCNumber>("KayoJSVCNumber")
		.constructor<FixedPoint::Number>()
		.function("getObservationID", &kayo::JSVCNumber::getObservationID)
		.function("getValue", &kayo::JSVCNumber::getValueJS)
		.function("setValue", &kayo::JSVCNumber::setValueJS);
	class_<kayo::JSVCString>("KayoJSVCString")
		.function("getObservationID", &kayo::JSVCString::getObservationID)
		.function("getValue", &kayo::JSVCString::getValueJS)
		.function("setValue", &kayo::JSVCString::setValueJS);
}
