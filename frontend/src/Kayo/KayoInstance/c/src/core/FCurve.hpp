#pragma once
#include "../numerics/splineCurve.hpp"
#include "./DataBlock.hpp"
#include "./JsInterop.hpp"
#include <vector>

namespace kayo {

enum class FCurveSegmentType : uint32_t {
	CONSTANT,
	LINEAR,
	HERMITE,
};

class FCurveSegmentTypeJS {
  public:
	static const uint32_t CONSTANT;
	static const uint32_t LINEAR;
	static const uint32_t HERMITE;
};

class FCurveKnot {
  public:
	FixedPoint::Number x;
	FixedPoint::Number y;
	FixedPoint::Number slope;

	constexpr FCurveKnot() : x(0), y(0), slope(0) {}
	constexpr FCurveKnot(FixedPoint::Number x, FixedPoint::Number y)
		: x(x), y(y), slope(0) {}

	FixedPoint::NumberWire getXJS() const;
	void setXJS(FixedPoint::NumberWire v);
	FixedPoint::NumberWire getYJS() const;
	void setYJS(FixedPoint::NumberWire v);
	FixedPoint::NumberWire getSlopeJS() const;
	void setSlopeJS(FixedPoint::NumberWire v);
};

class FCurveSegment {
  protected:
	FixedPoint::NonUniformSplineCurveSegment1D* curve_segment;

  public:
	const FCurveSegmentType type;
	FCurveKnot* left_knot;
	FCurveKnot* right_knot;

	virtual ~FCurveSegment() = default;

	constexpr FCurveSegment(
		FCurveKnot* left_knot,
		FCurveKnot* right_knot,
		FixedPoint::NonUniformSplineCurveSegment1D* curve_segment,
		FCurveSegmentType type)
		: curve_segment(curve_segment), type(type), left_knot(left_knot), right_knot(right_knot) {}

	virtual constexpr FixedPoint::NonUniformSplineCurveSegment1D* getCurveSegment() {
		return this->curve_segment;
	}

	virtual FCurveSegment* split(FCurveKnot* new_knot) = 0;

	uint32_t getTypeJS() const;
};

class FCurveConstantSegment : public FCurveSegment {
  public:
	constexpr FCurveConstantSegment(
		FCurveKnot* left_knot,
		FCurveKnot* right_knot,
		FixedPoint::ConstantNonUniformSplineCurveSegment1D* curve_segment)
		: FCurveSegment(left_knot, right_knot, curve_segment, FCurveSegmentType::CONSTANT) {}

	constexpr FixedPoint::ConstantNonUniformSplineCurveSegment1D*
	getCurveSegment() override {
		return static_cast<
			FixedPoint::ConstantNonUniformSplineCurveSegment1D*>(
			this->curve_segment);
	}

	inline FCurveConstantSegment* split(FCurveKnot* new_knot) override {
		auto new_curve_seg =
			new FixedPoint::ConstantNonUniformSplineCurveSegment1D(
				&(new_knot->x),
				this->curve_segment->knot_end,
				&(new_knot->y));

		this->curve_segment->knot_end = &(new_knot->x);

		auto new_fcurve_seg = new FCurveConstantSegment(new_knot, this->right_knot, new_curve_seg);
		this->right_knot = new_knot;

		return new_fcurve_seg;
	}
};

class FCurveLinearSegment : public FCurveSegment {
  public:
	constexpr FCurveLinearSegment(
		FCurveKnot* left_knot,
		FCurveKnot* right_knot,
		FixedPoint::LinearNonUniformSplineCurveSegment1D* curve_segment)
		: FCurveSegment(left_knot, right_knot, curve_segment, FCurveSegmentType::LINEAR) {}

	constexpr FixedPoint::LinearNonUniformSplineCurveSegment1D*
	getCurveSegment() override {
		return static_cast<
			FixedPoint::LinearNonUniformSplineCurveSegment1D*>(
			this->curve_segment);
	}

	inline FCurveLinearSegment* split(FCurveKnot*) override {
		// todo:
		return nullptr;
	}
};

class FCurve : public DataBlock {
  private:
	FixedPoint::NonUniformSplineCurve1D curve;

  public:
	std::vector<FCurveSegment*> segments;
	std::vector<FCurveKnot*> knots;

	FCurve(uint32_t id) : DataBlock(id) {
		auto* knot_1 = new FCurveKnot(FixedPoint::MIN_NUMBER, 0);
		auto* knot_2 = new FCurveKnot(FixedPoint::MAX_NUMBER, 0);
		knots.push_back(knot_1);
		knots.push_back(knot_2);

		auto* seg = new FixedPoint::ConstantNonUniformSplineCurveSegment1D(&(knot_1->x), &(knot_2->x), nullptr);
		auto* fcurve_seg = new FCurveConstantSegment(knot_1, knot_2, seg);
		seg->value = &(knot_1->y);

		this->curve.segments.push_back(seg);
		this->segments.push_back(fcurve_seg);
	}

	constexpr int32_t getSegmentIndexAt(FixedPoint::Number u) const {
		return this->curve.getSegmentIndexAt(u);
	}

	constexpr int32_t getSegmentIndexAtJS(
		FixedPoint::NumberWire u) const {
		return this->getSegmentIndexAt(FixedPoint::Number(u));
	}

	constexpr FCurveSegment* getSegmentAt(FixedPoint::Number u) const {
		int32_t i = this->getSegmentIndexAt(u);
		if (i < 0)
			return nullptr;
		return this->segments[uint32_t(i)];
	}

	constexpr FixedPoint::Number
	sampleNumber(FixedPoint::Number u) const {
		return curve.sample(u);
	}

	constexpr void destroy() const {
		for (auto a : this->segments)
			delete a;
		for (auto a : this->knots)
			delete a;
	}

	constexpr FCurveKnot* knotAt(const FixedPoint::Number& u) const {
		for (FCurveKnot* k : this->knots)
			if (k->x == u)
				return k;
		return nullptr;
	}

	void setValueAtJS(FixedPoint::NumberWire t, FixedPoint::NumberWire val, bool enforce_new_knot);
};

class EnumFCurve : public FCurve {
  private:
	uint32_t max_value;

  public:
	EnumFCurve(uint32_t id, uint32_t val, uint32_t max_value) : FCurve(id), max_value(max_value) {
		knots[0]->y = val;
	}
	inline uint32_t sampleJS(FixedPoint::NumberWire u) const {
		int32_t val = static_cast<int32_t>(sampleNumber(u));
		if (val < 0)
			return 0;
		uint32_t val2 = static_cast<uint32_t>(val);
		if (val2 > max_value)
			return max_value;
		return val2;
	}
};

class NumberFCurve : public FCurve {
  public:
	NumberFCurve(uint32_t id, FixedPoint::NumberWire val) : FCurve(id) {
		knots[0]->y = val;
	}
	inline FixedPoint::NumberWire sampleJS(FixedPoint::NumberWire u) const {
		return static_cast<FixedPoint::NumberWire>(sampleNumber(u));
	}
};

class BooleanFCurve : public FCurve {
  public:
	BooleanFCurve(uint32_t id, bool val) : FCurve(id) {
		knots[0]->y = val ? 1 : 0;
	}
	inline bool sampleJS(FixedPoint::NumberWire u) const {
		return sampleNumber(u) > 0;
	}
};

} // namespace kayo