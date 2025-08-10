#include "splineCurveSegment.hpp"
#include <emscripten/bind.h>

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoSplineCurveSegmentWASM) {
	class_<FixedPoint::UniformSplineCurveSegment1D>("UniformSplineCurveSegment1D")
		.function("sampleUniform", &FixedPoint::UniformSplineCurveSegment1D::sampleUniform);
	class_<FixedPoint::ConstantUniformSplineCurveSegment1D, base<FixedPoint::UniformSplineCurveSegment1D>>("ConstantUniformSplineCurve1D")
		.function("sampleUniform", &FixedPoint::ConstantUniformSplineCurveSegment1D::sampleUniform);
	class_<FixedPoint::NonUniformSplineCurveSegment1D>("NonUniformSplineCurveSegment1D")
		.function("sampleNonUniform", &FixedPoint::NonUniformSplineCurveSegment1D::sampleNonUniform);
	class_<FixedPoint::ConstantNonUniformSplineCurveSegment1D, base<FixedPoint::NonUniformSplineCurveSegment1D>>("ConstantNonUniformSplineCurve1D")
		.function("sampleNonUniform", &FixedPoint::ConstantNonUniformSplineCurveSegment1D::sampleNonUniform);
}
