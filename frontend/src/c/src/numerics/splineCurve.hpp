#pragma once
#include "splineCurveSegment.hpp"
namespace FixedPoint {

template <typename T>
class NonUniformSplineCurve {
  public:
	std::vector<NonUniformSplineCurveSegment<T>*> segments;
	constexpr T sample(Number u) const noexcept {
		NonUniformSplineCurveSegment<T>* segment = this->getSegmentAt(u);
		if (!segment)
			return T(0);
		return segment->sampleNonUniform(u);
	}
	constexpr NumberJSWireType sampleJS(NumberJSWireType n) const {
		return static_cast<NumberJSWireType>(this->sample(Number(n)));
	}
	constexpr int64_t getSegmentIndexAt(Number u) const noexcept {
		if (this->segments.empty())
			return -1;
		if (this->segments[0]->knot_start > u || this->segments.back()->knot_end < u)
			return -1;

		size_t current_end = this->segments.size(); // exclusive
		size_t current_start = 0;					// inclusive
		size_t current_index = current_end / 2;

		while (current_start < current_end) {
			const NonUniformSplineCurveSegment<T>* currentSegment = this->segments[current_index];
			if (currentSegment->contains(u))
				return current_index;
			if (u < currentSegment->knot_start)
				current_end = current_index;
			else
				current_start = current_index + 1;
			current_index = current_start + (current_end - current_start) / 2;
		}
		return -1;
	}
	constexpr NonUniformSplineCurveSegment<T>* getSegmentAt(Number u) const noexcept {
		int64_t i = this->getSegmentIndexAt(u);
		if (i < 0)
			return nullptr;
		return this->segments[size_t(i)];
	}

	constexpr ~NonUniformSplineCurve() {
		for (auto a : this->segments)
			delete a;
	}
};

template <typename T>
class UniformSplineCurve {
  public:
	UniformSplineCurve() = default;
	std::vector<UniformSplineCurveSegment<T>*> segments;
	constexpr T sample(Number u) const noexcept {
		UniformSplineCurveSegment<T>* segment = this->getSegmentAt(u);
		if (!segment)
			return T(0);
		return segment->sampleUniform(u.fract());
	}

	constexpr UniformSplineCurveSegment<T>* getSegmentAt(Number u) const noexcept {
		int64_t i = u.integer();
		if (i < 0 || i >= this->segments.size())
			return nullptr;
		return this->segments[size_t(i)];
	}
	constexpr ~UniformSplineCurve() {
		for (auto a : this->segments)
			delete a;
	}
};

typedef UniformSplineCurve<Number> UniformSplineCurve1D;
typedef NonUniformSplineCurve<Number> NonUniformSplineCurve1D;

} // namespace FixedPoint