#include "DataBlock.hpp"
#include <emscripten/bind.h>

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoDataBlockWASM) {
	class_<kayo::DataBlock>("DataBlock")
		.property("id", &kayo::DataBlock::getIDJS)
		.function("notifyObservers", &kayo::DataBlock::notifyObservers);
}