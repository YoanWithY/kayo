#include "TimeLine.hpp"
#include <emscripten/bind.h>

namespace kayo {

const uint32_t FCurveSegmentTypeJS::CONSTANT = static_cast<uint32_t>(FCurveSegmentType::CONSTANT);
const uint32_t FCurveSegmentTypeJS::LINEAR = static_cast<uint32_t>(FCurveSegmentType::LINEAR);
const uint32_t FCurveSegmentTypeJS::HERMITE = static_cast<uint32_t>(FCurveSegmentType::HERMITE);

const uint32_t FCurveConstantSegmentModeJS::VALUE = static_cast<uint32_t>(FCurveConstantSegmentMode::VALUE);
const uint32_t FCurveConstantSegmentModeJS::LEFT_KNOT = static_cast<uint32_t>(FCurveConstantSegmentMode::LEFT_KNOT);
const uint32_t FCurveConstantSegmentModeJS::RIGHT_KNOT = static_cast<uint32_t>(FCurveConstantSegmentMode::RIGHT_KNOT);

void FCurve::insertKnotJS(FixedPoint::NumberWire x_wr, FixedPoint::NumberWire y_wr, bool _) {
	FixedPoint::Number x(x_wr);
	FixedPoint::Number y(y_wr);
	if (this->hasKnotAt(x))
		return;
	int32_t seg_index = this->getSegmentIndexAt(x);
	if (seg_index < 0)
		return;
	FCurveSegment* segment = this->segments[uint32_t(seg_index)];

	FCurveKnot* new_knot = new FCurveKnot(x, y);
	this->knots.insert(this->knots.begin() + seg_index, new_knot);
	auto new_seg = segment->split(new_knot);

	int32_t new_seg_index = seg_index + 1;
	this->segments.insert(this->segments.begin() + new_seg_index, new_seg);
	this->curve.segments.insert(this->curve.segments.begin() + new_seg_index, new_seg->getCurveSegment());
}

uint32_t FCurveSegment::getTypeJS() const {
	return static_cast<uint32_t>(this->type);
}

FixedPoint::NumberWire FCurveConstantSegment::getValueJS() const {
	return static_cast<FixedPoint::NumberWire>(this->value);
}

void FCurveConstantSegment::setValueJS(FixedPoint::NumberWire v) {
	this->value = v;
	dispatchToJS(&this->value);
}
uint32_t FCurveConstantSegment::getValueModeJS() const {
	return static_cast<uint32_t>(this->value_mode);
}

void FCurveKnot::setXJS(FixedPoint::NumberWire v) {
	this->x = v;
	dispatchToJS(&this->x);
}
FixedPoint::NumberWire FCurveKnot::getXJS() const {
	return static_cast<FixedPoint::NumberWire>(this->x);
}

void FCurveKnot::setYJS(FixedPoint::NumberWire v) {
	this->y = v;
	dispatchToJS(&this->y);
}
FixedPoint::NumberWire FCurveKnot::getYJS() const {
	return static_cast<FixedPoint::NumberWire>(this->y);
}

void FCurveKnot::setSlopeJS(FixedPoint::NumberWire v) {
	this->slope = v;
	dispatchToJS(&this->slope);
}
FixedPoint::NumberWire FCurveKnot::getSlopeJS() const {
	return static_cast<FixedPoint::NumberWire>(this->slope);
}

} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoTimeLineWASM) {
	class_<kayo::FCurveConstantSegmentModeJS>("FCurveConstantSegmentMode")
		.class_property("VALUE", &kayo::FCurveConstantSegmentModeJS::VALUE)
		.class_property("LEFT_KNOT", &kayo::FCurveConstantSegmentModeJS::LEFT_KNOT)
		.class_property("RIGHT_KNOT", &kayo::FCurveConstantSegmentModeJS::RIGHT_KNOT);
	class_<kayo::FCurveSegmentTypeJS>("FCurveSegmentType")
		.class_property("CONSTANT", &kayo::FCurveSegmentTypeJS::CONSTANT)
		.class_property("LINEAR", &kayo::FCurveSegmentTypeJS::LINEAR)
		.class_property("HERMITE", &kayo::FCurveSegmentTypeJS::HERMITE);
	class_<kayo::FCurveSegment>("FCurveSegment")
		.property("type", &kayo::FCurveSegment::getTypeJS)
		.property("leftKnot", &kayo::FCurveSegment::left_knot, allow_raw_pointers())
		.property("rightKnot", &kayo::FCurveSegment::right_knot, allow_raw_pointers())
		.function("getCurveSegment", &kayo::FCurveSegment::getCurveSegment, allow_raw_pointers());
	class_<kayo::FCurveConstantSegment, base<kayo::FCurveSegment>>("FCurveConstantSegment")
		.property("valueMode", &kayo::FCurveConstantSegment::getValueModeJS)
		.property("value", &kayo::FCurveConstantSegment::getValueJS, &kayo::FCurveConstantSegment::setValueJS);
	class_<kayo::FCurveKnot>("FCurveKnot")
		.property("x", &kayo::FCurveKnot::getXJS, &kayo::FCurveKnot::setXJS)
		.property("y", &kayo::FCurveKnot::getYJS, &kayo::FCurveKnot::setYJS)
		.property("slope", &kayo::FCurveKnot::getSlopeJS, &kayo::FCurveKnot::setSlopeJS);
	register_vector<kayo::FCurveSegment*>("FCurveSegmentVector");
	register_vector<kayo::FCurveKnot*>("FCurveKnotVector");
	class_<kayo::FCurve>("FCurve")
		.property("segments", &kayo::FCurve::segments, return_value_policy::reference())
		.property("knots", &kayo::FCurve::knots, return_value_policy::reference())
		.function("getSegmentIndexAt", &kayo::FCurve::getSegmentIndexAtJS)
		.function("insertKnot", &kayo::FCurve::insertKnotJS);
	class_<kayo::TimeLine>("TimeLine")
		.property("simulationTime", &kayo::TimeLine::simulationTime)
		.property("framesPerSecond", &kayo::TimeLine::framesPerSecond)
		.property("simulationTimeVelocity", &kayo::TimeLine::simulationTimeVelocity, return_value_policy::reference());
}