#include "TimeLine.hpp"
#include <emscripten/bind.h>

namespace kayo {

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
		.property("leftKnot", &kayo::FCurveSegment::left_knot, allow_raw_pointers())
		.property("rightKnot", &kayo::FCurveSegment::right_knot, allow_raw_pointers())
		.function("getCurveSegment", &kayo::FCurveSegment::getCurveSegment, allow_raw_pointers());
	class_<kayo::FCurveConstantSegment, base<kayo::FCurveSegment>>("FCurveConstantSegment")
		.property("valueMode", &kayo::FCurveConstantSegment::value_mode)
		.property("value", &kayo::FCurveConstantSegment::value, return_value_policy::reference());
	class_<kayo::FCurveKnot>("FCurveKnot")
		.property("x", &kayo::FCurveKnot::x, return_value_policy::reference())
		.property("y", &kayo::FCurveKnot::y, return_value_policy::reference());
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