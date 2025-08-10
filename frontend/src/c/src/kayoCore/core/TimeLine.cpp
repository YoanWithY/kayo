#include "TimeLine.hpp"
#include <emscripten/bind.h>

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoTimeLineWASM) {
	class_<kayo::FCurveSegment>("FCurveSegment");
	class_<kayo::FCurveKnot>("FCurveKnot");
	register_vector<kayo::FCurveSegment*>("FCurveSegmentVector");
	register_vector<kayo::FCurveKnot*>("FCurveKnotVector");
	class_<kayo::FCurve>("FCurve")
		.property("segments", &kayo::FCurve::segments)
		.property("knots", &kayo::FCurve::knots)
		.property("curve", &kayo::FCurve::curve);
	class_<kayo::TimeLine>("TimeLine")
		.property("simulationTime", &kayo::TimeLine::simulationTime)
		.property("framesPerSecond", &kayo::TimeLine::framesPerSecond)
		.property("simulationTimeVelocity", &kayo::TimeLine::simulationTimeVelocity, return_value_policy::reference());
}