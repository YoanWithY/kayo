#pragma once
#include "../../numerics/splineCurve.hpp"
#include "jsViewControlled.hpp"
#include <vector>

namespace kayo {

class FCurveSegment;

enum class FCurveSegmentType {
	CONSTANT,
	LINEAR,
	HERMITE,
};

class FCurveKnot {
  public:
	JSVCNumber x;
	JSVCNumber y;
	JSVCNumber slope;
	constexpr FCurveKnot() : x(0), y(0) {}
	constexpr FCurveKnot(FixedPoint::Number x, FixedPoint::Number y) : x(x), y(y) {}
};

class FCurveSegment {
  protected:
	FixedPoint::NonUniformSplineCurveSegment1D* curve_segment;

  public:
	const FCurveSegmentType type;
	FCurveKnot* left_knot;
	FCurveKnot* right_knot;
	virtual ~FCurveSegment() = default;
	constexpr FCurveSegment(FixedPoint::NonUniformSplineCurveSegment1D* curve_segment, FCurveSegmentType type) : curve_segment(curve_segment), type(type) {}
	virtual constexpr FixedPoint::NonUniformSplineCurveSegment1D* getCurveSegment() {
		return this->curve_segment;
	}
	virtual FCurveSegment* split(FCurveKnot* new_knot) = 0;
};

enum class FCurveConstantSegmentMode {
	VALUE,
	LEFT_KNOT,
	RIGHT_KNOT
};
class FCurveConstantSegment : public FCurveSegment {

  public:
	FCurveConstantSegmentMode value_mode = FCurveConstantSegmentMode::VALUE;
	JSVCNumber value;
	constexpr FCurveConstantSegment(FixedPoint::ConstantNonUniformSplineCurveSegment1D* curve_segment) : FCurveSegment(curve_segment, FCurveSegmentType::CONSTANT) {}
	constexpr FixedPoint::ConstantNonUniformSplineCurveSegment1D* getCurveSegment() override {
		return dynamic_cast<FixedPoint::ConstantNonUniformSplineCurveSegment1D*>(this->curve_segment);
	}
	inline FCurveConstantSegment* split(FCurveKnot* new_knot) override {
		auto new_curve_seg = new FixedPoint::ConstantNonUniformSplineCurveSegment1D(
			&(new_knot->x.value),
			this->curve_segment->knot_end,
			&(new_knot->y.value));
		this->curve_segment->knot_end = &(new_knot->x.value);

		auto new_seg = new FCurveConstantSegment(new_curve_seg);
		new_seg->value_mode = FCurveConstantSegmentMode::LEFT_KNOT;
		new_seg->left_knot = new_knot;
		new_seg->right_knot = this->right_knot;
		this->right_knot = new_knot;
		return new_seg;
	}
};

class FCurveLinearSegment : public FCurveSegment {
	constexpr FCurveLinearSegment(FixedPoint::LinearNonUniformSplineCurveSegment1D* curve_segment) : FCurveSegment(curve_segment, FCurveSegmentType::LINEAR) {}
	constexpr FixedPoint::LinearNonUniformSplineCurveSegment1D* getCurveSegment() override {
		return dynamic_cast<FixedPoint::LinearNonUniformSplineCurveSegment1D*>(this->curve_segment);
	}
	inline FCurveLinearSegment* split(FCurveKnot* _) override {
		return nullptr;
	}
};

class FCurve {
  private:
	FixedPoint::NonUniformSplineCurve1D curve;
	FixedPoint::Number start = FixedPoint::MIN_NUMBER;
	FixedPoint::Number end = FixedPoint::MAX_NUMBER;

  public:
	std::vector<FCurveSegment*> segments;
	std::vector<FCurveKnot*> knots;

	inline void create() {
		FixedPoint::ConstantNonUniformSplineCurveSegment1D* seg1 = new FixedPoint::ConstantNonUniformSplineCurveSegment1D(&(this->start), &(this->end), nullptr);
		FCurveConstantSegment* fseg1 = new FCurveConstantSegment(seg1);
		seg1->value = &(fseg1->value.value);
		this->curve.segments.push_back(seg1);
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