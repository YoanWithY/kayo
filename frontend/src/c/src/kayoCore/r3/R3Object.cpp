#include "R3Object.hpp"
#include "emscripten/bind.h"

namespace kayo {

R3Object::R3Object(
	int64_t ressource_id,
	const FixedPoint::vec3& position) : parent(nullptr),
										ressource_id(ressource_id),
										position(Vector3(
											JSVCNumber(position.x),
											JSVCNumber(position.y),
											JSVCNumber(position.z))) {};
R3Object* R3Object::getParent() {
	return this->parent;
}
} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoWASMR3Object) {
	class_<kayo::R3Object>("KayoR3Object")
		.function("getParent", &kayo::R3Object::getParent, return_value_policy::reference());
}