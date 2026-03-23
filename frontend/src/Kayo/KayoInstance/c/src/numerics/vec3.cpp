#include "vec3.hpp"
#include <emscripten/bind.h>

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoFixedVec3) {
	class_<FixedPoint::vec3f>("Vec3f")
		.property("x", &FixedPoint::vec3f::x)
		.property("y", &FixedPoint::vec3f::y)
		.property("z", &FixedPoint::vec3f::z);
}