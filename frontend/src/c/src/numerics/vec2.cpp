#include "vec2.hpp"
#include <emscripten/bind.h>

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoFixedVec2) {
	class_<FixedPoint::vec2f>("Vec2f")
		.property("x", &FixedPoint::vec2f::x)
		.property("y", &FixedPoint::vec2f::y);
}