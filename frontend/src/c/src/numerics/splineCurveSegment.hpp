#pragma once
#include "../utils/memUtils.hpp"
#include "fixed.hpp"
#include <vector>
namespace FixedPoint {

template <typename T>
class UniformSplineCurveSegment {
  public:
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
	Number* knot_start;
	Number* knot_end;
	constexpr NonUniformSplineCurveSegment(Number* knot_start, Number* knot_end) : knot_start(knot_start), knot_end(knot_end) {}
	constexpr bool contains(Number u) const noexcept {
		return *(this->knot_start) <= u && *(this->knot_end) >= u;
	}
	virtual inline kayo::memUtils::KayoPointer sampleRangeAutoJS(
		NumberWire src_start_x_wr,
		NumberWire src_end_x_wr,
		NumberWire src_start_y_wr,
		NumberWire src_end_y_wr,
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
  public:
	T* value;
	constexpr ConstantNonUniformSplineCurveSegment(Number* knot_start, Number* knot_end, T* value) : NonUniformSplineCurveSegment<T>(knot_start, knot_end), value(value) {}
	constexpr T sampleNonUniform(Number _) const override {
		return *(this->value);
	}
	kayo::memUtils::KayoPointer sampleRangeAutoJS(
		NumberWire src_start_x_wr,
		NumberWire src_end_x_wr,
		NumberWire src_start_y_wr,
		NumberWire src_end_y_wr,
		double dst_start_x,
		double dst_end_x,
		double dst_start_y,
		double dst_end_y,
		double _) const override;
};

template <typename T>
class LinearNonUniformSplineCurveSegment : public NonUniformSplineCurveSegment<T> {
  private:
	T value_start;
	T value_end;

  public:
	constexpr LinearNonUniformSplineCurveSegment(Number* knot_start, Number* knot_end, T* value_start, T* value_end) : NonUniformSplineCurveSegment<T>(knot_start, knot_end), value_start(value_start), value_end(value_end) {}
	constexpr T sampleNonUniform(Number u) const override {
		return lerp(this->value_start, this->value_end, (u - *this->knot_start) / (*this->knot_end - *this->knot_start));
	}
	kayo::memUtils::KayoPointer sampleRangeAutoJS(
		NumberWire src_start_x_wr,
		NumberWire src_end_x_wr,
		NumberWire src_start_y_wr,
		NumberWire src_end_y_wr,
		double dst_start_x,
		double dst_end_x,
		double dst_start_y,
		double dst_end_y,
		double _) const override;
	constexpr void setValueStart(const T& v) {
		this->value_start = v;
	}
	constexpr T getValueStart() const {
		return this->value_start;
	}
	constexpr void setValueEnd(const T& v) {
		this->value_end = v;
	}
	constexpr T getValueEnd() const {
		return this->value_end;
	}
};

typedef UniformSplineCurveSegment<Number> UniformSplineCurveSegment1D;
typedef ConstantUniformSplineCurveSegment<Number> ConstantUniformSplineCurveSegment1D;
typedef NonUniformSplineCurveSegment<Number> NonUniformSplineCurveSegment1D;
typedef ConstantNonUniformSplineCurveSegment<Number> ConstantNonUniformSplineCurveSegment1D;
typedef LinearNonUniformSplineCurveSegment<Number> LinearNonUniformSplineCurveSegment1D;

} // namespace FixedPoint