#pragma once
#include "../../numerics/splineCurve.hpp"
#include "jsViewControlled.hpp"
#include <vector>

namespace kayo {

class FCurveKnot;

class FCurveSegment {
  public:
	FCurveKnot* knot_in;
	FCurveKnot* knot_out;
	virtual ~FCurveSegment() = default;
};

class FCurveConstantSegment : public FCurveSegment {
  public:
	FixedPoint::ConstantNonUniformSplineCurveSegment1D* curve_segment;
	constexpr FCurveConstantSegment(FixedPoint::ConstantNonUniformSplineCurveSegment1D* seg) : curve_segment(seg) {}
};

class FCurveKnot {
  public:
	JSVCNumber x;
	JSVCNumber y;
	FCurveSegment* curve_in;
	FCurveSegment* curve_out;
	constexpr FCurveKnot(FCurveSegment* curve_in, FCurveSegment* curve_out) : curve_in(curve_in), curve_out(curve_out) {
		this->curve_in->knot_out = this;
		this->curve_out->knot_in = this;
	}
};

class FCurve {
  public:
	FixedPoint::NonUniformSplineCurve1D curve;
	std::vector<FCurveSegment*> segments;
	std::vector<FCurveKnot*> knots;

	constexpr void create() {
		FixedPoint::ConstantNonUniformSplineCurveSegment1D* seg1 = new FixedPoint::ConstantNonUniformSplineCurveSegment1D(-100000, 0, 0);
		FixedPoint::ConstantNonUniformSplineCurveSegment1D* seg2 = new FixedPoint::ConstantNonUniformSplineCurveSegment1D(0, 100000, 0);
		this->curve.segments.push_back(seg1);
		this->curve.segments.push_back(seg2);
		FCurveKnot* knot = new FCurveKnot(new FCurveConstantSegment(seg1), new FCurveConstantSegment(seg1));
		this->knots.push_back(knot);
	}

	constexpr void destroy() const {
		for (auto a : this->segments)
			delete a;
		for (auto a : this->knots)
			delete a;
	}
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