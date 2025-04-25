#include "minecraft/context.hpp"
#include "numerics/fixedMath.hpp"
#include <emscripten/bind.h>
#include <iostream>

void wasmHello() {
	std::cout << "Hello from Kayo C++ WASM." << std::endl;
	using namespace FixedPoint;
	mat2f m(3.0f);
	std::cout << reinterpret_cast<float*>(&m)[3] << std::endl;
}

using namespace emscripten;
EMSCRIPTEN_BINDINGS(my_module) {
	function("wasmHello", &wasmHello);
	function("openRegion", &minecraft::openRegion);
	function("setActiveChunk", &minecraft::setActiveChunk);
	function("getByte", &minecraft::getByte);
	function("getShort", &minecraft::getShort);
	function("getInt", &minecraft::getInt);
	function("getLong", &minecraft::getLong);
	function("getFloat", &minecraft::getFloat);
	function("getDouble", &minecraft::getDouble);
	function("getByteArray", &minecraft::getByteArray);
	function("getString", &minecraft::getString);
	function("getList", &minecraft::getList);
	function("getCompound", &minecraft::getCompound);
	function("buildChunk", &minecraft::buildChunk);
	function("getSectionView", &minecraft::getSectionView);
	function("getPalette", &minecraft::getPalette);
}
