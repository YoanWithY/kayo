#include "FCurve.hpp"
#include <emscripten/bind.h>

namespace kayo {

const uint32_t FCurveSegmentTypeJS::CONSTANT = static_cast<uint32_t>(FCurveSegmentType::CONSTANT);
const uint32_t FCurveSegmentTypeJS::LINEAR = static_cast<uint32_t>(FCurveSegmentType::LINEAR);
const uint32_t FCurveSegmentTypeJS::HERMITE = static_cast<uint32_t>(FCurveSegmentType::HERMITE);

void FCurve::setValueAtJS(FixedPoint::NumberWire x_wr, FixedPoint::NumberWire y_wr, bool enforce_new_knot) {
	FixedPoint::Number x(x_wr);
	FixedPoint::Number y(y_wr);

	if (auto* knot = knotAt(x)) {
		knot->y = y;
		return;
	}

	if (segments.size() == 1 && segments[0]->type == FCurveSegmentType::CONSTANT && !enforce_new_knot) {
		knots[0]->y = y;
		knots[1]->y = y;
		return;
	}

	int32_t seg_index = this->getSegmentIndexAt(x);
	if (seg_index < 0)
		return;
	FCurveSegment* segment = this->segments[uint32_t(seg_index)];
	int32_t new_seg_index = seg_index + 1;

	FCurveKnot* new_knot = new FCurveKnot(x, y);
	this->knots.insert(this->knots.begin() + new_seg_index, new_knot);
	auto new_seg = segment->split(new_knot);

	this->segments.insert(this->segments.begin() + new_seg_index, new_seg);
	this->curve.segments.insert(this->curve.segments.begin() + new_seg_index, new_seg->getCurveSegment());
}

uint32_t FCurveSegment::getTypeJS() const {
	return static_cast<uint32_t>(this->type);
}

void FCurveKnot::setXJS(FixedPoint::NumberWire v) {
	this->x = v;
}
FixedPoint::NumberWire FCurveKnot::getXJS() const {
	return static_cast<FixedPoint::NumberWire>(this->x);
}

void FCurveKnot::setYJS(FixedPoint::NumberWire v) {
	this->y = v;
}
FixedPoint::NumberWire FCurveKnot::getYJS() const {
	return static_cast<FixedPoint::NumberWire>(this->y);
}

void FCurveKnot::setSlopeJS(FixedPoint::NumberWire v) {
	this->slope = v;
}
FixedPoint::NumberWire FCurveKnot::getSlopeJS() const {
	return static_cast<FixedPoint::NumberWire>(this->slope);
}

} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoFCurveWASM) {
	class_<kayo::FCurveSegmentTypeJS>("FCurveSegmentType")
		.class_property("CONSTANT", &kayo::FCurveSegmentTypeJS::CONSTANT)
		.class_property("LINEAR", &kayo::FCurveSegmentTypeJS::LINEAR)
		.class_property("HERMITE", &kayo::FCurveSegmentTypeJS::HERMITE);
	class_<kayo::FCurveSegment>("FCurveSegment")
		.property("type", &kayo::FCurveSegment::getTypeJS)
		.property("leftKnot", &kayo::FCurveSegment::left_knot, allow_raw_pointers())
		.property("rightKnot", &kayo::FCurveSegment::right_knot, allow_raw_pointers());
	class_<kayo::FCurveConstantSegment, base<kayo::FCurveSegment>>("FCurveConstantSegment");
	class_<kayo::FCurveKnot>("FCurveKnot")
		.property("x", &kayo::FCurveKnot::getXJS, &kayo::FCurveKnot::setXJS)
		.property("y", &kayo::FCurveKnot::getYJS, &kayo::FCurveKnot::setYJS)
		.property("slope", &kayo::FCurveKnot::getSlopeJS, &kayo::FCurveKnot::setSlopeJS);
	register_vector<kayo::FCurveSegment*>("FCurveSegmentVector");
	register_vector<kayo::FCurveKnot*>("FCurveKnotVector");
	class_<kayo::FCurve, base<kayo::DataBlock>>("FCurve")
		.property("segments", &kayo::FCurve::segments, return_value_policy::reference())
		.property("knots", &kayo::FCurve::knots, return_value_policy::reference())
		.function("getSegmentIndexAt", &kayo::FCurve::getSegmentIndexAtJS)
		.function("setValueAt", &kayo::FCurve::setValueAtJS);
	class_<kayo::NumberFCurve, base<kayo::FCurve>>("NumberFCurve")
		.constructor<uint32_t, FixedPoint::NumberWire>()
		.function("sample", &kayo::NumberFCurve::sampleJS);
	class_<kayo::BooleanFCurve, base<kayo::FCurve>>("BooleanFCurve")
		.constructor<uint32_t, bool>()
		.function("sample", &kayo::BooleanFCurve::sampleJS);
	class_<kayo::EnumFCurve, base<kayo::FCurve>>("EnumFCurve")
		.constructor<uint32_t, uint32_t, uint32_t>()
		.function("sample", &kayo::EnumFCurve::sampleJS);
}