#include "projection.hpp"
#include <emscripten/bind.h>

namespace kayo {
kayo::memUtils::KayoPointer kayo::Projection::getProjectionMatrixJS() {
	return kayo::memUtils::KayoPointer{reinterpret_cast<uintptr_t>(&this->matrix), sizeof(this->matrix)};
}

void kayo::Projection::setNearJS(FixedPoint::NumberWire n) {
	this->near = n;
}
void kayo::Projection::setFarJS(FixedPoint::NumberWire f) {
	this->far = f;
}
void kayo::Projection::setWidthJS(uint32_t w) {
	this->width_px = w;
}
void kayo::Projection::setHeightJS(uint32_t h) {
	this->height_px = h;
}
uint32_t kayo::Projection::getWidthJS() const {
	return this->width_px;
}
uint32_t kayo::Projection::getHeightJS() const {
	return this->height_px;
}
FixedPoint::NumberWire kayo::Projection::getNearJS() {
	return static_cast<FixedPoint::NumberWire>(this->near);
}
FixedPoint::NumberWire kayo::Projection::getFarJS() {
	return static_cast<FixedPoint::NumberWire>(this->far);
}

void kayo::PerspectiveProjection::updateMatrix() {
	float ar = float(this->width_px) / float(this->height_px);
	float n_f = static_cast<float>(this->near);
	float f_f = static_cast<float>(this->far);
	float t = static_cast<float>(tan(static_cast<double>(this->vFOV) / 2.0) * n_f);
	float b = -t;
	float r = t * ar;
	float l = -r;

	float n2 = 2.0f * n_f;
	float tmb = t - b;
	float rml = r - l;
	float fmn = f_f - n_f;
	this->matrix = FixedPoint::mat4f(
		FixedPoint::vec4f(n2 / rml, 0.0f, 0.0f, 0.0f),
		FixedPoint::vec4f(0.0f, n2 / tmb, 0.0f, 0.0f),
		FixedPoint::vec4f((r + l) / rml, (t + b) / tmb, -(f_f + n_f) / fmn, -1.0f),
		FixedPoint::vec4f(0.0f, 0.0f, -(n2 * f_f) / fmn, 0.0f));
}

} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoProjectionWASM) {
	class_<kayo::Projection>("Projection")
		.property("width", &kayo::Projection::getWidthJS, &kayo::Projection::setWidthJS)
		.property("height", &kayo::Projection::getHeightJS, &kayo::Projection::setHeightJS)
		.function("getProjection", &kayo::Projection::getProjectionMatrixJS)
		.function("setNear", &kayo::Projection::setNearJS)
		.function("getNear", &kayo::Projection::getNearJS)
		.function("setNear", &kayo::Projection::setFarJS)
		.function("getNear", &kayo::Projection::getFarJS);
}