#include "memUtils.hpp"
#include <emscripten/bind.h>

namespace kayo {
namespace memUtils {

void deleteArrayUint8(uintptr_t offset) {
	delete[] reinterpret_cast<uint32_t*>(offset);
}
} // namespace memUtils
} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(MemUtilsWasm) {
	function("deleteArrayUint8", &kayo::memUtils::deleteArrayUint8);
}