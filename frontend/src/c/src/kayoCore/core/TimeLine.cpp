#include "TimeLine.hpp"
#include <emscripten/bind.h>

namespace kayo {
void FCurve::insertKnotJS(FixedPoint::NumberWire x_wr, FixedPoint::NumberWire y_wr, bool mirror) {
	FixedPoint::Number x(x_wr);
	FixedPoint::Number y(y_wr);
	int32_t seg_index = this->getSegmentIndexAt(x);
	if (seg_index < 0)
		return;
	FCurveSegment* segment = this->segments[uint32_t(seg_index)];

	auto new_seg = segment->split(x, y, mirror);

	int32_t newIndex = seg_index + 1;
	this->segments.insert(this->segments.begin() + newIndex, new_seg);
	this->curve.segments.insert(this->curve.segments.begin() + newIndex, new_seg->getCurveSegment());
}

} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoTimeLineWASM) {
	class_<kayo::FCurveSegment>("FCurveSegment")
		.function("getCurveSegment", &kayo::FCurveSegment::getCurveSegment, allow_raw_pointers());
	class_<kayo::FCurveKnot>("FCurveKnot");
	register_vector<kayo::FCurveSegment*>("FCurveSegmentVector");
	register_vector<kayo::FCurveKnot*>("FCurveKnotVector");
	class_<kayo::FCurve>("FCurve")
		.property("segments", &kayo::FCurve::segments, return_value_policy::reference())
		.property("knots", &kayo::FCurve::knots, return_value_policy::reference())
		.function("getSegmentIndexAt", &kayo::FCurve::getSegmentIndexAtJS);
	class_<kayo::TimeLine>("TimeLine")
		.property("simulationTime", &kayo::TimeLine::simulationTime)
		.property("framesPerSecond", &kayo::TimeLine::framesPerSecond)
		.property("simulationTimeVelocity", &kayo::TimeLine::simulationTimeVelocity, return_value_policy::reference());
}