#pragma once
#include "../utils/memUtils.hpp"
#include "fixed.hpp"
#include <vector>
namespace FixedPoint {

template <typename T>
class UniformSplineCurveSegment {
  public:
	Number knot_start;
	Number knot_end;
	virtual T sampleUniform(Number t) const = 0;
	virtual ~UniformSplineCurveSegment() = default;
};

template <typename T>
class ConstantUniformSplineCurveSegment : public UniformSplineCurveSegment<T> {
  private:
	T value;

  public:
	constexpr ConstantUniformSplineCurveSegment(const T& value) : value(value) {}
	constexpr T sampleUniform(Number _) const override {
		return this->value;
	}
};

template <typename T>
class NonUniformSplineCurveSegment {
  public:
	Number knot_start;
	Number knot_end;
	constexpr NonUniformSplineCurveSegment(Number knot_start, Number knot_end) : knot_start(knot_start), knot_end(knot_end) {}
	constexpr bool contains(Number u) const noexcept {
		return this->knot_start <= u && this->knot_end >= u;
	}
	virtual inline kayo::memUtils::KayoPointer sampleRangeAutoJS(
		NumberJSWireType src_start_x_wr,
		NumberJSWireType src_end_x_wr,
		NumberJSWireType src_start_y_wr,
		NumberJSWireType src_end_y_wr,
		double dst_start_x,
		double dst_end_x,
		double dst_start_y,
		double dst_end_y,
		double resolution) const = 0;
	virtual T sampleNonUniform(Number t) const = 0;
	virtual ~NonUniformSplineCurveSegment() = default;
};

template <typename T>
class ConstantNonUniformSplineCurveSegment : public NonUniformSplineCurveSegment<T> {
  private:
	T value;

  public:
	constexpr ConstantNonUniformSplineCurveSegment(Number knot_start, Number knot_end, T value) : NonUniformSplineCurveSegment<T>(knot_start, knot_end), value(value) {}
	constexpr T sampleNonUniform(Number _) const override {
		return this->value;
	}
	kayo::memUtils::KayoPointer sampleRangeAutoJS(
		NumberJSWireType src_start_x_wr,
		NumberJSWireType src_end_x_wr,
		NumberJSWireType src_start_y_wr,
		NumberJSWireType src_end_y_wr,
		double dst_start_x,
		double dst_end_x,
		double dst_start_y,
		double dst_end_y,
		double _) const override {
		Number src_start_x(src_start_x_wr);
		Number src_end_x(src_end_x_wr);
		Number src_start_y(src_start_y_wr);
		Number src_end_y(src_end_y_wr);
		Number src_range_x = src_end_x - src_start_x;
		Number src_range_y = src_end_y - src_start_y;
		double dst_range_x = dst_end_x - dst_start_x;
		double dst_range_y = dst_end_y - dst_start_y;

		kayo::memUtils::KayoPointer ptr = kayo::memUtils::allocKayoArray<double>(4);
		double* data = reinterpret_cast<double*>(ptr.byteOffset);

		data[0] = double((this->knot_start - src_start_x) * dst_range_x / src_range_x + dst_start_x);
		data[1] = double((this->sampleNonUniform(this->knot_start) - src_start_y) * dst_range_y / src_range_y + dst_start_y);
		data[2] = double((this->knot_end - src_start_x) * dst_range_x / src_range_x + dst_start_x);
		data[3] = double((this->sampleNonUniform(this->knot_end) - src_start_y) * dst_range_y / src_range_y + dst_start_y);

		return ptr;
	};
};

typedef UniformSplineCurveSegment<Number> UniformSplineCurveSegment1D;
typedef ConstantUniformSplineCurveSegment<Number> ConstantUniformSplineCurveSegment1D;
typedef NonUniformSplineCurveSegment<Number> NonUniformSplineCurveSegment1D;
typedef ConstantNonUniformSplineCurveSegment<Number> ConstantNonUniformSplineCurveSegment1D;

} // namespace FixedPoint