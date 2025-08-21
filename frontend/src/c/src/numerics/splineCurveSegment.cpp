#include "splineCurveSegment.hpp"
#include <emscripten/bind.h>

namespace FixedPoint {

template <>
kayo::memUtils::KayoPointer ConstantNonUniformSplineCurveSegment1D::sampleRangeAutoJS(
	NumberWire src_start_x_wr,
	NumberWire src_end_x_wr,
	NumberWire src_start_y_wr,
	NumberWire src_end_y_wr,
	double dst_start_x,
	double dst_end_x,
	double dst_start_y,
	double dst_end_y,
	double _) const {
	Number src_start_x = Number(src_start_x_wr);
	Number src_end_x(src_end_x_wr);
	Number src_start_y(src_start_y_wr);
	Number src_end_y(src_end_y_wr);
	Number src_range_x = src_end_x - src_start_x;
	Number src_range_y = src_end_y - src_start_y;
	double dst_range_x = dst_end_x - dst_start_x;
	double dst_range_y = dst_end_y - dst_start_y;

	kayo::memUtils::KayoPointer ptr = kayo::memUtils::allocKayoArray<double>(4);
	double* data = reinterpret_cast<double*>(ptr.byteOffset);

	Number x1 = max(*this->knot_start, src_start_x);
	Number x2 = min(*this->knot_end, src_end_x);
	data[0] = double((x1 - src_start_x) * dst_range_x / src_range_x + dst_start_x);
	data[1] = double((this->sampleNonUniform(x1) - src_start_y) * dst_range_y / src_range_y + dst_start_y);
	data[2] = double((x2 - src_start_x) * dst_range_x / src_range_x + dst_start_x);
	data[3] = double((this->sampleNonUniform(*this->knot_end) - src_start_y) * dst_range_y / src_range_y + dst_start_y);

	return ptr;
}

template <>
kayo::memUtils::KayoPointer LinearNonUniformSplineCurveSegment1D::sampleRangeAutoJS(
	NumberWire src_start_x_wr,
	NumberWire src_end_x_wr,
	NumberWire src_start_y_wr,
	NumberWire src_end_y_wr,
	double dst_start_x,
	double dst_end_x,
	double dst_start_y,
	double dst_end_y,
	double _) const {
	Number src_start_x = Number(src_start_x_wr);
	Number src_end_x(src_end_x_wr);
	Number src_start_y(src_start_y_wr);
	Number src_end_y(src_end_y_wr);
	Number src_range_x = src_end_x - src_start_x;
	Number src_range_y = src_end_y - src_start_y;
	double dst_range_x = dst_end_x - dst_start_x;
	double dst_range_y = dst_end_y - dst_start_y;

	kayo::memUtils::KayoPointer ptr = kayo::memUtils::allocKayoArray<double>(4);
	double* data = reinterpret_cast<double*>(ptr.byteOffset);

	Number x1 = max(*this->knot_start, src_start_x);
	Number x2 = min(*this->knot_end, src_end_x);
	data[0] = double((x1 - src_start_x) * dst_range_x / src_range_x + dst_start_x);
	data[1] = double((this->sampleNonUniform(x1) - src_start_y) * dst_range_y / src_range_y + dst_start_y);
	data[2] = double((x2 - src_start_x) * dst_range_x / src_range_x + dst_start_x);
	data[3] = double((this->sampleNonUniform(*this->knot_end) - src_start_y) * dst_range_y / src_range_y + dst_start_y);

	return ptr;
}
} // namespace FixedPoint

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoSplineCurveSegmentWASM) {
	class_<FixedPoint::UniformSplineCurveSegment1D>("UniformSplineCurveSegment1D")
		.function("sampleUniform", &FixedPoint::UniformSplineCurveSegment1D::sampleUniform);
	class_<FixedPoint::ConstantUniformSplineCurveSegment1D, base<FixedPoint::UniformSplineCurveSegment1D>>("ConstantUniformSplineCurve1D");
	class_<FixedPoint::NonUniformSplineCurveSegment1D>("NonUniformSplineCurveSegment1D")
		.function("sampleNonUniform", &FixedPoint::NonUniformSplineCurveSegment1D::sampleNonUniform)
		.function("sampleRangeAuto", &FixedPoint::NonUniformSplineCurveSegment1D::sampleRangeAutoJS);
	class_<FixedPoint::ConstantNonUniformSplineCurveSegment1D, base<FixedPoint::NonUniformSplineCurveSegment1D>>("ConstantNonUniformSplineCurveSegment1D");
	class_<FixedPoint::LinearNonUniformSplineCurveSegment1D, base<FixedPoint::NonUniformSplineCurveSegment1D>>("LinearNonUniformSplineCurveSegment1D");
}
