#include "memUtils.hpp"
#include <emscripten/bind.h>

namespace kayo {
namespace memUtils {

void deleteArrayUint8(uintptr_t offset) {
	delete[] reinterpret_cast<uint8_t*>(offset);
}
void deleteArrayDouble(uintptr_t byteOffset) {
	delete[] reinterpret_cast<double*>(byteOffset);
}
} // namespace memUtils
} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(MemUtilsWasm) {
	function("deleteArrayUint8", &kayo::memUtils::deleteArrayUint8);
	function("deleteArrayDouble", &kayo::memUtils::deleteArrayDouble);
	value_object<kayo::memUtils::KayoPointer>("KayoPointer")
		.field("byteOffset", &kayo::memUtils::KayoPointer::byteOffset)
		.field("byteLength", &kayo::memUtils::KayoPointer::byteLength);
}