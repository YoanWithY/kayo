#include "splineCurve.hpp"
#include <emscripten/bind.h>

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoSplineCurveWASM) {
	class_<FixedPoint::UniformSplineCurve1D>("UniformSplineCurve1D");
	class_<FixedPoint::NonUniformSplineCurve1D>("NonUniformSplineCurve1D")
		.function("sample", &FixedPoint::NonUniformSplineCurve1D::sampleJS);
}