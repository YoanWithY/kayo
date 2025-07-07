#include <emscripten/bind.h>
#include <iostream>

using namespace emscripten;
static val getBufferView(std::vector<uint8_t>& data) {
	return val(typed_memory_view(data.size(), data.data()));
}

EMSCRIPTEN_BINDINGS(KayoMemUtilsWASM) {
	register_vector<uint8_t>("VectorUInt8");
	function("getBufferView", &getBufferView);
}