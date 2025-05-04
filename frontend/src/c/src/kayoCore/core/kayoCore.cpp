#include "kayoCore.hpp"
#include <emscripten/bind.h>

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoWASM) {
	class_<kayo::WASMModule>("KayoWASMModule");
	class_<kayo::WASMInstance>("KayoWASMInstance")
		.constructor<>()
		.function("registerModule", &kayo::WASMInstance::registerModule);
}
