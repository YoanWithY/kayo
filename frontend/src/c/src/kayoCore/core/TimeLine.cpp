#include "TimeLine.hpp"
#include <emscripten/bind.h>

namespace kayo {

FixedPoint::NumberWire FCurveKnot::getXJS() const {
	return static_cast<FixedPoint::NumberWire>(this->x);
}

FixedPoint::NumberWire FCurveKnot::getYJS() const {
	return static_cast<FixedPoint::NumberWire>(this->y);
}

void FCurveKnot::setXJS(FixedPoint::NumberWire x_wr) {
	this->x = x_wr;
}

void FCurveKnot::setYJS(FixedPoint::NumberWire y_wr) {
	this->y = y_wr;
}

void FCurve::insertKnotJS(FixedPoint::NumberWire x_wr, FixedPoint::NumberWire y_wr, bool mirror) {
	FixedPoint::Number x(x_wr);
	FixedPoint::Number y(y_wr);
	if (this->hasKnotAt(x))
		return;
	int32_t seg_index = this->getSegmentIndexAt(x);
	if (seg_index < 0)
		return;
	FCurveSegment* segment = this->segments[uint32_t(seg_index)];

	FCurveKnot* new_knot = new FCurveKnot(x, y, mirror);
	this->knots.insert(this->knots.begin() + seg_index, new_knot);
	auto new_seg = segment->split(new_knot);

	int32_t new_seg_index = seg_index + 1;
	this->segments.insert(this->segments.begin() + new_seg_index, new_seg);
	this->curve.segments.insert(this->curve.segments.begin() + new_seg_index, new_seg->getCurveSegment());
}

FixedPoint::NumberWire FCurveConstantSegment::getValueJS() const {
	return static_cast<FixedPoint::NumberWire>(this->value);
}

void FCurveConstantSegment::setValueJS(FixedPoint::NumberWire v_wr) {
	this->value = v_wr;
}

void FCurveConstantSegment::setPointedValueJS(FixedPoint::NumberWire v_wr) {
	*this->getCurveSegment()->value = v_wr;
}

} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoTimeLineWASM) {
	enum_<kayo::FCurveConstantSegmentMode>("FCurveConstantSegmentMode")
		.value("VALUE", kayo::FCurveConstantSegmentMode::VALUE)
		.value("LEFT_KNOT", kayo::FCurveConstantSegmentMode::LEFT_KNOT)
		.value("RIGHT_KNOT", kayo::FCurveConstantSegmentMode::RIGHT_KNOT);
	enum_<kayo::FCurveSegmentType>("FCurveSegmentType")
		.value("CONSTANT", kayo::FCurveSegmentType::CONSTANT)
		.value("LINEAR", kayo::FCurveSegmentType::LINEAR)
		.value("HERMITE", kayo::FCurveSegmentType::HERMITE);
	class_<kayo::FCurveSegment>("FCurveSegment")
		.property("type", &kayo::FCurveSegment::type)
		.function("getCurveSegment", &kayo::FCurveSegment::getCurveSegment, allow_raw_pointers());
	class_<kayo::FCurveConstantSegment, base<kayo::FCurveSegment>>("FCurveConstantSegment")
		.property("valueMode", &kayo::FCurveConstantSegment::value_mode)
		.function("setPointedValue", &kayo::FCurveConstantSegment::setPointedValueJS)
		.property("value", &kayo::FCurveConstantSegment::getValueJS, &kayo::FCurveConstantSegment::setValueJS);
	class_<kayo::FCurveKnot>("FCurveKnot")
		.property("x", &kayo::FCurveKnot::getXJS, &kayo::FCurveKnot::setXJS)
		.property("y", &kayo::FCurveKnot::getYJS, &kayo::FCurveKnot::setYJS);
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