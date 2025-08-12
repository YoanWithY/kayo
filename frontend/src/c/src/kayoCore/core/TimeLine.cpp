#include "TimeLine.hpp"
#include <emscripten/bind.h>

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoTimeLineWASM) {
	class_<kayo::FCurveSegment>("FCurveSegment");
	class_<kayo::FCurveKnot>("FCurveKnot");
	register_vector<kayo::FCurveSegment*>("FCurveSegmentVector");
	register_vector<kayo::FCurveKnot*>("FCurveKnotVector");
	class_<kayo::FCurve>("FCurve")
		.property("segments", &kayo::FCurve::segments, return_value_policy::reference())
		.property("knots", &kayo::FCurve::knots, return_value_policy::reference())
		.property("curve", &kayo::FCurve::curve, return_value_policy::reference());
	class_<kayo::TimeLine>("TimeLine")
		.property("simulationTime", &kayo::TimeLine::simulationTime)
		.property("framesPerSecond", &kayo::TimeLine::framesPerSecond)
		.property("simulationTimeVelocity", &kayo::TimeLine::simulationTimeVelocity, return_value_policy::reference());
}