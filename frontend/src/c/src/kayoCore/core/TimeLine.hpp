#pragma once
#include "../../numerics/splineCurve.hpp"
#include "jsViewControlled.hpp"
#include <vector>

namespace kayo {

class FCurveKnot {
  public:
	JSVCNumber x;
	JSVCNumber y;
	JSVCBoolean mirror;
	FCurveKnot() = default;
	constexpr FCurveKnot(FixedPoint::Number x, FixedPoint::Number y, bool mirror) : x(JSVCNumber(x)), y(JSVCNumber(y)), mirror(mirror) {}
};

class FCurveSegment {
  protected:
	FixedPoint::NonUniformSplineCurveSegment1D* curve_segment;

  public:
	constexpr FCurveSegment(FixedPoint::NonUniformSplineCurveSegment1D* curve_segment) : curve_segment(curve_segment) {}
	virtual ~FCurveSegment() = default;
	virtual constexpr FixedPoint::NonUniformSplineCurveSegment1D* getCurveSegment() {
		return this->curve_segment;
	}
	virtual FCurveSegment* split(FixedPoint::Number u, FixedPoint::Number y, bool mirror) = 0;
};

class FCurveConstantSegment : public FCurveSegment {
  public:
	constexpr FCurveConstantSegment(FixedPoint::ConstantNonUniformSplineCurveSegment1D* curve_segment) : FCurveSegment(curve_segment) {}
	virtual constexpr FixedPoint::ConstantNonUniformSplineCurveSegment1D* getCurveSegment() override {
		return dynamic_cast<FixedPoint::ConstantNonUniformSplineCurveSegment1D*>(this->curve_segment);
	}
	virtual inline FCurveConstantSegment* split(FixedPoint::Number u, FixedPoint::Number y, bool _) override {
		if (u <= this->curve_segment->knot_start || u >= this->curve_segment->knot_end)
			return nullptr;

		auto curve_seg = new FixedPoint::ConstantNonUniformSplineCurveSegment1D(
			u,
			this->curve_segment->knot_end,
			y);
		this->curve_segment->knot_end = u;
		auto new_seg = new FCurveConstantSegment(curve_seg);
		return new_seg;
	}
};

class FCurve {
  private:
	FixedPoint::NonUniformSplineCurve1D curve;

  public:
	std::vector<FCurveSegment*> segments;
	std::vector<FCurveKnot*> knots;

	inline void create() {
		FixedPoint::ConstantNonUniformSplineCurveSegment1D* seg1 = new FixedPoint::ConstantNonUniformSplineCurveSegment1D(FixedPoint::MIN_NUMBER, FixedPoint::MAX_NUMBER, 0);
		this->curve.segments.push_back(seg1);
		FCurveConstantSegment* fseg1 = new FCurveConstantSegment(seg1);
		this->segments.push_back(fseg1);
	}

	constexpr int32_t getSegmentIndexAt(FixedPoint::Number u) const {
		return this->curve.getSegmentIndexAt(u);
	}

	constexpr int32_t getSegmentIndexAtJS(FixedPoint::NumberWire u) const {
		return this->getSegmentIndexAt(FixedPoint::Number(u));
	}

	constexpr FCurveSegment* getSegmentAt(FixedPoint::Number u) const {
		int32_t i = this->getSegmentIndexAt(u);
		if (i < 0)
			return nullptr;
		return this->segments[uint32_t(i)];
	}

	constexpr void destroy() const {
		for (auto a : this->segments)
			delete a;
		for (auto a : this->knots)
			delete a;
	}

	constexpr bool hasKnotAt(const FixedPoint::Number& u) const {
		for (FCurveKnot* k : this->knots)
			if (k->x.value == u)
				return true;
		return false;
	}

	void insertKnotJS(FixedPoint::NumberWire x, FixedPoint::NumberWire y, bool mirror);
};

class TimeLine {
  public:
	/**
	 * The current time stemp in the timeline of the simulation. This is unique for a kayo instance.
	 */
	FixedPoint::Number simulationTime;
	/**
	 * Frames per physical second to display to the user.
	 */
	FixedPoint::Number framesPerSecond;
	/**
	 * Simulation time delta over physical time delta or simulation timein secods per physical seconds.
	 */
	FCurve simulationTimeVelocity;
};

} // namespace kayo