#pragma once
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
};

typedef UniformSplineCurveSegment<Number> UniformSplineCurveSegment1D;
typedef ConstantUniformSplineCurveSegment<Number> ConstantUniformSplineCurveSegment1D;
typedef NonUniformSplineCurveSegment<Number> NonUniformSplineCurveSegment1D;
typedef ConstantNonUniformSplineCurveSegment<Number> ConstantNonUniformSplineCurveSegment1D;

} // namespace FixedPoint