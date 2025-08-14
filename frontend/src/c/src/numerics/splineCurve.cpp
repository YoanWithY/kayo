#include "splineCurve.hpp"
#include <emscripten/bind.h>

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoSplineCurveWASM) {
	register_vector<FixedPoint::NonUniformSplineCurveSegment1D*>("VectorNonUniformSplineCurveSegment1D");
	class_<FixedPoint::UniformSplineCurve1D>("UniformSplineCurve1D");
	class_<FixedPoint::NonUniformSplineCurve1D>("NonUniformSplineCurve1D")
		.property("segments", &FixedPoint::NonUniformSplineCurve1D::segments, return_value_policy::reference())
		.function("getSegemtIndexAt", &FixedPoint::NonUniformSplineCurve1D::getSegmentIndexAtJS)
		.function("sample", &FixedPoint::NonUniformSplineCurve1D::sampleJS);
}